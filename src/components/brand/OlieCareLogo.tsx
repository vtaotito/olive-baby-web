interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = '', size = 36 }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="512" height="512" rx="108" fill="#738251" />
      <g transform="translate(256,250)">
        <path
          d="M0,105 C-55,70 -135,-10 -115,-75 C-100,-120 -55,-125 -15,-90 L0,-75 L15,-90 C55,-125 100,-120 115,-75 C135,-10 55,70 0,105Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M0,-55 Q-8,15 0,70"
          fill="none"
          stroke="#738251"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M0,0 Q-30,-15 -40,-40"
          fill="none"
          stroke="#738251"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M0,0 Q30,-15 40,-40"
          fill="none"
          stroke="#738251"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

interface LogoMarkProps {
  className?: string;
  size?: number;
  color?: string;
}

export function LogoMark({ className = '', size = 32, color = '#738251' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 230 250"
      width={size}
      height={(size * 250) / 230}
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(115,135)">
        <path
          d="M0,105 C-55,70 -135,-10 -115,-75 C-100,-120 -55,-125 -15,-90 L0,-75 L15,-90 C55,-125 100,-120 115,-75 C135,-10 55,70 0,105Z"
          fill={color}
        />
        <path
          d="M0,-55 Q-8,15 0,70"
          fill="none"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M0,0 Q-30,-15 -40,-40"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M0,0 Q30,-15 40,-40"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
