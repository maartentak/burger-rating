"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { AppHeader } from "@/components/AppHeader";
import { DemoBanner } from "@/components/DemoBanner";
import { PhoneShell } from "@/components/PhoneShell";
import { Avatar } from "@/components/Avatar";
import { Mascot } from "@/components/art";

export default function HomePage() {
  const { curators, active, activeId, setActive, demo, loading } = useCurators();

  return (
    <PhoneShell bg="#F6F1E5">
      <AppHeader active={active} />
      <DemoBanner show={demo} />

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-2 no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mt-2 flex items-center justify-center">
            <Mascot value={90} size={150} />
          </div>
          <h1
            className="mt-1 text-center font-black leading-none text-ink"
            style={{ fontSize: 40, letterSpacing: "-.01em" }}
          >
            Patty Petrol
          </h1>
          <p
            className="mt-2 text-center font-semibold"
            style={{ fontSize: 14.5, color: "rgba(27,23,19,.55)" }}
          >
            {active
              ? `Evening, ${active.name}. Tap your badge up top to switch.`
              : "Pick your patrol badge to begin."}
          </p>
        </motion.div>

        {/* Curator switcher — only until you've picked. Switch later via the avatar. */}
        {!activeId && (
          <div className="mt-5">
            <div className="eyebrow mb-2 text-center">WHO ARE YOU?</div>
            <div className="flex justify-center gap-4">
              {curators.map((c, i) => (
                <motion.button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <Avatar name={c.name} color={c.color} avatarUrl={c.avatarUrl} size={58} />
                  <span className="font-extrabold" style={{ fontSize: 12, opacity: 0.6 }}>
                    {c.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Action cards */}
        <div className={`${activeId ? "mt-8" : "mt-7"} flex flex-col gap-4`}>
          <ActionCard
            href={activeId ? "/curate" : "#"}
            disabled={!activeId}
            bg="#F48FBB"
            title="Start a curation"
            sub="Add a joint & rate the burger."
            emoji="🍔"
            delay={0.25}
          />
          <ActionCard
            href="/board"
            bg="#AFC6E9"
            title="The Grease Board"
            sub="Standings, top 3 & the deep dive."
            emoji="🏆"
            delay={0.33}
          />
          <ActionCard
            href="/farts"
            bg="#F0865A"
            title="Record a fart"
            sub="Capture it, tag the joint, get judged."
            emoji="💨"
            delay={0.41}
          />
          <ActionCard
            href="/seasons"
            bg="#A5B45B"
            title="Previous seasons"
            sub="The pizza era & other past glories."
            emoji="📜"
            delay={0.49}
          />
        </div>

        {!activeId && !loading && (
          <p
            className="mt-4 text-center font-bold"
            style={{ fontSize: 12.5, color: "#E4589B" }}
          >
            ↑ Tap your badge first to start a curation.
          </p>
        )}
      </div>
    </PhoneShell>
  );
}

function ActionCard({
  href,
  bg,
  title,
  sub,
  emoji,
  delay,
  disabled,
}: {
  href: string;
  bg: string;
  title: string;
  sub: string;
  emoji: string;
  delay: number;
  disabled?: boolean;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: disabled ? 0.55 : 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={disabled ? {} : { x: -2, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="card-ink flex items-center gap-4 rounded-3xl px-5 py-5"
      style={{ background: bg, boxShadow: "4px 5px 0 rgba(27,23,19,.2)" }}
    >
      <div style={{ fontSize: 40 }}>{emoji}</div>
      <div className="flex-1">
        <div className="font-black text-ink" style={{ fontSize: 22 }}>
          {title}
        </div>
        <div className="font-semibold text-ink" style={{ fontSize: 13.5, opacity: 0.7 }}>
          {sub}
        </div>
      </div>
      <div className="font-black text-ink" style={{ fontSize: 24 }}>
        →
      </div>
    </motion.div>
  );

  if (disabled) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
