"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { SEASONS } from "@/lib/seasons";

export default function SeasonsPage() {
  const router = useRouter();
  return (
    <PhoneShell>
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/")} />
        <span className="eyebrow">THE ARCHIVE</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
          Previous seasons
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
          Every era the patrol has judged. Burgers are just the latest obsession.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          {SEASONS.map((s, i) => (
            <motion.button
              key={s.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/seasons/${s.slug}`)}
              className="card-ink flex items-center gap-4 rounded-3xl px-5 py-5 text-left"
              style={{ background: "#A5B45B", boxShadow: "4px 5px 0 rgba(27,23,19,.2)" }}
            >
              <div style={{ fontSize: 44 }}>{s.emoji}</div>
              <div className="flex-1">
                <div className="font-black text-ink" style={{ fontSize: 22 }}>{s.title}</div>
                <div className="font-bold" style={{ fontSize: 13, color: "rgba(27,23,19,.65)" }}>
                  {s.cuisine} · {s.dateRange}
                </div>
                <div className="mt-1 font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.6)" }}>
                  {s.blurb}
                </div>
              </div>
              <div className="font-black text-ink" style={{ fontSize: 24 }}>→</div>
            </motion.button>
          ))}
        </div>

        <p className="mt-5 text-center font-semibold" style={{ fontSize: 12, color: "rgba(27,23,19,.4)" }}>
          More seasons appear here as the patrol changes cuisine. 🍜🌮🍣
        </p>
      </div>
    </PhoneShell>
  );
}
