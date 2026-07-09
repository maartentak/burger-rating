"use client";

import { motion } from "motion/react";

export function BackButton({
  onClick,
  dark = false,
}: {
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      aria-label="Back"
      className="card-ink grid h-[42px] w-[42px] place-items-center rounded-full font-extrabold"
      style={{
        background: dark ? "rgba(255,255,255,.7)" : "#FFFDF7",
        fontSize: 18,
        color: "#1B1713",
      }}
    >
      ←
    </motion.button>
  );
}
