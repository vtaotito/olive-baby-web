export function OlieLogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-lg bg-olive-600 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} aria-hidden>
        <path
          d="M12 21 C10 19 4 14 4 9 C4 5 7 3 10 3 C12 3 14 5 15 6 C16 5 18 3 20 3 C23 3 26 5 26 9 C26 14 20 19 18 21 Z"
          fill="#f7f8f3"
          transform="scale(0.85) translate(2 1)"
        />
      </svg>
    </div>
  );
}
