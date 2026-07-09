import { tier } from "@/lib/scoring";

export function ScoreChip({
  score,
  size = 15,
}: {
  score: number;
  size?: number;
}) {
  const t = tier(score);
  return (
    <span
      className="card-ink inline-grid place-items-center rounded-full font-black"
      style={{
        background: t.bg,
        color: t.fg,
        fontSize: size,
        padding: `${size * 0.4}px ${size * 0.7}px`,
        borderWidth: 2,
      }}
    >
      {score}
    </span>
  );
}

/** Thin breakdown bar with a tier-coloured fill. */
export function ScoreBar({ score, width = 70 }: { score: number; width?: number }) {
  const t = tier(score);
  return (
    <div
      className="overflow-hidden rounded"
      style={{ width, height: 7, background: "rgba(27,23,19,.12)" }}
    >
      <div
        style={{
          width: `${score}%`,
          height: "100%",
          borderRadius: 4,
          background: t.bg,
        }}
      />
    </div>
  );
}
