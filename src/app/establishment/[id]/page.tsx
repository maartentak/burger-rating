"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";
import { BurgerIcon } from "@/components/art";
import { EvaluationModal } from "@/components/EvaluationModal";
import { tier } from "@/lib/scoring";
import type { EstablishmentDetail, EvaluationView } from "@/lib/aggregate";

export default function EstablishmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<PhoneShell><div className="flex-1" /></PhoneShell>}>
      <Inner id={id} />
    </Suspense>
  );
}

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const mine = useSearchParams().get("mine");
  const [d, setD] = useState<EstablishmentDetail | null>(null);
  const [demo, setDemo] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [modal, setModal] = useState<{ title: string; evals: EvaluationView[] } | null>(null);

  function load() {
    return fetch(`/api/establishments/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((res) => {
        setD(res.establishment);
        setDemo(Boolean(res.demo));
      })
      .catch(() => setNotFound(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <PhoneShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="font-black" style={{ fontSize: 22 }}>Joint not found.</div>
          <button onClick={() => router.push("/board")} className="card-ink rounded-full px-5 py-3 font-extrabold" style={{ background: "#F5C445" }}>
            To the Grease Board →
          </button>
        </div>
      </PhoneShell>
    );
  }

  if (!d) {
    return (
      <PhoneShell>
        <div className="flex flex-1 items-center justify-center font-bold" style={{ opacity: 0.5 }}>Plating up…</div>
      </PhoneShell>
    );
  }

  const t = tier(d.total);
  const topDisagreements = d.disagreements.filter((x) => x.spread >= 5).slice(0, 3);

  return (
    <PhoneShell>
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/board")} />
        <span className="eyebrow">THE BREAKDOWN</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        {mine && d.evaluationCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-ink mb-3 rounded-2xl px-4 py-2.5 text-center font-extrabold"
            style={{ background: "#A5B45B", color: "#fff", fontSize: 13.5 }}
          >
            🎉 Locked in! Your score is on the board.
          </motion.div>
        )}

        {/* Title + avg badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-black leading-[1.05] text-ink"
              style={{ fontSize: 34, letterSpacing: "-.01em" }}
            >
              {d.name}
            </motion.div>
            <div className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
              {d.area}
              {d.when ? ` · visited ${d.when}` : ""}
            </div>
          </div>
          {d.evaluationCount > 0 && (
            <div className="card-ink shrink-0 rounded-[18px] px-3.5 py-2.5 text-center" style={{ background: "#E4589B", color: "#fff" }}>
              <div className="font-black leading-none" style={{ fontSize: 30 }}>{d.total}</div>
              <div className="font-extrabold" style={{ fontSize: 10, letterSpacing: ".1em" }}>AVG</div>
            </div>
          )}
        </div>

        {d.evaluationCount === 0 ? (
          <div className="card-ink mt-6 rounded-2xl p-6 text-center" style={{ background: "#FFFDF7" }}>
            <div className="font-black" style={{ fontSize: 18 }}>No ratings yet.</div>
            <div className="mt-1 font-semibold" style={{ fontSize: 13.5, opacity: 0.6 }}>
              Be the first to curate this joint.
            </div>
            <button
              onClick={() => router.push(`/curate/${id}/rate`)}
              className="card-ink mt-4 rounded-full px-5 py-3 font-extrabold"
              style={{ background: "#F48FBB" }}
            >
              Rate it →
            </button>
          </div>
        ) : (
          <>
            {/* Score split */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SplitCard label="BURGER" value={d.burgerScore} bg="#F5C445" />
              <SplitCard label="JOINT" value={d.jointScore} bg="#AFC6E9" />
            </div>

            {/* Burgers */}
            <SectionLabel>THE BURGERS</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {d.burgers.map((b, i) => {
                const ev = d.evaluations.find((e) => e.id === b.evaluationId);
                return (
                  <motion.button
                    key={b.evaluationId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: -2, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => ev && setModal({ title: "BURGER BREAKDOWN", evals: [ev] })}
                    className="card-ink flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
                    style={{ background: "#FFFDF7" }}
                  >
                    <BurgerIcon />
                    <div className="flex-1">
                      <div className="font-black text-ink" style={{ fontSize: 16.5 }}>{b.name}</div>
                      <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
                        ordered by {b.orderedBy}
                        {b.protein ? ` · ${b.protein}` : ""}
                      </div>
                    </div>
                    <span className="font-black text-ink" style={{ fontSize: 20 }}>{b.score}</span>
                    <span className="font-black" style={{ fontSize: 16, color: "rgba(27,23,19,.4)" }}>›</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Joint bars */}
            <SectionLabel>THE JOINT</SectionLabel>
            <div className="card-ink flex flex-col gap-3 rounded-2xl p-4" style={{ background: "#FFFDF7" }}>
              {d.jointBars.map((eb) => (
                <div key={eb.label} className="flex items-center gap-2.5">
                  <span className="font-extrabold text-ink" style={{ width: 74, fontSize: 14.5 }}>{eb.label}</span>
                  <div className="card-ink flex-1 overflow-hidden rounded-lg" style={{ height: 12, background: "rgba(27,23,19,.1)", borderWidth: 1.5 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${eb.value}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: "100%", background: "#F5C445", borderRight: "1.5px solid #1B1713" }}
                    />
                  </div>
                  <span className="text-right font-black text-ink" style={{ width: 28, fontSize: 15 }}>{eb.value}</span>
                </div>
              ))}
            </div>

            {/* Key disagreements */}
            {topDisagreements.length > 0 && (
              <>
                <SectionLabel>KEY DISAGREEMENTS</SectionLabel>
                <div className="flex flex-col gap-2.5">
                  {topDisagreements.map((dis) => (
                    <div key={dis.key} className="card-ink rounded-2xl px-4 py-3" style={{ background: "#F48FBB" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-ink" style={{ fontSize: 15 }}>{dis.label}</span>
                        <span className="card-ink rounded-full px-2.5 py-0.5 font-black" style={{ background: "#FFFDF7", fontSize: 12, borderWidth: 1.5 }}>
                          {dis.spread}pt gap
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-ink" style={{ fontSize: 13.5 }}>
                        {dis.high.name} gave{" "}
                        <span className="rounded px-1.5" style={{ background: "#FFFDF7" }}>{dis.high.score}</span>
                        {" · "}
                        {dis.low.name} gave{" "}
                        <span className="rounded px-1.5" style={{ background: "#FFFDF7" }}>{dis.low.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Curator takes */}
            <SectionLabel>CURATOR TAKES</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {d.curatorTakes.map((c, i) => (
                <motion.button
                  key={c.curatorId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: -2, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setModal({
                      title: `${c.name.toUpperCase()}'S TAKE`,
                      evals: d.evaluations.filter((e) => e.curatorId === c.curatorId),
                    })
                  }
                  className="card-ink flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
                  style={{ background: "#FFFDF7" }}
                >
                  <Avatar name={c.name} color={c.color} size={42} />
                  <div className="flex-1">
                    <div className="font-black text-ink" style={{ fontSize: 15 }}>
                      {c.name} <span className="font-extrabold" style={{ color: "rgba(27,23,19,.45)" }}>· {c.score}</span>
                      {c.burgerCount > 1 && (
                        <span className="font-extrabold" style={{ color: "rgba(27,23,19,.4)", fontSize: 12 }}>
                          {" "}· {c.burgerCount} burgers
                        </span>
                      )}
                    </div>
                    {c.quote && (
                      <div className="font-semibold" style={{ fontSize: 13.5, color: "rgba(27,23,19,.65)", lineHeight: 1.35 }}>
                        “{c.quote}”
                      </div>
                    )}
                  </div>
                  <span className="font-black" style={{ fontSize: 16, color: "rgba(27,23,19,.4)" }}>›</span>
                </motion.button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => router.push("/board")}
          className="card-ink mt-6 w-full rounded-full py-4 font-extrabold text-ink"
          style={{ background: "#F5C445", fontSize: 17, boxShadow: "4px 5px 0 rgba(27,23,19,.2)" }}
        >
          To the Grease Board →
        </button>
      </div>

      {modal && (
        <EvaluationModal
          evaluations={modal.evals}
          title={modal.title}
          demo={demo}
          onClose={() => setModal(null)}
          onDeleted={async () => {
            setModal(null);
            await load();
          }}
        />
      )}
    </PhoneShell>
  );
}

function SplitCard({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div className="card-ink rounded-2xl px-4 py-3" style={{ background: bg }}>
      <div className="eyebrow" style={{ fontSize: 11 }}>{label}</div>
      <div className="mt-0.5 font-black leading-none text-ink" style={{ fontSize: 34 }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow mb-2.5 mt-6" style={{ fontSize: 13 }}>{children}</div>;
}
