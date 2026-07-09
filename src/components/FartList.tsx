"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "./Avatar";
import { ScoreChip } from "./ScoreChip";
import type { FartView } from "@/db/data";
import type { CuratorId } from "@/lib/curators";

const MEDALS = ["🥇", "🥈", "🥉"];

export function FartList({
  farts,
  activeId,
  demo,
  showJoint = true,
  onChanged,
}: {
  farts: FartView[];
  activeId: CuratorId | null;
  demo: boolean;
  showJoint?: boolean;
  onChanged: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  function play(id: string) {
    if (!audioRef.current) return;
    if (playingId === id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current.src = `/api/farts/${id}/audio`;
    audioRef.current.play().then(() => setPlayingId(id)).catch(() => setPlayingId(null));
  }

  if (farts.length === 0) {
    return (
      <div className="card-ink rounded-2xl p-5 text-center" style={{ background: "#FFFDF7" }}>
        <div className="font-black" style={{ fontSize: 16 }}>No farts yet. 💨</div>
        <div className="mt-1 font-semibold" style={{ fontSize: 13, opacity: 0.6 }}>
          Be the first to drop one on the record.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} hidden />
      {farts.map((f, i) => (
        <FartRow
          key={f.id}
          fart={f}
          rank={i + 1}
          isPlaying={playingId === f.id}
          activeId={activeId}
          demo={demo}
          showJoint={showJoint}
          onPlay={() => play(f.id)}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

function FartRow({
  fart,
  rank,
  isPlaying,
  activeId,
  demo,
  showJoint,
  onPlay,
  onChanged,
}: {
  fart: FartView;
  rank: number;
  isPlaying: boolean;
  activeId: CuratorId | null;
  demo: boolean;
  showJoint: boolean;
  onPlay: () => void;
  onChanged: () => void;
}) {
  const mine = activeId ? fart.scores.find((s) => s.curatorId === activeId)?.score : undefined;
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(mine ?? 50);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!activeId) return;
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch("/api/fart-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fartId: fart.id, curatorId: activeId, score: val }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setErr(d.error ?? "Could not score.");
        return;
      }
      setOpen(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-ink rounded-2xl px-3.5 py-3" style={{ background: "#FFFDF7" }}>
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>
          {rank <= 3 ? MEDALS[rank - 1] : <span className="font-black" style={{ fontSize: 15, color: "rgba(27,23,19,.35)" }}>{rank}</span>}
        </span>
        <button
          onClick={onPlay}
          className="card-ink grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{ background: isPlaying ? "#F5C445" : "#AFC6E9", fontSize: 18 }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-black text-ink" style={{ fontSize: 15.5 }}>{fart.name}</div>
          <div className="truncate font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
            by {fart.curatorName}
            {showJoint && fart.establishmentName ? ` · ${fart.establishmentName}` : ""}
            {fart.scoreCount > 0 ? ` · ${fart.scoreCount} vote${fart.scoreCount === 1 ? "" : "s"}` : ""}
          </div>
        </div>
        <Avatar name={fart.curatorName} color={fart.color} size={30} />
        {fart.avgScore != null ? (
          <ScoreChip score={fart.avgScore} size={13} />
        ) : (
          <span className="font-extrabold" style={{ fontSize: 11, color: "rgba(27,23,19,.4)" }}>—</span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="card-ink rounded-full px-2.5 py-1.5 font-extrabold"
          style={{ background: mine != null ? "#A5B45B" : "#F48FBB", color: mine != null ? "#fff" : "#1B1713", fontSize: 11.5 }}
        >
          {mine != null ? `You ${mine}` : "Rate"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                className="flex-1 accent-[#E4589B]"
                style={{ height: 28 }}
                disabled={!activeId}
              />
              <span className="font-black text-ink" style={{ width: 38, textAlign: "right", fontSize: 18 }}>{val}</span>
              <button
                onClick={save}
                disabled={saving || !activeId}
                className="card-ink rounded-full px-4 py-2 font-extrabold"
                style={{ background: "#F5C445", fontSize: 13 }}
              >
                {saving ? "…" : "Save"}
              </button>
            </div>
            {!activeId && (
              <div className="mt-1 font-bold" style={{ fontSize: 11.5, color: "#E4589B" }}>
                Pick your badge on the home screen to score.
              </div>
            )}
            {demo && (
              <div className="mt-1 font-bold" style={{ fontSize: 11.5, color: "rgba(27,23,19,.5)" }}>
                Demo mode — scoring needs Neon connected.
              </div>
            )}
            {err && <div className="mt-1 font-bold" style={{ fontSize: 11.5, color: "#EE5A29" }}>{err}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
