import { asc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { championshipSettings, registrations } from './schema.ts';
import {
  CATEGORY_TRACKS,
  type ChampionshipSettingsData,
  type ChampionshipStatePayload,
  type ChampionshipStats,
  type CreateRegistrationInput,
  type DriftCategoryType,
  type PilotRegistration,
  type UpdateSettingsInput,
} from '../types/championship.ts';

export class ChampionshipDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ChampionshipDomainError';
    this.statusCode = statusCode;
  }
}

function normalizeNickname(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeFrLegendsId(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

function formatRegistrationRow(row: typeof registrations.$inferSelect): PilotRegistration {
  const category: DriftCategoryType = row.category === 'PRO' ? 'PRO' : 'STREET';
  return {
    id: row.id,
    pilotName: row.pilotName,
    nickname: row.nickname,
    frLegendsId: row.frLegendsId,
    carModel: row.carModel,
    category,
    track: row.track,
    createdAt: row.createdAt.toISOString(),
  };
}

function computeStats(
  settings: ChampionshipSettingsData,
  list: PilotRegistration[]
): ChampionshipStats {
  const totalRegistered = list.length;
  const proRegistered = list.filter((item) => item.category === 'PRO').length;
  const streetRegistered = list.filter((item) => item.category === 'STREET').length;

  const remainingPro = Math.max(0, settings.proMaxSpots - proRegistered);
  const remainingStreet = Math.max(0, settings.streetMaxSpots - streetRegistered);
  const remainingByTotalCap = Math.max(0, settings.totalMaxSpots - totalRegistered);
  const remainingTotal = Math.min(remainingByTotalCap, remainingPro + remainingStreet);

  const isEffectivelyOpen = settings.isOpen && remainingTotal > 0;
  const occupancyPercent =
    settings.totalMaxSpots > 0
      ? Math.min(100, Math.round((totalRegistered / settings.totalMaxSpots) * 100))
      : 100;

  const latestRegistrationAt =
    list.length > 0 ? list[list.length - 1].createdAt : null;

  return {
    totalRegistered,
    proRegistered,
    streetRegistered,
    remainingTotal,
    remainingPro: Math.min(remainingPro, remainingByTotalCap),
    remainingStreet: Math.min(remainingStreet, remainingByTotalCap),
    isEffectivelyOpen,
    occupancyPercent,
    latestRegistrationAt,
  };
}

export async function getChampionshipState(): Promise<ChampionshipStatePayload> {
  try {
    let settingsRows = await db
      .select()
      .from(championshipSettings)
      .where(eq(championshipSettings.id, 1));

    if (settingsRows.length === 0) {
      settingsRows = await db
        .insert(championshipSettings)
        .values({
          id: 1,
          isOpen: true,
          totalMaxSpots: 32,
          proMaxSpots: 16,
          streetMaxSpots: 16,
        })
        .onConflictDoNothing()
        .returning();

      if (settingsRows.length === 0) {
        settingsRows = await db
          .select()
          .from(championshipSettings)
          .where(eq(championshipSettings.id, 1));
      }
    }

    const rawSettings = settingsRows[0];
    const settings: ChampionshipSettingsData = {
      isOpen: rawSettings.isOpen,
      totalMaxSpots: rawSettings.totalMaxSpots,
      proMaxSpots: rawSettings.proMaxSpots,
      streetMaxSpots: rawSettings.streetMaxSpots,
      updatedAt: rawSettings.updatedAt.toISOString(),
    };

    const rawRegistrations = await db
      .select()
      .from(registrations)
      .orderBy(asc(registrations.createdAt), asc(registrations.id));

    const formattedRegistrations = rawRegistrations.map(formatRegistrationRow);
    const stats = computeStats(settings, formattedRegistrations);

    return {
      settings,
      registrations: formattedRegistrations,
      stats,
      serverTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Database query failed in getChampionshipState:', error);
    throw new Error('Não foi possível carregar os dados do campeonato no momento.', {
      cause: error,
    });
  }
}

export async function createPilotRegistration(
  input: CreateRegistrationInput,
  userUid?: string | null
): Promise<PilotRegistration> {
  const pilotName = (input.pilotName ?? '').trim().replace(/\s+/g, ' ');
  const nickname = (input.nickname ?? '').trim().replace(/\s+/g, ' ');
  const frLegendsId = (input.frLegendsId ?? '').trim().replace(/\s+/g, '');
  const carModel = (input.carModel ?? '').trim().replace(/\s+/g, ' ');
  const category = input.category;

  if (pilotName.length < 2 || pilotName.length > 60) {
    throw new ChampionshipDomainError('Informe um nome válido entre 2 e 60 caracteres.', 400);
  }
  if (nickname.length < 2 || nickname.length > 30) {
    throw new ChampionshipDomainError('Informe um Nickname válido entre 2 e 30 caracteres.', 400);
  }
  if (!/^[a-zA-Z0-9_#-]{3,24}$/.test(frLegendsId)) {
    throw new ChampionshipDomainError(
      'Informe um ID do FR Legends válido (3 a 24 caracteres alfanuméricos).',
      400
    );
  }
  if (carModel.length < 2 || carModel.length > 50) {
    throw new ChampionshipDomainError(
      'Informe o carro que você usará no campeonato (entre 2 e 50 caracteres).',
      400
    );
  }
  if (category !== 'PRO' && category !== 'STREET') {
    throw new ChampionshipDomainError('Selecione uma categoria válida: PRO ou STREET.', 400);
  }

  const nicknameNormalized = normalizeNickname(nickname);
  const frLegendsIdNormalized = normalizeFrLegendsId(frLegendsId);
  const assignedTrack = CATEGORY_TRACKS[category];

  try {
    return await db.transaction(async (tx) => {
      let settingsRows = await tx
        .select()
        .from(championshipSettings)
        .where(eq(championshipSettings.id, 1))
        .for('update');

      if (settingsRows.length === 0) {
        await tx
          .insert(championshipSettings)
          .values({
            id: 1,
            isOpen: true,
            totalMaxSpots: 32,
            proMaxSpots: 16,
            streetMaxSpots: 16,
          })
          .onConflictDoNothing();

        settingsRows = await tx
          .select()
          .from(championshipSettings)
          .where(eq(championshipSettings.id, 1))
          .for('update');
      }

      const settings = settingsRows[0];
      if (!settings.isOpen) {
        throw new ChampionshipDomainError(
          'As inscrições para o campeonato NRC estão encerradas no momento.',
          403
        );
      }

      const currentPilots = await tx.select().from(registrations);
      const totalCount = currentPilots.length;
      const categoryCount = currentPilots.filter((p) => p.category === category).length;

      if (totalCount >= settings.totalMaxSpots) {
        throw new ChampionshipDomainError(
          'Todas as vagas gerais do campeonato estão esgotadas.',
          409
        );
      }

      const maxCategorySpots =
        category === 'PRO' ? settings.proMaxSpots : settings.streetMaxSpots;

      if (categoryCount >= maxCategorySpots) {
        throw new ChampionshipDomainError(
          `As vagas da categoria ${category} (${assignedTrack}) estão esgotadas.`,
          409
        );
      }

      const duplicateNickname = currentPilots.some(
        (p) => p.nicknameNormalized === nicknameNormalized
      );
      if (duplicateNickname) {
        throw new ChampionshipDomainError(
          'Este Nickname já possui inscrição confirmada no campeonato.',
          409
        );
      }

      const duplicateFrId = currentPilots.some(
        (p) => p.frLegendsIdNormalized === frLegendsIdNormalized
      );
      if (duplicateFrId) {
        throw new ChampionshipDomainError(
          'Este ID do FR Legends já possui inscrição confirmada no campeonato.',
          409
        );
      }

      const inserted = await tx
        .insert(registrations)
        .values({
          pilotName,
          nickname,
          nicknameNormalized,
          frLegendsId,
          frLegendsIdNormalized,
          carModel,
          category,
          track: assignedTrack,
          userUid: userUid || null,
        })
        .returning();

      return formatRegistrationRow(inserted[0]);
    });
  } catch (error: unknown) {
    if (error instanceof ChampionshipDomainError) {
      throw error;
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      throw new ChampionshipDomainError(
        'Nickname ou ID do FR Legends já está cadastrado no campeonato.',
        409
      );
    }
    console.error('Database transaction failed in createPilotRegistration:', error);
    throw new Error('Não foi possível registrar sua inscrição no momento. Tente novamente.', {
      cause: error,
    });
  }
}

export async function deletePilotRegistration(id: number): Promise<PilotRegistration> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ChampionshipDomainError('ID de inscrição inválido.', 400);
  }

  try {
    const deleted = await db
      .delete(registrations)
      .where(eq(registrations.id, id))
      .returning();

    if (deleted.length === 0) {
      throw new ChampionshipDomainError('Inscrição não encontrada.', 404);
    }

    return formatRegistrationRow(deleted[0]);
  } catch (error) {
    if (error instanceof ChampionshipDomainError) {
      throw error;
    }
    console.error('Database delete failed in deletePilotRegistration:', error);
    throw new Error('Não foi possível excluir a inscrição selecionada.', {
      cause: error,
    });
  }
}

export async function updateChampionshipSettings(
  input: UpdateSettingsInput
): Promise<ChampionshipSettingsData> {
  try {
    return await db.transaction(async (tx) => {
      const existingRows = await tx
        .select()
        .from(championshipSettings)
        .where(eq(championshipSettings.id, 1))
        .for('update');

      const current = existingRows[0] ?? {
        id: 1,
        isOpen: true,
        totalMaxSpots: 32,
        proMaxSpots: 16,
        streetMaxSpots: 16,
        updatedAt: new Date(),
      };

      const nextIsOpen =
        typeof input.isOpen === 'boolean' ? input.isOpen : current.isOpen;
      const nextProMax =
        input.proMaxSpots !== undefined ? Number(input.proMaxSpots) : current.proMaxSpots;
      const nextStreetMax =
        input.streetMaxSpots !== undefined ? Number(input.streetMaxSpots) : current.streetMaxSpots;
      const nextTotalMax =
        input.totalMaxSpots !== undefined
          ? Number(input.totalMaxSpots)
          : nextProMax + nextStreetMax;

      if (
        !Number.isInteger(nextTotalMax) ||
        nextTotalMax < 1 ||
        nextTotalMax > 500 ||
        !Number.isInteger(nextProMax) ||
        nextProMax < 0 ||
        nextProMax > 500 ||
        !Number.isInteger(nextStreetMax) ||
        nextStreetMax < 0 ||
        nextStreetMax > 500
      ) {
        throw new ChampionshipDomainError(
          'Os limites de vagas devem ser números inteiros válidos (máximo 500).',
          400
        );
      }

      const updatedRows = await tx
        .insert(championshipSettings)
        .values({
          id: 1,
          isOpen: nextIsOpen,
          totalMaxSpots: nextTotalMax,
          proMaxSpots: nextProMax,
          streetMaxSpots: nextStreetMax,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: championshipSettings.id,
          set: {
            isOpen: nextIsOpen,
            totalMaxSpots: nextTotalMax,
            proMaxSpots: nextProMax,
            streetMaxSpots: nextStreetMax,
            updatedAt: new Date(),
          },
        })
        .returning();

      const updated = updatedRows[0];
      return {
        isOpen: updated.isOpen,
        totalMaxSpots: updated.totalMaxSpots,
        proMaxSpots: updated.proMaxSpots,
        streetMaxSpots: updated.streetMaxSpots,
        updatedAt: updated.updatedAt.toISOString(),
      };
    });
  } catch (error) {
    if (error instanceof ChampionshipDomainError) {
      throw error;
    }
    console.error('Database update failed in updateChampionshipSettings:', error);
    throw new Error('Não foi possível atualizar as configurações do campeonato.', {
      cause: error,
    });
  }
}
