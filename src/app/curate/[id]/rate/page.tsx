"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  QUESTIONS,
  QUESTION_PALETTE,
  defaultAnswers,
  type AnswerMap,
  type Question,
  type Section,
} from "@/lib/questions";
import { useCurators } from "@/lib/useCurators";
import { saveDraft } from "@/lib/draft";
import { Mascot } from "@/components/art";
import { QuestionArt } from "@/components/QuestionArt";
import { RulerDial } from "@/components/RulerDial";

const SECTION_ORDER: Section[] = ["THE BURGER", "THE JOINT", "CURATOR BIAS"];
const SECTION_BG: Record<Section, string> = {
  "THE BURGER": "#F48FBB",
  "THE JOINT": "#AFC6E9",
  "CURATOR BIAS": "#F0865A",
};
const SECTION_TITLE: Record<Section, string> = {
  "THE BURGER": "The Burger",
  "THE JOINT": "The Joint",
  "CURATOR BIAS": "Curator Bias",
};
const SECTION_BLURB: Record<Section, string> = {
  "THE BURGER": "Name it, price it, then rate every layer of the stack.",
  "THE JOINT": "Now the venue — vibe, lighting, service, comfort.",
  "CURATOR BIAS": "Be honest about your state of mind. The data needs it.",
};
const SECTION_EMOJI: Record<Section, string> = {
  "THE BURGER": "🍔",
  "THE JOINT": "🏠",
  "CURATOR BIAS": "🧠",
};

type Step =
  | { kind: "intro"; section: Section; part: number; count: number }
  | { kind: "question"; q: Question; qNum: number }
  | { kind: "end" };

function buildFlow(): { steps: Step[]; totalQuestions: number } {
  const steps: Step[] = [];
  let qNum = 0;
  SECTION_ORDER.forEach((section, i) => {
    const qs = QUESTIONS.filter((q) => q.section === section);
    steps.push({ kind: "intro", section, part: i + 1, count: qs.length });
    for (const q of qs) {
      qNum += 1;
      steps.push({ kind: "question", q, qNum });
    }
  });
  steps.push({ kind: "end" });
  return { steps, totalQuestions: qNum };
}

