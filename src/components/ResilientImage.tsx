import { useState } from 'react';
import { Flag } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  fallbackLabel: string;
  className?: string;
}

export function ResilientImage({
  src,
  alt,
  fallbackLabel,
  className = '',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#171A20] via-[#111317] to-[#090A0C] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Flag className="mb-2 h-8 w-8 text-[#39FF14]" aria-hidden="true" />
        <span className="font-display text-lg font-semibold tracking-wide text-[#F1F3F5]">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
