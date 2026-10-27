import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

export interface ZipEntryInput {
  relativePath: string;
  data: Buffer;
  mtime?: Date;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function computeCrc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.min(2107, Math.max(1980, date.getUTCFullYear()));
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  const dosTime = ((hours & 0x1f) << 11) | ((minutes & 0x3f) << 5) | ((seconds >> 1) & 0x1f);
  const dosDate = (((year - 1980) & 0x7f) << 9) | ((month & 0x0f) << 5) | (day & 0x1f);
  return { dosTime, dosDate };
}

const ALREADY_COMPRESSED_EXTS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.woff',
  '.woff2',
  '.zip',
  '.mp4',
]);

export function createZipBuffer(entries: ZipEntryInput[]): Buffer {
  const localChunks: Buffer[] = [];
  const centralChunks: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const normalizedPath = entry.relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const nameBuf = Buffer.from(normalizedPath, 'utf8');
    const uncompressedBuf = entry.data;
    const uncompressedSize = uncompressedBuf.length;
    const crc = computeCrc32(uncompressedBuf);

    const ext = path.extname(normalizedPath).toLowerCase();
    let method = 0;
    let payloadBuf = uncompressedBuf;

    if (uncompressedSize > 64 && !ALREADY_COMPRESSED_EXTS.has(ext)) {
      const deflated = zlib.deflateRawSync(uncompressedBuf, { level: 6 });
      if (deflated.length < uncompressedSize) {
        method = 8;
        payloadBuf = deflated;
      }
    }

    const compressedSize = payloadBuf.length;
    const { dosTime, dosDate } = toDosDateTime(entry.mtime ?? new Date());

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // Version needed (2.0)
    localHeader.writeUInt16LE(0x0800, 6); // Bit 11 = UTF-8 filenames
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // Extra length
    nameBuf.copy(localHeader, 30);

    localChunks.push(localHeader, payloadBuf);

    // Central directory header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // Version made by
    centralHeader.writeUInt16LE(20, 6); // Version needed
    centralHeader.writeUInt16LE(0x0800, 8); // Bit 11 = UTF-8 filenames
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // Extra length
    centralHeader.writeUInt16LE(0, 32); // File comment length
    centralHeader.writeUInt16LE(0, 34); // Disk number start
    centralHeader.writeUInt16LE(0, 36); // Internal attributes
    centralHeader.writeUInt32LE(0, 38); // External attributes
    centralHeader.writeUInt32LE(localOffset, 42);
    nameBuf.copy(centralHeader, 46);

    centralChunks.push(centralHeader);
    localOffset += localHeader.length + compressedSize;
  }

  const centralDirectorySize = centralChunks.reduce((acc, chunk) => acc + chunk.length, 0);

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectorySize, 12);
  eocd.writeUInt32LE(localOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, ...centralChunks, eocd]);
}

const IGNORED_SOURCE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.aistudio',
  '.cache',
]);

const IGNORED_SOURCE_FILES = new Set([
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  'bun.lock',
  'package-lock.json',
  'server.js',
  '.DS_Store',
]);

function walkDirectory(
  baseDir: string,
  currentDir: string,
  ignoreDirs: Set<string>,
  ignoreFiles: Set<string>,
  acc: ZipEntryInput[]
): void {
  const dirEntries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const item of dirEntries) {
    if (item.isDirectory()) {
      if (ignoreDirs.has(item.name)) continue;
      walkDirectory(baseDir, path.join(currentDir, item.name), ignoreDirs, ignoreFiles, acc);
    } else if (item.isFile()) {
      if (ignoreFiles.has(item.name)) continue;
      if (item.name.startsWith('.env.') && item.name !== '.env.example') continue;
      const fullPath = path.join(currentDir, item.name);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      acc.push({
        relativePath,
        data: fs.readFileSync(fullPath),
        mtime: stat.mtime,
      });
    }
  }
}

export function buildProjectSourceZip(workspaceRoot: string): Buffer {
  const entries: ZipEntryInput[] = [];
  walkDirectory(workspaceRoot, workspaceRoot, IGNORED_SOURCE_DIRS, IGNORED_SOURCE_FILES, entries);
  return createZipBuffer(entries);
}

export function buildNetlifyDistZip(workspaceRoot: string): Buffer | null {
  const distDir = path.join(workspaceRoot, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    return null;
  }

  const entries: ZipEntryInput[] = [];
  walkDirectory(distDir, distDir, new Set(['.DS_Store']), new Set(['.DS_Store']), entries);

  const hasRedirects = entries.some((e) => e.relativePath === '_redirects');
  if (!hasRedirects) {
    entries.push({
      relativePath: '_redirects',
      data: Buffer.from('/* /index.html 200\n', 'utf8'),
      mtime: new Date(),
    });
  }

  return createZipBuffer(entries);
}
