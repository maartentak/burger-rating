/* Inline SVG artwork copied from the design handoff. No external images. */

export function Mascot({
  value = 78,
  size = 180,
  bob = true,
  className = "",
}: {
  /** 0-100 dial value; drives the mouth from frown to grin. */
  value?: number;
  size?: number;
  bob?: boolean;
  className?: string;
}) {
  const height = Math.round((size * 142) / 180);
  const mouth = `M85 74 Q100 ${62 + value * 0.26} 115 74`;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 200 156"
      className={`${bob ? "pp-bob" : ""} ${className}`}
      style={{ display: "block" }}
      aria-hidden
    >
      <path d="M22 88 C22 34 178 34 178 88 Z" fill="#EFAF5F" />
      <ellipse cx="62" cy="50" rx="5.5" ry="3" fill="#FFF6E3" transform="rotate(-18 62 50)" />
      <ellipse cx="100" cy="42" rx="5.5" ry="3" fill="#FFF6E3" />
      <ellipse cx="138" cy="50" rx="5.5" ry="3" fill="#FFF6E3" transform="rotate(18 138 50)" />
      <rect x="22" y="94" width="156" height="20" rx="10" fill="#5D3A22" />
      <path
        d="M22 88 L178 88 L178 94 L156 94 L146 106 L136 94 L104 94 L94 106 L84 94 L22 94 Z"
        fill="#F5C445"
      />
      <rect x="26" y="118" width="148" height="18" rx="9" fill="#EFAF5F" />
      <circle cx="72" cy="64" r="13" fill="#fff" />
      <circle cx="128" cy="64" r="13" fill="#fff" />
      <circle cx="74" cy="66" r="6" fill="#1B1713" />
      <circle cx="126" cy="66" r="6" fill="#1B1713" />
      <path d={mouth} fill="none" stroke="#1B1713" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** Small logo mark used in headers. */
export function LogoBurger({ size = 30 }: { size?: number }) {
  const height = Math.round((size * 24) / 30);
  return (
    <svg width={size} height={height} viewBox="0 0 200 156" aria-hidden>
      <path d="M22 88 C22 34 178 34 178 88 Z" fill="#EE5A29" />
      <rect x="22" y="94" width="156" height="20" rx="10" fill="#5D3A22" />
      <rect x="26" y="118" width="148" height="18" rx="9" fill="#EE5A29" />
      <circle cx="72" cy="64" r="13" fill="#fff" />
      <circle cx="128" cy="64" r="13" fill="#fff" />
      <circle cx="74" cy="66" r="6" fill="#1B1713" />
      <circle cx="126" cy="66" r="6" fill="#1B1713" />
    </svg>
  );
}

/** Little burger icon used on breakdown rows. */
export function BurgerIcon({ size = 34 }: { size?: number }) {
  const height = Math.round((size * 27) / 34);
  return (
    <svg width={size} height={height} viewBox="0 0 200 156" aria-hidden>
      <path d="M22 88 C22 34 178 34 178 88 Z" fill="#EFAF5F" />
      <rect x="22" y="94" width="156" height="20" rx="10" fill="#5D3A22" />
      <path
        d="M22 88 L178 88 L178 94 L156 94 L146 106 L136 94 L104 94 L94 106 L84 94 L22 94 Z"
        fill="#F5C445"
      />
      <rect x="26" y="118" width="148" height="18" rx="9" fill="#EFAF5F" />
    </svg>
  );
}

/** Simple face for podium heads. mood: smile | neutral | grin */
export function Face({
  mood = "smile",
  size = 26,
}: {
  mood?: "smile" | "neutral" | "grin";
  size?: number;
}) {
  const height = Math.round((size * 16) / 26);
  return (
    <svg width={size} height={height} viewBox="0 0 52 32" aria-hidden>
      <circle cx="16" cy="12" r="8" fill="#fff" />
      <circle cx="36" cy="12" r="8" fill="#fff" />
      <circle cx="17" cy="13" r="3.5" fill="#1B1713" />
      <circle cx="35" cy="13" r="3.5" fill="#1B1713" />
      {mood === "neutral" ? (
        <path d="M18 25 L34 25" fill="none" stroke="#1B1713" strokeWidth="3.5" strokeLinecap="round" />
      ) : mood === "grin" ? (
        <path d="M17 22 Q26 32 35 22" fill="none" stroke="#1B1713" strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M18 24 Q26 30 34 24" fill="none" stroke="#1B1713" strokeWidth="3.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Crown({ size = 30 }: { size?: number }) {
  const height = Math.round((size * 16) / 30);
  return (
    <svg width={size} height={height} viewBox="0 0 60 32" aria-hidden>
      <path
        d="M6 28 L10 8 L22 20 L30 4 L38 20 L50 8 L54 28 Z"
        fill="#EE5A29"
        stroke="#1B1713"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
