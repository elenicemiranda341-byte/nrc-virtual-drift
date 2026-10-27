import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export const NRC_TESTEIRA_LIVERY_CODE = `FFFFFE430000003C003C005AFFFFFFFF0009
<
    FFFF00000000006400640000FFFFFFFF0001
    <
        000200000010006D030F005A00FF2BFF0001
        00080133006E015A009A00B400FF16FF0003
        00020000000000680306005AFFFFFFFF0001
        000801270057015A009A00B4FFFFFFFF0003
        000200000000005E02FA005A000000FF0001
        000801270053013E008E00B4000000FF0003
        FFFFFFFA003F003200320000FFFFFFFF0109
        <
            00020000FF1A00270266005AFFFFFF000701
            0002000000EE00270266005AFFFFFF000701
        >
        00020006FFD90011008F005A000000FF0001
        000200A4FFD30011008F005A000000FF0001
        0002FEF6FFD90011008F005A000000FF0001
        0002FEBAFFDB002300950026000000FF0001
        000201DAFFC9002300950026000000FF0001
        000201DAFF68002300950026000000FF0001
        000201A8FF69002300950026000000FF0001
        000201B3005E001300520026000000FF0001
        001401F8001500B0006F00B4238824140003
        00020316FFE7007A000D004BFFFFFFFF0003
        0002032D0000007A000D004B05FF00FF0003
        00140113FFF5005E003B00B4238824140003
        00020000FEB100A202D7005A000000000701
        FFFFFF2D003600CD00C800B4FFFFFFFF0001
        <
            04000000000000640064FF4CFFFFFFFF0001
            FFFFFF9A000000640064FF4CFFFFFFFF0001
            <
                040400000000006400640000FFFFFFFF0001
                03F50066000000640064000005FF00FF0001
            >
        >
        000F01B8003F00110068005A585858FF0003
    >
    000700A0003B0026007B00AA1B9C11FF0001
>
00020097000001A70064FFA6000000FF0001
00020081001101D60006FFA6FF0000FF0001`;

export function WindowBannerSection() {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleCopyCode = async () => {
    let success = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(NRC_TESTEIRA_LIVERY_CODE);
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
          el.setSelectionRange(0, NRC_TESTEIRA_LIVERY_CODE.length);
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
      id="testeira"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Instructions & Copy Action */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
                Padronização Oficial do Grid
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
                Testeira Oficial NRC Virtual Drift
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#949CA8]">
                Copie o código oficial da testeira de para-brisa do campeonato e aplique no vidro do
                seu carro dentro do FR Legends antes de entrar no lobby oficial.
              </p>

              {/* Step-by-Step Guide */}
              <dl className="mt-6 divide-y divide-[#232830] border-t border-b border-[#232830] text-sm">
                <div className="py-3.5">
                  <dt className="font-mono text-xs font-semibold text-[#39FF14]">Passo 01</dt>
                  <dd className="mt-0.5 text-[#D0D6DE]">
                    Clique no botão <strong className="text-[#F1F3F5]">Copiar Código da Testeira</strong> para copiar todas as camadas automaticamente.
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="font-mono text-xs font-semibold text-[#39FF14]">Passo 02</dt>
                  <dd className="mt-0.5 text-[#D0D6DE]">
                    No FR Legends, abra a oficina de pintura e selecione a área de{' '}
                    <strong className="text-[#F1F3F5]">Vidros (Window)</strong>.
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="font-mono text-xs font-semibold text-[#39FF14]">Passo 03</dt>
                  <dd className="mt-0.5 text-[#D0D6DE]">
                    Toque em <strong className="text-[#F1F3F5]">Importar (Import)</strong>, cole o
                    código copiado e confirme a aplicação no para-brisa.
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
                    <span>Copiar Código da Testeira</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Verbatim FR Legends Livery Code Box */}
          <div className="flex flex-col rounded-xl border border-[#232830] bg-[#111317] overflow-hidden lg:col-span-7">
            <div className="flex items-center justify-between gap-4 border-b border-[#232830] bg-[#090A0C] px-5 py-3.5">
              <div className="text-xs font-semibold text-[#D0D6DE]">
                Código de Importação FR Legends · Vidro / Para-brisa
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
              <label htmlFor="nrc-testeira-code" className="sr-only">
                Código oficial da testeira NRC para FR Legends
              </label>
              <textarea
                id="nrc-testeira-code"
                ref={textareaRef}
                readOnly
                rows={14}
                value={NRC_TESTEIRA_LIVERY_CODE}
                onClick={(e) => e.currentTarget.select()}
                className="w-full resize-none rounded-lg border border-[#232830] bg-[#090A0C] p-4 font-mono text-xs leading-relaxed text-[#D0D6DE] selection:bg-[#39FF14] selection:text-[#090A0C] focus:border-[#39FF14]"
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#68707C]">
                <span>Toque em Copiar ou clique no bloco para selecionar tudo</span>
                <span className="font-mono tabular-nums">43 linhas · Formato original FR Legends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
