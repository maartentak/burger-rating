"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { AppHeader } from "@/components/AppHeader";
import { DemoBanner } from "@/components/DemoBanner";
import { ScoreChip } from "@/components/ScoreChip";
import { Face, Crown } from "@/components/art";
import type { Dashboard } from "@/db/data";
import type { EstablishmentSummary } from "@/lib/aggregate";

export default function BoardPage() {
  const router = useRouter();
  const { active } = useCurators();
  const [dash, setDash] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setDash)
      .catch(() => {});
  }, []);

  return (
    <PhoneShell bg="#F6F1E5">
      <AppHeader active={active} showBack />
      <DemoBanner show={Boolean(dash?.demo)} />

      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 38, letterSpacing: "-.01em" }}>
          The Grease Board
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14.5, color: "rgba(27,23,19,.55)" }}>
          {dash ? `${dash.joints} joint${dash.joints === 1 ? "" : "s"} judged. No mercy.` : "Loading the standings…"}
        </p>

        {dash && dash.joints === 0 && (
          <div className="card-ink mt-6 rounded-2xl p-6 text-center" style={{ background: "#FFFDF7" }}>
            <div className="font-black" style={{ fontSize: 20 }}>Empty board.</div>
            <div className="mt-1 font-semibold" style={{ fontSize: 13.5, opacity: 0.6 }}>
              Rate your first joint to get things sizzling.
            </div>
            <button onClick={() => router.push("/curate")} className="card-ink mt-4 rounded-full px-5 py-3 font-extrabold" style={{ background: "#F48FBB" }}>
              Start a curation →
            </button>
          </div>
        )}

        {dash && dash.podium.length > 0 && (
          <>
            <Podium podium={dash.podium} onOpen={(id) => router.push(`/establishment/${id}`)} />

            {/* Next up / log strip */}
            <motion.button
              onClick={() => router.push("/curate")}
              whileTap={{ scale: 0.98 }}
              className="card-ink mt-3 flex w-full items-center gap-3 rounded-[18px] px-4 py-3.5 text-left"
              style={{ background: "#AFC6E9" }}
            >
              <div className="card-ink grid place-items-center rounded-xl px-2.5 py-1.5 font-black leading-none" style={{ background: "#FFFDF7", borderWidth: 2, fontSize: 20 }}>+</div>
              <div className="flex-1">
                <div className="eyebrow" style={{ fontSize: 12 }}>NEXT UP</div>
                <div className="font-black text-ink" style={{ fontSize: 17 }}>Log this month&apos;s joint</div>
              </div>
              <span className="font-black text-ink" style={{ fontSize: 20 }}>→</span>
            </motion.button>

            {/* Ranked list */}
            <div className="eyebrow mb-2.5 mt-6" style={{ fontSize: 13 }}>EVERY JOINT WE&apos;VE JUDGED</div>
            <div className="flex flex-col gap-2.5">
              {dash.ranked.map((p, i) => (
                <RankRow key={p.id} rank={i + 1} p={p} onClick={() => router.push(`/establishment/${p.id}`)} />
              ))}
            </div>

            {/* Hall of fame */}
            {dash.hallOfFame && (
              <div className="card-ink mt-5 rounded-[20px] px-5 py-4" style={{ background: "#EE5A29", color: "#FFF6E3" }}>
                <div className="eyebrow" style={{ color: "rgba(255,246,227,.8)", fontSize: 12 }}>HALL OF FAME · BEST BURGER EVER</div>
                <div className="mt-1.5 flex items-center justify-between">
                  <div>
                    <div className="font-black" style={{ fontSize: 22 }}>{dash.hallOfFame.burgerName}</div>
                    <div className="font-bold" style={{ fontSize: 13, opacity: 0.85 }}>
                      {dash.hallOfFame.establishmentName} · found by {dash.hallOfFame.curatorName}
                    </div>
                  </div>
                  <div className="font-black" style={{ fontSize: 36 }}>
                    {dash.hallOfFame.score}<span style={{ fontSize: 18 }}>%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Beef of the month */}
            {dash.beef && dash.beef.disagreement.spread > 0 && (
              <div className="card-ink mt-3 rounded-[20px] px-5 py-4" style={{ background: "#F48FBB" }}>
                <div className="eyebrow" style={{ fontSize: 12 }}>BEEF OF THE MONTH</div>
                <div className="mt-1.5 font-extrabold text-ink" style={{ fontSize: 16.5, lineHeight: 1.35 }}>
                  {dash.beef.establishmentName} split the club: {dash.beef.disagreement.high.name} gave it{" "}
                  <Inline>{dash.beef.disagreement.high.score}</Inline>, {dash.beef.disagreement.low.name} gave it{" "}
                  <Inline>{dash.beef.disagreement.low.score}</Inline>. A {dash.beef.disagreement.spread}-point beef.
                </div>
              </div>
            )}

            {/* Club average sparkline */}
            {dash.clubAverage.points.length >= 2 && (
              <div className="card-ink mt-3 rounded-[20px] px-5 pb-3 pt-4" style={{ background: "#FFFDF7" }}>
                <div className="flex items-baseline justify-between">
                  <span className="eyebrow" style={{ fontSize: 12 }}>CLUB AVERAGE</span>
                  <span className="font-black" style={{ fontSize: 13, color: dash.clubAverage.delta >= 0 ? "#A5B45B" : "#F0865A" }}>
                    {dash.clubAverage.delta >= 0 ? "▲" : "▼"} {dash.clubAverage.delta >= 0 ? "+" : ""}
                    {dash.clubAverage.delta} since last
                  </span>
                </div>
                <Sparkline points={dash.clubAverage.points} />
              </div>
            )}

            {/* Insights */}
            <Insights dash={dash} />
          </>
        )}
      </div>
    </PhoneShell>
  );
}

