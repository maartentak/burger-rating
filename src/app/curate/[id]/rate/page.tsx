"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  QUESTIONS,
  QUESTION_PALETTE,
  defaultAnswers,
  type AnswerMap,
} from "@/lib/questions";
import { useCurators } from "@/lib/useCurators";
import { saveDraft } from "@/lib/draft";
import { Mascot } from "@/components/art";
import { RulerDial } from "@/components/RulerDial";

export default function RatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { activeId, loading } = useCurators();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>(defaultAnswers);

  const n = QUESTIONS.length;
  const end = step >= n;
  const q = QUESTIONS[Math.min(step, n - 1)];
  const bg = QUESTION_PALETTE[Math.min(step, n - 1) % QUESTION_PALETTE.length];

  // Redirect to picker if no curator chosen.
  useEffect(() => {
    if (!loading && !activeId) router.replace("/curate");
  }, [loading, activeId, router]);

  const dialValue = useMemo(() => {
    if (end || q.type !== "dial") return 78;
    return Number(answers[q.id] ?? 50);
  }, [answers, q, end]);

  function setAns(key: string, v: AnswerMap[string]) {
    setAnswers((a) => ({ ...a, [key]: v }));
  }

  const canNext = end || q.type !== "text" || String(answers.name).trim().length > 0;

  function next() {
    if (!canNext) return;
    if (end) return;
    if (step + 1 >= n) {
      setStep(n); // show the "wrap" end state
      return;
    }
    setStep(step + 1);
  }
  function back() {
    if (step === 0) {
      router.push("/curate");
      return;
    }
    setStep(Math.max(0, step - 1));
  }

  function finish() {
    if (!activeId) return;
    saveDraft({ establishmentId: id, curatorId: activeId, answers });
    router.push(`/curate/${id}/scorecard`);
  }

  const pct = Math.round((Math.min(step, n) / n) * 100);
  const stepLabel = `${String(Math.min(step + 1, n)).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;

  return (
    <div className="flex min-h-[100dvh] w-full justify-center sm:items-center sm:py-8" style={{ background: "#EAE3D3" }}>
      <motion.div
        animate={{ background: end ? "#2E4633" : bg }}
        transition={{ duration: 0.35 }}
        className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden sm:h-[812px] sm:min-h-0 sm:max-w-[390px] sm:rounded-[48px] sm:border-[3px] sm:border-ink sm:shadow-frame"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4">
          <motion.button
            onClick={back}
            whileTap={{ scale: 0.9 }}
            className="card-ink grid h-[42px] w-[42px] place-items-center rounded-full font-extrabold text-ink"
            style={{ background: "rgba(255,255,255,.7)", fontSize: 18 }}
            aria-label="Back"
          >
            ←
          </motion.button>
          <div className="font-extrabold text-ink" style={{ fontSize: 15, letterSpacing: ".04em" }}>
            {stepLabel}
          </div>
          <button
            onClick={() => router.push("/")}
            aria-label="Menu"
            className="card-ink grid h-[42px] w-[42px] place-items-center rounded-full"
            style={{ background: "#1B1713" }}
          >
            <span className="grid grid-cols-2 gap-[3px]">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </span>
          </button>
        </div>

        {/* Progress */}
        <div className="mx-5 mt-3.5 h-2 overflow-hidden rounded" style={{ background: "rgba(27,23,19,.15)" }}>
          <motion.div
            className="h-full rounded"
            style={{ background: "#1B1713" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Section pill */}
        <div className="mt-5 flex justify-center">
          <span
            className="rounded-full px-3.5 py-1.5 font-extrabold"
            style={{ background: "#1B1713", color: "#FFF6E3", fontSize: 12, letterSpacing: ".14em" }}
          >
            {end ? "ALL DONE" : q.section}
          </span>
        </div>

        {/* Mascot */}
        <div className="mt-3.5 flex justify-center">
          <Mascot value={end ? 100 : dialValue} size={168} />
        </div>

        {/* Title / sub */}
        <AnimatePresence mode="wait">
          <motion.div
            key={end ? "end" : q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="px-8 pt-2 text-center"
          >
            <div
              className="font-black leading-[1.02] text-ink"
              style={{ fontSize: 36, letterSpacing: "-.01em", color: end ? "#FFF6E3" : "#1B1713" }}
            >
              {end ? "That's a wrap!" : q.title}
            </div>
            <div
              className="mt-2 font-semibold"
              style={{ fontSize: 15, color: end ? "rgba(255,246,227,.7)" : "rgba(27,23,19,.65)" }}
            >
              {end ? "Your scorecard is sizzling." : q.sub}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Input area */}
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={end ? "end-input" : q.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {end ? (
                <div className="px-10 text-center font-bold" style={{ color: "#FFF6E3", fontSize: 16 }}>
                  Ketchup with your results on the scorecard →
                </div>
              ) : q.type === "dial" ? (
                <RulerDial value={dialValue} onChange={(v) => setAns(q.id, v)} />
              ) : q.type === "text" ? (
                <div className="px-8">
                  <input
                    autoFocus
                    value={String(answers.name)}
                    onChange={(e) => setAns("name", e.target.value)}
                    placeholder="e.g. The Big Kahuna"
                    className="card-ink w-full rounded-[20px] px-5 py-4 text-center font-extrabold text-ink outline-none"
                    style={{ background: "rgba(255,255,255,.8)", fontSize: 24 }}
                  />
                </div>
              ) : q.type === "price" ? (
                <div className="flex items-center justify-center gap-2.5 px-8">
                  <span className="font-black text-ink" style={{ fontSize: 56 }}>€</span>
                  <input
                    value={String(answers.price)}
                    onChange={(e) => setAns("price", e.target.value.replace(/[^0-9.,]/g, ""))}
                    inputMode="decimal"
                    placeholder="0"
                    className="card-ink w-[180px] rounded-[20px] px-4 py-2 text-center font-black text-ink outline-none"
                    style={{ background: "rgba(255,255,255,.8)", fontSize: 56 }}
                  />
                </div>
              ) : q.type === "chips" ? (
                <ChipRow
                  options={q.options ?? []}
                  selected={answers.style}
                  onToggle={(l) =>
                    setAns(
                      "style",
                      answers.style.includes(l)
                        ? answers.style.filter((x) => x !== l)
                        : [...answers.style, l]
                    )
                  }
                />
              ) : q.type === "protein" ? (
                <ChipRow
                  options={q.options ?? []}
                  selected={answers.protein ? [answers.protein] : []}
                  onToggle={(l) => setAns("protein", answers.protein === l ? null : l)}
                />
              ) : q.type === "toggle" ? (
                <Toggle
                  value={answers[q.id] as boolean | null}
                  yesLabel={q.id === "beenHere" ? "YES" : "YES"}
                  noLabel={q.id === "beenHere" ? "FIRST" : "NOPE"}
                  onPick={(v) => setAns(q.id, v)}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center gap-3 px-5 pb-8 pt-2">
          <button
            onClick={back}
            className="px-2 py-3 font-extrabold underline"
            style={{ fontSize: 16, color: end ? "#FFF6E3" : "#1B1713", textDecorationThickness: 2.5 }}
          >
            Back
          </button>
          <motion.button
            onClick={end ? finish : next}
            whileTap={{ scale: 0.98 }}
            disabled={!canNext}
            className="card-ink flex-1 rounded-full py-4 font-extrabold"
            style={{
              background: end ? "#F5C445" : "#1B1713",
              color: end ? "#1B1713" : "#FFF6E3",
              fontSize: 19,
              opacity: canNext ? 1 : 0.5,
              boxShadow: end ? "4px 5px 0 rgba(0,0,0,.35)" : "none",
            }}
          >
            {end ? "See the scorecard →" : step + 1 >= n ? "Finish →" : "Next →"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 px-8">
      {options.map((l) => {
        const on = selected.includes(l);
        return (
          <motion.button
            key={l}
            whileTap={{ scale: 0.94 }}
            onClick={() => onToggle(l)}
            className="card-ink rounded-full px-5 py-3 font-extrabold"
            style={{
              background: on ? "#1B1713" : "rgba(255,255,255,.8)",
              color: on ? "#fff" : "#1B1713",
              fontSize: 17,
              transition: "background .15s, color .15s",
            }}
          >
            {l}
          </motion.button>
        );
      })}
    </div>
  );
}

function Toggle({
  value,
  yesLabel,
  noLabel,
  onPick,
}: {
  value: boolean | null;
  yesLabel: string;
  noLabel: string;
  onPick: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-center gap-3 px-8">
      {[
        { v: true, label: yesLabel },
        { v: false, label: noLabel },
      ].map((o) => {
        const on = value === o.v;
        return (
          <motion.button
            key={o.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPick(o.v)}
            className="card-ink rounded-[24px] px-9 py-5 font-black"
            style={{
              background: on ? "#1B1713" : "rgba(255,255,255,.8)",
              color: on ? "#fff" : "#1B1713",
              fontSize: 22,
              transition: "background .15s, color .15s",
            }}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}