export default function RatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { activeId, loading } = useCurators();
  const { steps, totalQuestions } = useMemo(buildFlow, []);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>(defaultAnswers);

  const step = steps[i];
  const end = step.kind === "end";

  useEffect(() => {
    if (!loading && !activeId) router.replace("/curate");
  }, [loading, activeId, router]);

  const dialValue = useMemo(() => {
    if (step.kind !== "question" || step.q.type !== "dial") return 78;
    return Number(answers[step.q.id] ?? 50);
  }, [answers, step]);

  function setAns(key: string, v: AnswerMap[string]) {
    setAnswers((a) => ({ ...a, [key]: v }));
  }

  const canNext =
    step.kind !== "question" ||
    step.q.type !== "text" ||
    String(answers.name).trim().length > 0;

  function next() {
    if (!canNext) return;
    if (i < steps.length - 1) setI(i + 1);
  }
  function back() {
    if (i === 0) {
      router.push("/curate");
      return;
    }
    setI(i - 1);
  }
  function finish() {
    if (!activeId) return;
    saveDraft({ establishmentId: id, curatorId: activeId, answers });
    router.push(`/curate/${id}/scorecard`);
  }

  // Progress = questions completed so far / total.
  const questionsDone = steps
    .slice(0, i)
    .filter((s) => s.kind === "question").length;
  const pct = end ? 100 : Math.round((questionsDone / totalQuestions) * 100);

  const bg = end
    ? "#2E4633"
    : step.kind === "intro"
    ? SECTION_BG[step.section]
    : QUESTION_PALETTE[(step.qNum - 1) % QUESTION_PALETTE.length];

  const isLastQuestionOfAll =
    step.kind === "question" && step.qNum === totalQuestions;

  const topLabel = end
    ? "DONE"
    : step.kind === "intro"
    ? `PART ${step.part} / 3`
    : `${String(step.qNum).padStart(2, "0")} / ${String(totalQuestions).padStart(2, "0")}`;

  const dark = end;

  return (
    <div
      className="flex min-h-[100dvh] w-full justify-center sm:items-center sm:py-8"
      style={{ background: "#EAE3D3" }}
    >
      <motion.div
        animate={{ background: bg }}
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
          <div
            className="font-extrabold"
            style={{ fontSize: 15, letterSpacing: ".04em", color: dark ? "#FFF6E3" : "#1B1713" }}
          >
            {topLabel}
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

        {step.kind === "intro" ? (
          <IntroScreen step={step} onStart={next} onBack={back} />
        ) : (
          <>
            {/* Section pill */}
            <div className="mt-5 flex justify-center">
              <span
                className="rounded-full px-3.5 py-1.5 font-extrabold"
                style={{ background: "#1B1713", color: "#FFF6E3", fontSize: 12, letterSpacing: ".14em" }}
              >
                {end ? "ALL DONE" : (step as { q: Question }).q.section}
              </span>
            </div>

            {/* Hero art — a per-question sticker; the mascot returns at the end */}
            <div className="mt-3.5 flex h-[150px] items-center justify-center">
              {end ? (
                <Mascot value={100} size={160} />
              ) : (
                <QuestionArt
                  id={(step as { q: Question }).q.id}
                  value={dialValue}
                  reactive={(step as { q: Question }).q.type === "dial"}
                />
              )}
            </div>

            {/* Title / sub */}
            <AnimatePresence mode="wait">
              <motion.div
                key={end ? "end" : (step as { q: Question }).q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="px-8 pt-2 text-center"
              >
                <div
                  className="font-black leading-[1.02]"
                  style={{ fontSize: 36, letterSpacing: "-.01em", color: end ? "#FFF6E3" : "#1B1713" }}
                >
                  {end ? "That's a wrap!" : (step as { q: Question }).q.title}
                </div>
                <div
                  className="mt-2 font-semibold"
                  style={{ fontSize: 15, color: end ? "rgba(255,246,227,.7)" : "rgba(27,23,19,.65)" }}
                >
                  {end ? "Your scorecard is sizzling." : (step as { q: Question }).q.sub}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Input area */}
            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={end ? "end-input" : (step as { q: Question }).q.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {end ? (
                    <div className="px-10 text-center font-bold" style={{ color: "#FFF6E3", fontSize: 16 }}>
                      Ketchup with your results on the scorecard →
                    </div>
                  ) : (
                    <QuestionInput
                      q={(step as { q: Question }).q}
                      answers={answers}
                      dialValue={dialValue}
                      setAns={setAns}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center gap-3 px-5 pb-8 pt-2">
              <button
                onClick={back}
                className="px-2 py-3 font-extrabold underline"
                style={{ fontSize: 16, color: dark ? "#FFF6E3" : "#1B1713", textDecorationThickness: 2.5 }}
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
                {end ? "See the scorecard →" : isLastQuestionOfAll ? "Finish →" : "Next →"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function IntroScreen({
  step,
  onStart,
  onBack,
}: {
  step: { section: Section; part: number; count: number };
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key={`intro-${step.section}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="card-ink grid h-24 w-24 place-items-center rounded-3xl"
          style={{ background: "rgba(255,255,255,.85)", fontSize: 48 }}
        >
          {SECTION_EMOJI[step.section]}
        </motion.div>
        <div className="mt-6 eyebrow" style={{ fontSize: 13 }}>
          PART {step.part} OF 3
        </div>
        <div className="mt-1 font-black leading-none text-ink" style={{ fontSize: 44, letterSpacing: "-.02em" }}>
          {SECTION_TITLE[step.section]}
        </div>
        <div className="mt-3 font-semibold text-ink" style={{ fontSize: 15.5, opacity: 0.7, lineHeight: 1.4 }}>
          {SECTION_BLURB[step.section]}
        </div>
        <div
          className="card-ink mt-5 rounded-full px-4 py-1.5 font-extrabold text-ink"
          style={{ background: "rgba(255,255,255,.6)", fontSize: 12.5 }}
        >
          {step.count} question{step.count === 1 ? "" : "s"}
        </div>
      </div>
      <div className="flex items-center gap-3 px-5 pb-8 pt-2">
        <button onClick={onBack} className="px-2 py-3 font-extrabold underline" style={{ fontSize: 16, textDecorationThickness: 2.5 }}>
          Back
        </button>
        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.98 }}
          className="card-ink flex-1 rounded-full py-4 font-extrabold"
          style={{ background: "#1B1713", color: "#FFF6E3", fontSize: 19 }}
        >
          {step.part === 1 ? "Let's go →" : "Continue →"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function QuestionInput({
  q,
  answers,
  dialValue,
  setAns,
}: {
  q: Question;
  answers: AnswerMap;
  dialValue: number;
  setAns: (k: string, v: AnswerMap[string]) => void;
}) {
  if (q.type === "dial") {
    return <RulerDial value={dialValue} onChange={(v) => setAns(q.id, v)} />;
  }
  if (q.type === "text") {
    return (
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
    );
  }
  if (q.type === "price") {
    return (
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
    );
  }
  if (q.type === "chips") {
    return (
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
    );
  }
  if (q.type === "protein") {
    return (
      <ChipRow
        options={q.options ?? []}
        selected={answers.protein ? [answers.protein] : []}
        onToggle={(l) => setAns("protein", answers.protein === l ? null : l)}
      />
    );
  }
  if (q.type === "toggle") {
    return (
      <Toggle
        value={answers[q.id] as boolean | null}
        yesLabel="YES"
        noLabel={q.id === "beenHere" ? "FIRST" : "NOPE"}
        onPick={(v) => setAns(q.id, v)}
      />
    );
  }
  return null;
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