function Inline({ children }: { children: React.ReactNode }) {
  return <span className="rounded" style={{ background: "#FFFDF7", padding: "1px 6px" }}>{children}</span>;
}

interface PodiumCol {
  p: EstablishmentSummary;
  h: number;
  bg: string;
  fg: string;
  face: "smile" | "grin" | "neutral";
  faceBg: string;
  crown: boolean;
  big: boolean;
}

function Podium({ podium, onOpen }: { podium: EstablishmentSummary[]; onOpen: (id: string) => void }) {
  const [first, second, third] = podium;
  const cols: PodiumCol[] = [];
  if (second) cols.push({ p: second, h: 86, bg: "#FFFDF7", fg: "#1B1713", face: "smile", faceBg: "#AFC6E9", crown: false, big: false });
  if (first) cols.push({ p: first, h: 112, bg: "#E4589B", fg: "#fff", face: "grin", faceBg: "#F48FBB", crown: true, big: true });
  if (third) cols.push({ p: third, h: 72, bg: "#FFFDF7", fg: "#1B1713", face: "neutral", faceBg: "#A5B45B", crown: false, big: false });

  return (
    <div className="card-ink mt-5 overflow-hidden rounded-[22px] px-4 pt-5" style={{ background: "#F5C445" }}>
      <div className="eyebrow" style={{ fontSize: 12, color: "#1B1713" }}>THIS MONTH&apos;S PODIUM</div>
      <div className="mt-[60px] flex items-end gap-2.5">
        {cols.map((c) => (
          <motion.button
            key={c.p.id}
            onClick={() => onOpen(c.p.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex flex-col items-center"
            style={{ flex: c.big ? 1.15 : 1 }}
          >
            {c.crown && (
              <div className="absolute" style={{ top: -46 }}>
                <Crown size={30} />
              </div>
            )}
            <div
              className="card-ink absolute grid place-items-center rounded-full"
              style={{ width: c.big ? 48 : 44, height: c.big ? 48 : 44, background: c.faceBg, top: c.big ? -28 : -24 }}
            >
              <Face mood={c.face} size={c.big ? 28 : 26} />
            </div>
            <div
              className="flex w-full flex-col items-center justify-center rounded-t-[14px] px-1 pb-1.5 pt-4"
              style={{ height: c.h, background: c.bg, border: "2.5px solid #1B1713", borderBottom: "none" }}
            >
              <div className="font-black leading-none" style={{ fontSize: c.big ? 30 : 22, color: c.fg }}>{c.p.total}</div>
              <div className="mt-0.5 text-center font-extrabold leading-[1.1]" style={{ fontSize: 10, color: c.big ? "rgba(255,255,255,.9)" : "rgba(27,23,19,.6)" }}>
                {c.p.name}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function RankRow({ rank, p, onClick }: { rank: number; p: EstablishmentSummary; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="card-ink flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
      style={{ background: "#FFFDF7" }}
    >
      <span className="font-black" style={{ fontSize: 19, color: "rgba(27,23,19,.35)", width: 30 }}>
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="font-black text-ink" style={{ fontSize: 17 }}>{p.name}</div>
        <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
          {p.area}{p.when ? ` · ${p.when}` : ""}
        </div>
      </div>
      <ScoreChip score={p.total} />
      <span className="font-black" style={{ fontSize: 18, color: "rgba(27,23,19,.4)" }}>›</span>
    </motion.button>
  );
}

function Sparkline({ points }: { points: { when: string; value: number }[] }) {
  const W = 280;
  const H = 84;
  const pad = 10;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals) - 4;
  const max = Math.max(...vals) + 4;
  const span = Math.max(1, max - min);
  const xy = points.map((p, i) => {
    const x = pad + (i * (W - pad * 2)) / Math.max(1, points.length - 1);
    const y = pad + (H - pad * 2) * (1 - (p.value - min) / span);
    return { x, y };
  });
  const poly = xy.map((c) => `${c.x},${c.y}`).join(" ");
  return (
    <>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: 6 }}>
        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9 }}
          points={poly}
          fill="none"
          stroke="#E4589B"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {xy.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === xy.length - 1 ? 6 : 4}
            fill={i === xy.length - 1 ? "#E4589B" : "#1B1713"}
            stroke={i === xy.length - 1 ? "#1B1713" : "none"}
            strokeWidth={i === xy.length - 1 ? 2.5 : 0}
          />
        ))}
      </svg>
      <div className="flex justify-between font-extrabold" style={{ fontSize: 10.5, color: "rgba(27,23,19,.4)", padding: "0 2px" }}>
        {points.map((p) => (
          <span key={p.when}>{p.when.split(" ")[0].toUpperCase()}</span>
        ))}
      </div>
    </>
  );
}

