"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { tier } from "@/lib/scoring";
import { Avatar } from "./Avatar";
import type { EvaluationView } from "@/lib/aggregate";

const BURGER_ROWS: { k: keyof EvaluationView["burger"]; label: string }[] = [
  { k: "patty", label: "Patty" },
  { k: "bun", label: "Bun" },
  { k: "cheese", label: "Cheese & toppings" },
  { k: "sauce", label: "Sauce & seasoning" },
  { k: "build", label: "Build & balance" },
  { k: "value", label: "Value" },
];
const JOINT_ROWS: { k: keyof EvaluationView["joint"]; label: string }[] = [
  { k: "ambiance", label: "Ambiance" },
  { k: "lighting", label: "Lighting" },
  { k: "service", label: "Service" },
  { k: "comfort", label: "Comfort" },
];

export function EvaluationModal({
  evaluations,
  title,
  demo,
  onClose,
  onDeleted,
}: {
  evaluations: EvaluationView[];
  title: string;
  demo: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const r = await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error ?? "Could not remove.");
        return;
      }
      onDeleted();
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: "rgba(27,23,19,.45)" }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="card-ink flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] sm:max-w-[390px] sm:rounded-[26px]"
          style={{ background: "#FFFDF7" }}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div className="eyebrow" style={{ fontSize: 12 }}>{title}</div>
            <button
              onClick={onClose}
              className="card-ink grid h-8 w-8 place-items-center rounded-full font-black"
              style={{ background: "#F6F1E5", fontSize: 15 }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-6 pt-1 no-scrollbar">
            {error && (
              <div className="card-ink rounded-xl px-3 py-2 font-bold" style={{ background: "#F0865A", fontSize: 12.5 }}>
                {error}
              </div>
            )}
            {evaluations.map((e) => (
              <div key={e.id} className="card-ink rounded-2xl p-4" style={{ background: "#F6F1E5" }}>
                <div className="flex items-center gap-3">
                  <Avatar name={e.name} color={e.color} size={38} />
                  <div className="flex-1">
                    <div className="font-black text-ink" style={{ fontSize: 17 }}>{e.burgerName}</div>
                    <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.55)" }}>
                      {e.name}
                      {e.price ? ` · €${e.price}` : ""}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black leading-none text-ink" style={{ fontSize: 26 }}>{e.total}</div>
                    <div className="eyebrow" style={{ fontSize: 9 }}>TOTAL</div>
                  </div>
                </div>

                {(e.style.length > 0 || e.protein) && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {e.style.map((s) => <Chip key={s} bg="#F5C445" text={s.toUpperCase()} />)}
                    {e.protein && <Chip bg="#AFC6E9" text={e.protein.toUpperCase()} />}
                    {e.again === true && <Chip bg="#A5B45B" fg="#fff" text="WOULD ORDER AGAIN" />}
                  </div>
                )}

                <Section label="THE BURGER" highlight={e.burger.overall} highlightLabel="Overall" />
                {BURGER_ROWS.map((r) => <Bar key={r.k} label={r.label} value={e.burger[r.k]} />)}

                <Section label="THE JOINT" highlight={e.joint.overallJoint} highlightLabel="Overall" />
                {JOINT_ROWS.map((r) => <Bar key={r.k} label={r.label} value={e.joint[r.k]} />)}

                <Section label="CURATOR BIAS" />
                <div className="mt-1 flex gap-2">
                  <Bias label="Hunger" v={e.bias.hunger} />
                  <Bias label="Stress" v={e.bias.stress} />
                  <Bias label="Horny" v={e.bias.horny} />
                </div>
                <div className="mt-1.5 font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.55)" }}>
                  {e.beenHere === true ? "Been here before" : e.beenHere === false ? "First visit" : ""}
                </div>

                {e.quote && (
                  <div className="mt-2 font-semibold text-ink" style={{ fontSize: 13.5, lineHeight: 1.35 }}>
                    “{e.quote}”
                  </div>
                )}

                {/* Remove */}
                <div className="mt-3">
                  {confirmId === e.id ? (
                    <div className="flex items-center gap-2">
                      <span className="flex-1 font-bold" style={{ fontSize: 12.5 }}>Remove this review?</span>
                      <button onClick={() => setConfirmId(null)} className="px-2 font-extrabold underline" style={{ fontSize: 12.5 }}>
                        Keep
                      </button>
                      <button
                        onClick={() => remove(e.id)}
                        disabled={busyId === e.id}
                        className="card-ink rounded-full px-3 py-1.5 font-extrabold"
                        style={{ background: "#F0865A", fontSize: 12.5 }}
                      >
                        {busyId === e.id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => (demo ? setError("Demo mode: connect Neon to remove reviews.") : setConfirmId(e.id))}
                      className="font-extrabold underline"
                      style={{ fontSize: 12.5, color: "#E4589B" }}
                    >
                      Remove review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ label, highlight, highlightLabel }: { label: string; highlight?: number; highlightLabel?: string }) {
  return (
    <div className="mt-3.5 mb-1.5 flex items-center justify-between">
      <span className="eyebrow" style={{ fontSize: 11 }}>{label}</span>
      {highlight != null && (
        <span className="font-black" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
          {highlightLabel} · {highlight}
        </span>
      )}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1.5 flex items-center gap-2.5">
      <span className="flex-1 font-bold text-ink" style={{ fontSize: 13.5 }}>{label}</span>
      <div className="overflow-hidden rounded" style={{ width: 90, height: 7, background: "rgba(27,23,19,.12)" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 4, background: tier(value).bg }} />
      </div>
      <span className="text-right font-black text-ink" style={{ width: 26, fontSize: 13.5 }}>{value}</span>
    </div>
  );
}

function Bias({ label, v }: { label: string; v: number }) {
  return (
    <div className="card-ink flex-1 rounded-xl px-2 py-1.5 text-center" style={{ background: "#FFFDF7" }}>
      <div className="font-black text-ink" style={{ fontSize: 16 }}>{v}</div>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
    </div>
  );
}

function Chip({ bg, text, fg = "#1B1713" }: { bg: string; text: string; fg?: string }) {
  return (
    <span className="rounded-full font-extrabold" style={{ fontSize: 10.5, padding: "3px 8px", background: bg, border: "1.5px solid #1B1713", color: fg }}>
      {text}
    </span>
  );
}
