"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";
import { ScoreChip } from "@/components/ScoreChip";
import { getSeason, type Season, type SeasonPlace } from "@/lib/seasons";
import { tier } from "@/lib/scoring";

export default function SeasonRecapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const season = getSeason(slug);
  const [modal, setModal] = useState<SeasonPlace | null>(null);

  if (!season) {
    return (
      <PhoneShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="font-black" style={{ fontSize: 22 }}>Season not found.</div>
          <button onClick={() => router.push("/seasons")} className="card-ink rounded-full px-5 py-3 font-extrabold" style={{ background: "#F5C445" }}>
            Back to the archive →
          </button>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/seasons")} />
        <span className="eyebrow">RECAP</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-3 no-scrollbar">
        {/* Hero */}
        <div className="flex items-center gap-3">
          <div style={{ fontSize: 48 }}>{season.emoji}</div>
          <div>
            <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
              {season.title}
            </h1>
            <div className="mt-1 font-bold" style={{ fontSize: 13.5, color: "rgba(27,23,19,.55)" }}>
              {season.cuisine} · {season.dateRange}
            </div>
          </div>
        </div>
        <p className="mt-2 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.6)" }}>{season.blurb}</p>

        <Podium podium={season.podium} onOpen={setModal} />

        {/* Champion / best pizza */}
        <div className="card-ink mt-4 rounded-[20px] px-5 py-4" style={{ background: "#EE5A29", color: "#FFF6E3" }}>
          <div className="eyebrow" style={{ color: "rgba(255,246,227,.8)", fontSize: 12 }}>
            BEST {season.cuisine.toUpperCase()} OF THE SEASON
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <div>
              <div className="font-black" style={{ fontSize: 22 }}>{season.bestItem.name}</div>
              <div className="font-bold" style={{ fontSize: 13, opacity: 0.85 }}>
                {season.bestItem.place} · found by {season.bestItem.curatorName}
              </div>
            </div>
            <div className="font-black" style={{ fontSize: 36 }}>{season.bestItem.score}<span style={{ fontSize: 18 }}>%</span></div>
          </div>
        </div>

        {/* Ranked */}
        <div className="eyebrow mb-2.5 mt-6" style={{ fontSize: 13 }}>EVERY JOINT, RANKED</div>
        <div className="flex flex-col gap-2.5">
          {season.ranked.map((p, i) => (
            <motion.button
              key={p.id}
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModal(p)}
              className="card-ink flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
              style={{ background: "#FFFDF7" }}
            >
              <span className="font-black" style={{ fontSize: 19, color: "rgba(27,23,19,.35)", width: 30 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="font-black text-ink" style={{ fontSize: 17 }}>{p.name}</div>
                <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>{p.when}</div>
              </div>
              <ScoreChip score={p.total} />
              <span className="font-black" style={{ fontSize: 18, color: "rgba(27,23,19,.4)" }}>›</span>
            </motion.button>
          ))}
        </div>

        {/* Trend */}
        {season.trend.length >= 2 && (
          <div className="card-ink mt-5 rounded-[20px] px-5 pb-3 pt-4" style={{ background: "#FFFDF7" }}>
            <span className="eyebrow" style={{ fontSize: 12 }}>SEASON TREND</span>
            <Sparkline points={season.trend} />
          </div>
        )}

        {/* Insight grid */}
        <div className="eyebrow mb-2.5 mt-6" style={{ fontSize: 13 }}>THE DEEP DISH</div>
        <div className="flex flex-col gap-2.5">
          <RedWhite rvw={season.redVsWhite} />

          {season.cheese.favourite && (
            <Insight bg="#F5C445" label="CHEESE OF CHOICE">
              <b>{season.cheese.favourite.name}</b> showed up on {season.cheese.favourite.count} pizzas.
              {season.cheese.topRated ? ` But ${season.cheese.topRated.name} scored highest (avg ${season.cheese.topRated.avg}).` : ""}
            </Insight>
          )}

          <Insight bg="#AFC6E9" label="THE SOFTIE & THE CRITIC">
            {season.generous} was the most generous ({season.curators.find((c) => c.name === season.generous)?.avgGiven} avg);
            {" "}{season.harsh} the toughest ({season.curators.find((c) => c.name === season.harsh)?.avgGiven} avg).
          </Insight>

          <Insight bg="#F48FBB" label="THE HORNY-O-METER 🌶️">
            Season average friskiness: <b>{season.horny.avg}</b>. {season.horny.note}
          </Insight>

          {season.value && (
            <Insight bg="#A5B45B" label="BEST VALUE" light>
              <b>{season.value.name}</b> at {season.value.place} — {season.value.score}% for just €{season.value.price}.
            </Insight>
          )}

          {season.fold && (
            <Insight bg="#F0865A" label="FOLDABILITY CHAMPION">
              <b>{season.fold.name}</b> ({season.fold.place}) held together at {season.fold.value}%. Structural royalty.
            </Insight>
          )}
        </div>

        {/* Quotes */}
        {season.quotes.length > 0 && (
          <>
            <div className="eyebrow mb-2.5 mt-6" style={{ fontSize: 13 }}>QUOTE WALL</div>
            <div className="flex flex-col gap-2.5">
              {season.quotes.map((q, i) => (
                <div key={i} className="card-ink rounded-2xl px-4 py-3" style={{ background: "#FFFDF7" }}>
                  <div className="font-semibold text-ink" style={{ fontSize: 14, lineHeight: 1.35 }}>“{q.text}”</div>
                  <div className="mt-1 font-bold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
                    — {q.curatorName}, on {q.item} @ {q.place}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Scale caveat */}
        <div className="mt-6 rounded-2xl px-4 py-3" style={{ background: "rgba(27,23,19,.05)" }}>
          <div className="font-bold" style={{ fontSize: 11.5, color: "rgba(27,23,19,.55)", lineHeight: 1.4 }}>
            ⓘ {season.scaleNote}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && <PlaceModal place={modal} season={season} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </PhoneShell>
  );
}

function Podium({ podium, onOpen }: { podium: SeasonPlace[]; onOpen: (p: SeasonPlace) => void }) {
  const [first, second, third] = podium;
  const cols = [
    second && { p: second, h: 86, bg: "#FFFDF7", fg: "#1B1713", big: false },
    first && { p: first, h: 112, bg: "#E4589B", fg: "#fff", big: true },
    third && { p: third, h: 72, bg: "#FFFDF7", fg: "#1B1713", big: false },
  ].filter(Boolean) as { p: SeasonPlace; h: number; bg: string; fg: string; big: boolean }[];
  const medal = (id: string) => (id === podium[0]?.id ? "🥇" : id === podium[1]?.id ? "🥈" : "🥉");
  return (
    <div className="card-ink mt-5 overflow-hidden rounded-[22px] px-4 pb-0 pt-5" style={{ background: "#F5C445" }}>
      <div className="eyebrow" style={{ fontSize: 12, color: "#1B1713" }}>THE PODIUM</div>
      <div className="mt-8 flex items-end gap-2.5">
        {cols.map((c) => (
          <motion.button
            key={c.p.id}
            onClick={() => onOpen(c.p)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex flex-col items-center"
            style={{ flex: c.big ? 1.15 : 1 }}
          >
            <div className="absolute" style={{ top: -30, fontSize: 26 }}>{medal(c.p.id)}</div>
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

function RedWhite({ rvw }: { rvw: Season["redVsWhite"] }) {
  const max = Math.max(rvw.red.avg, rvw.white.avg, 1);
  const Bar = ({ label, avg, count, color }: { label: string; avg: number; count: number; color: string }) => (
    <div className="flex items-center gap-2.5">
      <span className="font-extrabold text-ink" style={{ width: 52, fontSize: 13 }}>{label}</span>
      <div className="flex-1 overflow-hidden rounded-lg" style={{ height: 16, background: "rgba(27,23,19,.1)" }}>
        <div style={{ width: `${(avg / max) * 100}%`, height: "100%", background: color, borderRight: "2px solid #1B1713" }} />
      </div>
      <span className="font-black text-ink" style={{ width: 60, textAlign: "right", fontSize: 13 }}>{avg} · {count}🍕</span>
    </div>
  );
  return (
    <div className="card-ink rounded-2xl px-4 py-3.5" style={{ background: "#FFFDF7" }}>
      <div className="eyebrow" style={{ fontSize: 11 }}>RED VS WHITE</div>
      <div className="mt-2.5 flex flex-col gap-2">
        <Bar label="Red" avg={rvw.red.avg} count={rvw.red.count} color="#EE5A29" />
        <Bar label="White" avg={rvw.white.avg} count={rvw.white.count} color="#EFAF5F" />
      </div>
    </div>
  );
}

function Insight({ bg, label, light, children }: { bg: string; label: string; light?: boolean; children: React.ReactNode }) {
  return (
    <div className="card-ink rounded-2xl px-4 py-3" style={{ background: bg, color: light ? "#fff" : "#1B1713" }}>
      <div className="eyebrow" style={{ fontSize: 11, color: light ? "rgba(255,255,255,.85)" : undefined }}>{label}</div>
      <div className="mt-1 font-bold" style={{ fontSize: 14, lineHeight: 1.35 }}>{children}</div>
    </div>
  );
}

function Sparkline({ points }: { points: { when: string; value: number }[] }) {
  const W = 280, H = 84, pad = 10;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals) - 4, max = Math.max(...vals) + 4;
  const span = Math.max(1, max - min);
  const xy = points.map((p, i) => ({
    x: pad + (i * (W - pad * 2)) / Math.max(1, points.length - 1),
    y: pad + (H - pad * 2) * (1 - (p.value - min) / span),
  }));
  return (
    <>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: 6 }}>
        <motion.polyline
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }}
          points={xy.map((c) => `${c.x},${c.y}`).join(" ")}
          fill="none" stroke="#E4589B" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
        />
        {xy.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === xy.length - 1 ? 6 : 4} fill={i === xy.length - 1 ? "#E4589B" : "#1B1713"} stroke={i === xy.length - 1 ? "#1B1713" : "none"} strokeWidth={i === xy.length - 1 ? 2.5 : 0} />
        ))}
      </svg>
      <div className="flex justify-between font-extrabold" style={{ fontSize: 10, color: "rgba(27,23,19,.4)" }}>
        {points.map((p, i) => <span key={i}>{p.when.split(" ")[0].toUpperCase()}</span>)}
      </div>
    </>
  );
}

function PlaceModal({ place, season, onClose }: { place: SeasonPlace; season: Season; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} style={{ background: "rgba(27,23,19,.45)" }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="card-ink flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] sm:max-w-[390px] sm:rounded-[26px]"
        style={{ background: "#FFFDF7" }}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div>
            <div className="font-black text-ink" style={{ fontSize: 22 }}>{place.name}</div>
            <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
              {place.when} · avg {place.total}
            </div>
          </div>
          <button onClick={onClose} className="card-ink grid h-8 w-8 place-items-center rounded-full font-black" style={{ background: "#F6F1E5", fontSize: 15 }} aria-label="Close">✕</button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-6 pt-1 no-scrollbar">
          {place.reviews.map((r, i) => (
            <div key={i} className="card-ink rounded-2xl p-4" style={{ background: "#F6F1E5" }}>
              <div className="flex items-center gap-3">
                <Avatar name={r.curatorName} color={r.color} size={36} />
                <div className="flex-1">
                  <div className="font-black text-ink" style={{ fontSize: 16 }}>{r.itemName}</div>
                  <div className="font-semibold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
                    {r.curatorName}{r.price ? ` · €${r.price}` : ""}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-black leading-none text-ink" style={{ fontSize: 24 }}>{r.total}</div>
                  <div className="eyebrow" style={{ fontSize: 9 }}>TOTAL</div>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Tag bg={r.sauce === "Red" ? "#EE5A29" : "#EFAF5F"} fg={r.sauce === "Red" ? "#fff" : "#1B1713"} text={`${r.sauce} sauce`} />
                <Tag bg="#AFC6E9" text={r.cheese} />
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {season.metricLabels.map((m) => (
                  <Bar key={m.key} label={m.label} value={r.metrics[m.key] ?? 0} />
                ))}
              </div>
              <div className="mt-2.5 eyebrow" style={{ fontSize: 10 }}>THE JOINT</div>
              <div className="mt-1 flex flex-col gap-1.5">
                {season.jointLabels.map((m) => (
                  <Bar key={m.key} label={m.label} value={r.joint[m.key] ?? 0} />
                ))}
              </div>
              {r.quote && <div className="mt-2 font-semibold text-ink" style={{ fontSize: 13, lineHeight: 1.35 }}>“{r.quote}”</div>}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex-1 font-bold text-ink" style={{ fontSize: 13 }}>{label}</span>
      <div className="overflow-hidden rounded" style={{ width: 90, height: 7, background: "rgba(27,23,19,.12)" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 4, background: tier(value).bg }} />
      </div>
      <span className="text-right font-black text-ink" style={{ width: 26, fontSize: 13 }}>{value}</span>
    </div>
  );
}

function Tag({ bg, text, fg = "#1B1713" }: { bg: string; text: string; fg?: string }) {
  return (
    <span className="rounded-full font-extrabold" style={{ fontSize: 10.5, padding: "3px 8px", background: bg, border: "1.5px solid #1B1713", color: fg }}>
      {text}
    </span>
  );
}
