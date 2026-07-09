"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";
import { FartList } from "@/components/FartList";
import type { FartView } from "@/db/data";
import type { EstablishmentSummary } from "@/lib/aggregate";

const MAX_SECONDS = 20;

export default function FartsPage() {
  return (
    <Suspense fallback={<PhoneShell><div className="flex-1" /></PhoneShell>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const { active, activeId } = useCurators();
  const preEst = useSearchParams().get("establishmentId");

  const [farts, setFarts] = useState<FartView[]>([]);
  const [demo, setDemo] = useState(false);
  const [joints, setJoints] = useState<EstablishmentSummary[]>([]);
  const [estId, setEstId] = useState<string>(preEst ?? "");

  // recorder state
  const [phase, setPhase] = useState<"idle" | "recording" | "recorded">("idle");
  const [seconds, setSeconds] = useState(0);
  const [clip, setClip] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadFarts() {
    fetch("/api/farts")
      .then((r) => r.json())
      .then((d) => {
        setFarts(d.farts ?? []);
        setDemo(Boolean(d.demo));
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadFarts();
    fetch("/api/establishments")
      .then((r) => r.json())
      .then((d) => setJoints(d.establishments ?? []))
      .catch(() => {});
  }, []);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't record audio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => setClip(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      recRef.current = mr;
      setPhase("recording");
      setSeconds(0);
      timer.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Mic permission denied. Allow microphone access and try again.");
    }
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    recRef.current?.stop();
    setPhase("recorded");
  }

  function reset() {
    setClip(null);
    setName("");
    setPhase("idle");
    setSeconds(0);
  }

  async function save() {
    if (!activeId || !clip) return;
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/farts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curatorId: activeId,
          establishmentId: estId || null,
          name,
          audio: clip,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Could not save.");
        return;
      }
      reset();
      loadFarts();
    } finally {
      setSaving(false);
    }
  }

  return (
    <PhoneShell>
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/")} />
        <span className="eyebrow">THE FART BOOTH</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
          Record a fart 💨
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
          Capture the moment, tag the joint, let the patrol judge.
        </p>

        {/* Recorder card */}
        <div className="card-ink mt-4 rounded-3xl p-5" style={{ background: "#FFF6E3" }}>
          {!activeId && (
            <div className="mb-3 text-center font-bold" style={{ fontSize: 12.5, color: "#E4589B" }}>
              Pick your badge on the home screen first.
            </div>
          )}

          {phase === "idle" && (
            <div className="flex flex-col items-center gap-3">
              <motion.button
                onClick={start}
                whileTap={{ scale: 0.94 }}
                disabled={!activeId}
                className="card-ink grid h-28 w-28 place-items-center rounded-full"
                style={{ background: "#EE5A29", fontSize: 44, opacity: activeId ? 1 : 0.5 }}
                aria-label="Start recording"
              >
                🎙️
              </motion.button>
              <div className="font-extrabold text-ink" style={{ fontSize: 14 }}>Tap to record</div>
            </div>
          )}

          {phase === "recording" && (
            <div className="flex flex-col items-center gap-3">
              <motion.button
                onClick={stop}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="card-ink grid h-28 w-28 place-items-center rounded-full"
                style={{ background: "#E4589B", fontSize: 40 }}
                aria-label="Stop recording"
              >
                ⏹️
              </motion.button>
              <div className="font-black text-ink" style={{ fontSize: 22 }}>
                {String(Math.floor(seconds / 60)).padStart(1, "0")}:{String(seconds % 60).padStart(2, "0")}
              </div>
              <div className="font-bold" style={{ fontSize: 12, opacity: 0.55 }}>Recording… tap to stop (max {MAX_SECONDS}s)</div>
            </div>
          )}

          {phase === "recorded" && (
            <div className="flex flex-col gap-3">
              {clip ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio src={clip} controls className="w-full" />
              ) : (
                <div className="text-center font-bold" style={{ fontSize: 13, opacity: 0.6 }}>Processing…</div>
              )}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Name it (e.g. The Silent Assassin)"
                className="card-ink w-full rounded-2xl bg-white px-4 py-3 font-bold text-ink outline-none"
                style={{ fontSize: 15 }}
              />
              <select
                value={estId}
                onChange={(e) => setEstId(e.target.value)}
                className="card-ink w-full rounded-2xl bg-white px-4 py-3 font-bold text-ink outline-none"
                style={{ fontSize: 15 }}
              >
                <option value="">No joint — freestyle</option>
                {joints.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 rounded-full py-3 font-extrabold underline" style={{ fontSize: 14 }}>
                  Redo
                </button>
                <motion.button
                  onClick={save}
                  whileTap={{ scale: 0.97 }}
                  disabled={saving || !clip}
                  className="card-ink flex-[2] rounded-full py-3 font-extrabold text-ink"
                  style={{ background: "#F5C445", fontSize: 15, boxShadow: "3px 4px 0 rgba(27,23,19,.2)" }}
                >
                  {saving ? "Saving…" : "Drop it on the record →"}
                </motion.button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 text-center font-bold" style={{ fontSize: 12.5, color: "#EE5A29" }}>
              {error}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="mt-6 flex items-center justify-between">
          <span className="eyebrow" style={{ fontSize: 13 }}>THE FART CHART</span>
          {active && <Avatar name={active.name} color={active.color} avatarUrl={active.avatarUrl} size={30} />}
        </div>
        <div className="mt-2.5">
          <FartList farts={farts} activeId={activeId} demo={demo} onChanged={loadFarts} />
        </div>
      </div>
    </PhoneShell>
  );
}
