import Image from "next/image";

type Kind = "envelope" | "stickers";

type BrandIllustrationProps = {
  kind: Kind;
  /** When a real product photo exists, pass it here and it replaces the drawing. */
  photoSrc?: string;
  photoAlt?: string;
  className?: string;
};

/**
 * Soft hand-drawn stand-ins for product photography. They use only the brand
 * palette, so they sit quietly until real photos are added via `photoSrc`.
 */
export function BrandIllustration({ kind, photoSrc, photoAlt = "", className = "" }: BrandIllustrationProps) {
  return (
    <div className={`brand-illustration ${className}`}>
      {photoSrc ? (
        <Image src={photoSrc} alt={photoAlt} fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
      ) : kind === "envelope" ? (
        <EnvelopeDrawing />
      ) : (
        <StickerSheetDrawing />
      )}
    </div>
  );
}

function EnvelopeDrawing() {
  return (
    <svg viewBox="0 0 320 240" role="img" aria-hidden="true" className="h-full w-full">
      <g transform="rotate(-6 160 120)">
        <rect x="58" y="62" width="204" height="128" rx="6" fill="var(--paper)" stroke="var(--chocolate)" strokeWidth="2" />
        <path d="M60 66 L160 136 L260 66" fill="none" stroke="var(--chocolate)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 188 L132 118 M260 188 L188 118" fill="none" stroke="var(--line)" strokeWidth="2" />
        <rect x="214" y="74" width="34" height="40" rx="2" fill="var(--pink-soft)" stroke="var(--pink-deep)" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M231 84 l3 6 7 1 -5 5 1 7 -6-3 -6 3 1-7 -5-5 7-1z" fill="var(--gold)" />
        <circle cx="160" cy="138" r="17" fill="var(--pink-deep)" />
        <path d="M160 128 l2.6 5.4 6 .8 -4.3 4.2 1 5.9 -5.3-2.8 -5.3 2.8 1-5.9 -4.3-4.2 6-.8z" fill="var(--paper)" />
      </g>
      <path d="M44 48 l2 4 4 1 -4 2 -2 4 -2-4 -4-2 4-1z" fill="var(--gold)" />
      <path d="M276 196 l1.6 3.2 3.2.8 -3.2 1.6 -1.6 3.2 -1.6-3.2 -3.2-1.6 3.2-.8z" fill="var(--pink-deep)" />
    </svg>
  );
}

function StickerSheetDrawing() {
  return (
    <svg viewBox="0 0 320 240" role="img" aria-hidden="true" className="h-full w-full">
      <g transform="rotate(5 160 120)">
        <rect x="88" y="34" width="144" height="176" rx="10" fill="var(--paper)" stroke="var(--chocolate)" strokeWidth="2" />
        <path d="M128 70 l6 12 13 2 -9.5 9 2.2 13 -11.7-6.2 -11.7 6.2 2.2-13 -9.5-9 13-2z" fill="var(--gold)" stroke="var(--chocolate)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M196 96 c-10-12 -26-2 -18 10 l18 18 18-18 c8-12 -8-22 -18-10z" fill="var(--pink)" stroke="var(--chocolate)" strokeWidth="1.5" />
        <circle cx="136" cy="150" r="16" fill="var(--pink-soft)" stroke="var(--chocolate)" strokeWidth="1.5" />
        <path d="M130 147 q6 8 12 0" fill="none" stroke="var(--chocolate)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="131" cy="143" r="1.6" fill="var(--chocolate)" />
        <circle cx="141" cy="143" r="1.6" fill="var(--chocolate)" />
        <rect x="170" y="140" width="38" height="26" rx="3" fill="var(--cream)" stroke="var(--chocolate)" strokeWidth="1.5" />
        <path d="M170 142 l19 13 19-13" fill="none" stroke="var(--chocolate)" strokeWidth="1.5" />
        <path d="M118 184 l3 6 6 1 -4.5 4.3 1 6 -5.5-2.9 -5.5 2.9 1-6 -4.5-4.3 6-1z" fill="var(--pink-deep)" />
        <path d="M194 182 l2 4 4 .5 -3 3 .7 4 -3.7-2 -3.7 2 .7-4 -3-3 4-.5z" fill="var(--gold)" />
      </g>
      <path d="M58 70 l2 4 4 1 -4 2 -2 4 -2-4 -4-2 4-1z" fill="var(--pink-deep)" />
      <path d="M262 176 l1.6 3.2 3.2.8 -3.2 1.6 -1.6 3.2 -1.6-3.2 -3.2-1.6 3.2-.8z" fill="var(--gold)" />
    </svg>
  );
}
