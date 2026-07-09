"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";
import { ScoreChip } from "@/components/ScoreChip";
import type { EstablishmentSummary } from "@/lib/aggregate";
import type { CuratorId } from "@/lib/curators";

const ADMIN: CuratorId = "marty";

export default function AdminPage() {
  const router = useRouter();
  const { curators, active, activeId, setActive, demo } = useCurators();
  const [joints, setJoints] = useState<EstablishmentSummary[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/establishments")
      .then((r) => r.json())
      .then((d) => setJoints(d.establishments ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => load(), [load]);

  async function del(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const r = await fetch(`/api/establishments/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error ?? "Could not delete.");
        return;
      }
      setJoints((js) => js.filter((j) => j.id !== id));
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  const isAdmin = activeId === ADMIN;
  const marty = curators.find((c) => c.id === ADMIN);

  return (
    <PhoneShell>
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/curators")} />
        <span className="eyebrow">ADMIN DESK</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
          Manage joints
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
          Delete a joint and all its reviews. No undo — measure twice.
        </p>

        {!isAdmin ? (
          <div className="card-ink mt-6 rounded-2xl p-6 text-center" style={{ background: "#F0865A" }}>
            <div className="mx-auto w-fit">
              {marty && <Avatar name={marty.name} color={marty.color} avatarUrl={marty.avatarUrl} size={56} />}
            </div>
            <div className="mt-3 font-black text-ink" style={{ fontSize: 19 }}>
              Marty runs the admin desk.
            </div>
            <div className="mt-1 font-semibold text-ink" style={{ fontSize: 13.5, opacity: 0.75 }}>
              Switch to Marty to manage joints.
            </div>
            <button
              onClick={() => setActive(ADMIN)}
              className="card-ink mt-4 rounded-full px-5 py-3 font-extrabold text-ink"
              style={{ background: "#FFFDF7" }}
            >
              I&apos;m Marty →
            </button>
          </div>
        ) : (
          <>
            {demo && (
              <div className="card-ink mt-4 rounded-2xl px-4 py-2.5 text-center font-bold" style={{ background: "#AFC6E9", fontSize: 12.5 }}>
                Demo mode — deletes are disabled until Neon is connected.
              </div>
            )}
            {error && (
              <div className="card-ink mt-4 rounded-2xl px-4 py-2.5 font-bold" style={{ background: "#F0865A", fontSize: 12.5 }}>
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              {joints.length === 0 && (
                <div className="font-semibold" style={{ fontSize: 14, opacity: 0.5 }}>No joints yet.</div>
              )}
              {joints.map((j) => (
                <motion.div
                  key={j.id}
                  layout
                  className="card-ink rounded-2xl px-3.5 py-3"
                  style={{ background: "#FFFDF7" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-black text-ink" style={{ fontSize: 16.5 }}>{j.name}</div>
                      <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
                        {j.area}{j.when ? ` · ${j.when}` : ""} · {j.evaluationCount} review{j.evaluationCount === 1 ? "" : "s"}
                      </div>
                    </div>
                    {j.evaluationCount > 0 && <ScoreChip score={j.total} size={13} />}
                    {confirmId !== j.id && (
                      <button
                        onClick={() => setConfirmId(j.id)}
                        className="card-ink grid h-9 w-9 place-items-center rounded-full"
                        style={{ background: "#F6F1E5", fontSize: 15 }}
                        aria-label="Delete joint"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  {confirmId === j.id && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="flex-1 font-bold text-ink" style={{ fontSize: 12.5 }}>
                        Delete {j.name} & its reviews?
                      </span>
                      <button onClick={() => setConfirmId(null)} className="px-2 font-extrabold underline" style={{ fontSize: 12.5 }}>
                        Keep
                      </button>
                      <button
                        onClick={() => del(j.id)}
                        disabled={busyId === j.id}
                        className="card-ink rounded-full px-3 py-1.5 font-extrabold"
                        style={{ background: "#F0865A", fontSize: 12.5 }}
                      >
                        {busyId === j.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </PhoneShell>
  );
}