function Insights({ dash }: { dash: Dashboard }) {
  const { insights } = dash;
  const rows: { label: string; text: string }[] = [];
  if (insights.favoriteProtein) {
    rows.push({
      label: "FAVOURITE PROTEIN",
      text: `${insights.favoriteProtein.protein} leads at avg ${insights.favoriteProtein.avg} across ${insights.favoriteProtein.count} burger${insights.favoriteProtein.count === 1 ? "" : "s"}.`,
    });
  }
  if (insights.generous && insights.harsh && insights.generous !== insights.harsh) {
    rows.push({ label: "THE SOFTIE & THE CRITIC", text: `${insights.generous} scores highest on average; ${insights.harsh} is the toughest crowd.` });
  }
  if (insights.hungerNote) rows.push({ label: "HUNGER BIAS", text: insights.hungerNote });
  if (rows.length === 0) return null;

  return (
    <>
      <div className="eyebrow mb-2.5 mt-5" style={{ fontSize: 13 }}>HIDDEN INSIGHTS</div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="card-ink rounded-2xl px-4 py-3" style={{ background: "#FFFDF7" }}>
            <div className="eyebrow" style={{ fontSize: 11 }}>{r.label}</div>
            <div className="mt-0.5 font-bold text-ink" style={{ fontSize: 14, lineHeight: 1.35 }}>{r.text}</div>
          </div>
        ))}
      </div>
    </>
  );
}
