import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export const NRC_ID_LIVERY_CODE = `FFFF0056025C000C000CFFFFFFFFFFFF0009
<
    00020000000000800314005A4BFF00FF0001
    000200000000007E02EF005AFFFFFFFF0001
    021700030066018300BF0000FFFFFFFF0601
    00020000FF5A00060314005A4BFF00FF0001
    0002000000AB00060314005A07FF00FF0001
    FFFFFDAAFFFB002500290000FFFFFFFF0109
    <
        00020000FF1A00270266005AFFFFFF000701
        0002000000EE00270266005AFFFFFF000701
    >
    0400FCB1000100B700B7000007FF00FF0101
    0404FD6D000000BA00BA0000FFFFFFFF0001
    03F5FE1A000100B100B10000FFFFFFFF0001
>`;

export function IdPlateSection() {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleCopyCode = async () => {
    let success = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(NRC_ID_LIVERY_CODE);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success) {
      try {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.select();
          el.setSelectionRange(0, NRC_ID_LIVERY_CODE.length);
          success = document.execCommand('copy');
        }
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  return (
    <section
      id="id-oficial"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Instructions & Copy Action */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
                Identificação Oficial de Competidor
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
                ID Oficial do Campeonato NRC
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#949CA8]">
                Copie o código oficial do adesivo de ID da NRC e importe diretamente na pintura do
                seu carro no FR Legends para padronizar sua identificação visual nas baterias.
              </p>

              <dl className="mt-6 divide-y divide-[#232830] border-t border-b border-[#232830] text-sm">
                <div className="py-3.5">
                  <dt className="font-mono text-xs font-semibold text-[#39FF14]">Passo 01</dt>
                  <dd className="mt-0.5 text-[#D0D6DE]">
                    Clique em <strong className="text-[#F1F3F5]">Copiar Código do ID</strong> abaixo
                    para copiar todas as camadas no formato original.
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="font-mono text-xs font-semibold text-[#39FF14]">Passo 02</dt>
                  <dd className="mt-0.5 text-[#D0D6DE]">
                    No FR Legends, abra o editor de pintura da{' '}
                    <strong className="text-[#F1F3F5]">Carroceria (Body)</strong> ou vidro conforme
                    orientado pela direção de prova.
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="font-mono text-xs font-semibold text-[#39FF14]">Passo 03</dt>
                  <dd className="mt-0.5 text-[#D0D6DE]">
                    Toque em <strong className="text-[#F1F3F5]">Importar (Import)</strong>, cole o
                    código copiado e confirme a aplicação do adesivo de ID NRC.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#39FF14] px-6 py-3 text-sm font-bold text-[#090A0C] transition-colors duration-150 hover:bg-[#32E010] whitespace-nowrap shrink-0 cursor-pointer sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Código Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Copiar Código do ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Verbatim FR Legends ID Decal Code Box */}
          <div className="flex flex-col rounded-xl border border-[#232830] bg-[#111317] overflow-hidden lg:col-span-7">
            <div className="flex items-center justify-between gap-4 border-b border-[#232830] bg-[#090A0C] px-5 py-3.5">
              <div className="text-xs font-semibold text-[#D0D6DE]">
                Código de Importação FR Legends · Placa de ID NRC
              </div>

              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[#232830] bg-[#171A20] px-3 py-1.5 text-xs font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#39FF14]" aria-hidden="true" />
                    <span className="text-[#39FF14]">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#39FF14]" aria-hidden="true" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <label htmlFor="nrc-id-livery-code" className="sr-only">
                Código oficial do ID NRC para FR Legends
              </label>
              <textarea
                id="nrc-id-livery-code"
                ref={textareaRef}
                readOnly
                rows={14}
                value={NRC_ID_LIVERY_CODE}
                onClick={(e) => e.currentTarget.select()}
                className="w-full resize-none rounded-lg border border-[#232830] bg-[#090A0C] p-4 font-mono text-xs leading-relaxed text-[#D0D6DE] selection:bg-[#39FF14] selection:text-[#090A0C] focus:border-[#39FF14]"
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#68707C]">
                <span>Toque em Copiar ou clique no bloco para selecionar tudo</span>
                <span className="font-mono tabular-nums">16 linhas · Formato original FR Legends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
