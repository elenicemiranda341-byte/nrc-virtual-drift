import { useState } from 'react';

export const NRC_OFFICIAL_LOGO_PATH = '/assets/aistudio/1792581259182_8c3ec9bd.jpg';

interface NrcLogoProps {
  variant?: 'wordmark' | 'emblem';
  className?: string;
}

export function NrcLogo({ variant = 'wordmark', className = '' }: NrcLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (variant === 'wordmark') {
    return (
      <span
        className={`inline-flex items-center gap-3 font-display font-bold tracking-wider text-[#F1F3F5] ${className}`}
      >
        {!imgError ? (
          <span className="inline-flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#232830] bg-black">
            <img
              src={NRC_OFFICIAL_LOGO_PATH}
              alt="Logo oficial NRC — Negative Rotation Crew"
              onError={() => setImgError(true)}
              className="h-full w-full scale-125 object-cover object-center"
            />
          </span>
        ) : (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#39FF14]/50 bg-[#111317] text-sm font-bold text-[#39FF14]">
            NRC
          </span>
        )}
        <span className="text-2xl leading-none tracking-tight">NRC DRIFT</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      {!imgError ? (
        <div className="overflow-hidden rounded-xl border border-[#232830] bg-black">
          <img
            src={NRC_OFFICIAL_LOGO_PATH}
            alt="Logo oficial NRC — Negative Rotation Crew"
            onError={() => setImgError(true)}
            className="h-auto w-full max-w-[320px] object-contain sm:max-w-[380px]"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[#232830] bg-[#111317] px-5 py-3">
          <span className="font-display text-3xl font-bold tracking-wide text-[#F1F3F5]">
            NRC <span className="text-[#39FF14]">NEGATIVE ROTATION CREW</span>
          </span>
        </div>
      )}
    </div>
  );
}
