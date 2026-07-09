"use client";

import { motion } from "motion/react";

/** On-brand emoji "sticker" per question, framed like the section intros. */
const EMOJI: Record<string, string> = {
  name: "📝",
  price: "💶",
  style: "🏷️",
  protein: "🍗",
  patty: "🥩",
  bun: "🍞",
  cheese: "🧀",
  sauce: "🥫",
  build: "🍔",
  value: "💰",
  again: "🔁",
  overall: "⭐",
  ambiance: "✨",
  lighting: "💡",
  service: "🛎️",
  comfort: "🛋️",
  overallJoint: "🏠",
  hunger: "🍽️",
  stress: "😰",
  horny: "🔥",
  beenHere: "📍",
};

export function QuestionArt({
  id,
  value = 50,
  reactive = false,
  size = 132,
}: {
  id: string;
  value?: number;
  reactive?: boolean;
  size?: number;
}) {
  const emoji = EMOJI[id] ?? "🍔";
  // On dial questions the sticker tilts with the score so it still feels alive.
  const tilt = reactive ? ((value - 50) / 50) * 8 : 0;
  return (
    <div className="pp-bob" style={{ display: "grid", placeItems: "center" }}>
      <motion.div
        animate={{ rotate: tilt }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="card-ink grid place-items-center"
        style={{
          width: size,
          height: size,
          borderRadius: 30,
          background: "rgba(255,255,255,.85)",
          boxShadow: "4px 5px 0 rgba(27,23,19,.14)",
        }}
      >
        <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{emoji}</span>
      </motion.div>
    </div>
  );
}
