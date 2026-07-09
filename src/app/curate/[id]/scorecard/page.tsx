"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { loadDraft, clearDraft, type Draft } from "@/lib/draft";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { Mascot } from "@/components/art";
import { tier, mean, round } from "@/lib/scoring";
import { BURGER_COMPONENT_DIALS, JOINT_DIALS } from "@/lib/questions";

const BURGER_LABELS: Record<string, string> = {
  patty: "The patty",
  bun: "The bun",
  cheese: "Cheese & toppings",
  sauce: "Sauce & seasoning",
  build: "Build & balance",
  value: "Value",
};
const JOINT_LABELS: Record<string, string> = {
  ambiance: "Ambiance",
  lighting: "Lighting",
  service: "Service",
  comfort: "Comfort",
};

export default function ScorecardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { curators } = useCurators();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDraft(id);
    if (!d) {
      router.replace(`/curate/${id}/rate`);
      return;
    }
    setDraft(d);
    fetch(`/api/establishments/${id}`)
      .then((r) => r.json())
      .then((res) => setPlaceName(res.establishment?.name ?? ""))
      .catch(() => {});
  }, [id, router]);

  const curatorName = useMemo(
    () => curators.find((c) => c.id === draft?.curatorId)?.name ?? "chef",
    [curators, draft]
  );

  const computed = useMemo(() => {
    if (!draft) return null;
    const a = draft.answers;
    const num = (k: string) => Number(a[k] ?? 50);
    const overall = num("overall");
    const overallJoint = num("overallJoint");
    return {
      burgerRows: BURGER_COMPONENT_DIALS.map((k) => ({ k, label: BURGER_LABELS[k], v: num(k) })),
      jointRows: JOINT_DIALS.map((k) => ({ k, label: JOINT_LABELS[k], v: num(k) })),
      burgerAvg: round(mean(BURGER_COMPONENT_DIALS.map((k) => num(k)))),
      jointAvg: round(mean(JOINT_DIALS.map((k) => num(k)))),
      overall,
      overallJoint,
      total: round(overall * 0.7 + overallJoint * 0.3),
    };
  }, [draft]);

  if (!draft || !computed) {
    return (
      <PhoneShell bg="#2E4633">
        <div className="flex flex-1 items-center justify-center" style={{ color: "#FFF6E3" }}>
          Loading…
        </div>
      </PhoneShell>
    );
  }

  const a = draft.answers;
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  async function lockIn() {
    if (!draft) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ establishmentId: id, curatorId: draft.curatorId, ...draft.answers }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Could not save. Try again.");
        return;
      }
      clearDraft(id);
      router.push(`/establishment/${id}?mine=${draft.curatorId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PhoneShell bg="#2E4633">
      {/* Header */}
      <div className="px-6 pt-4 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <Mascot value={95} size={44} bob={false} className="pp-wig" />
          <span className="font-black" style={{ fontSize: 32, letterSpacing: "-.01em", color: "#FFF6E3" }}>
            Final answer, {curatorName}?
          </span>
        </div>
        <div className="mt-0.5 font-semibold" style={{ fontSize: 13.5, color: "rgba(255,246,227,.65)" }}>
          {placeName || "Your joint"} · {today}
        </div>
      </div>

      {/* Receipt */}
      <div className="flex-1 overflow-y-auto px-5 pb-2 pt-4 no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -0.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="card-ink rounded-[22px] p-5"
          style={{ background: "#FFFDF7" }}
        >
          {/* Burger name + price */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-black text-ink" style={{ fontSize: 21 }}>
                {String(a.name) || "Unnamed burger"}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {a.style.map((s) => (
                  <Tag key={s} bg="#F5C445" text={s.toUpperCase()} />
                ))}
                {a.protein && <Tag bg="#AFC6E9" text={String(a.protein).toUpperCase()} />}
                {a.again === true && <Tag bg="#A5B45B" fg="#fff" text="WOULD ORDER AGAIN" />}
              </div>
            </div>
            {String(a.price) && (
              <div className="font-black text-ink" style={{ fontSize: 19 }}>
                €{String(a.price)}
              </div>
            )}
          </div>

          <Dashed />
          <SectionHead label="THE BURGER" mult="×0.7" />
          <Rows rows={computed.burgerRows} />
          <SubTotal label="component avg" value={computed.burgerAvg} />
          <HighlightRow label="Overall burger (gut)" value={computed.overall} />

          <Dashed />
          <SectionHead label="THE JOINT" mult="×0.3" />
          <Rows rows={computed.jointRows} />
          <SubTotal label="component avg" value={computed.jointAvg} />
          <HighlightRow label="Overall joint (gut)" value={computed.overallJoint} />

          <div className="my-4 border-t-[2.5px] border-ink" />
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow" style={{ fontSize: 12 }}>TOTAL SCORE</div>
              <div className="font-semibold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.5)" }}>
                {computed.overall} ×0.7 + {computed.overallJoint} ×0.3 — house rules
              </div>
            </div>
            <div className="font-black leading-none text-ink" style={{ fontSize: 52, letterSpacing: "-.03em" }}>
              {computed.total}
              <span style={{ fontSize: 24, verticalAlign: 14 }}>%</span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <div
              className="font-black"
              style={{
                transform: "rotate(-6deg)",
                border: "3px solid #E4589B",
                color: "#E4589B",
                fontSize: 13,
                letterSpacing: ".12em",
                padding: "7px 14px",
                borderRadius: 10,
                opacity: 0.9,
              }}
            >
              {stamp(computed.total)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer CTAs */}
      <div className="flex flex-col gap-2.5 px-6 pb-8 pt-2">
        {error && (
          <div className="card-ink rounded-2xl px-4 py-2.5 text-center font-bold" style={{ background: "#F0865A", fontSize: 12.5 }}>
            {error}
          </div>
        )}
        <motion.button
          onClick={lockIn}
          whileTap={{ scale: 0.98 }}
          disabled={submitting}
          className="card-ink rounded-full py-4 font-extrabold text-ink"
          style={{ background: "#F5C445", fontSize: 19, boxShadow: "4px 5px 0 rgba(0,0,0,.35)" }}
        >
          {submitting ? "Locking…" : "Lock it in →"}
        </motion.button>
        <button
          onClick={() => router.push(`/curate/${id}/rate`)}
          className="py-1.5 font-extrabold underline"
          style={{ fontSize: 15, color: "rgba(255,246,227,.7)", textDecorationThickness: 2 }}
        >
          One more look
        </button>
      </div>
    </PhoneShell>
  );
}

function Tag({ bg, text, fg = "#1B1713" }: { bg: string; text: string; fg?: string }) {
  return (
    <span
      className="rounded-full font-extrabold"
      style={{ fontSize: 11, padding: "3px 9px", background: bg, border: "1.5px solid #1B1713", color: fg }}
    >
      {text}
    </span>
  );
}

function Dashed() {
  return <div className="my-3.5" style={{ borderTop: "2.5px dashed rgba(27,23,19,.25)" }} />;
}

function SectionHead({ label, mult }: { label: string; mult: string }) {
  return (
    <div className="flex justify-between eyebrow" style={{ fontSize: 12 }}>
      <span>{label}</span>
      <span>{mult}</span>
    </div>
  );
}

function Rows({ rows }: { rows: { k: string; label: string; v: number }[] }) {
  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.k} className="flex items-center gap-2.5">
          <span className="flex-1 font-bold text-ink" style={{ fontSize: 15 }}>{r.label}</span>
          <div className="overflow-hidden rounded" style={{ width: 70, height: 7, background: "rgba(27,23,19,.12)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${r.v}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ height: "100%", borderRadius: 4, background: tier(r.v).bg }}
            />
          </div>
          <span className="text-right font-black text-ink" style={{ width: 30, fontSize: 15 }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

function SubTotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-2 flex justify-end font-extrabold" style={{ fontSize: 13, color: "rgba(27,23,19,.55)" }}>
      {label} · {value}
    </div>
  );
}

function HighlightRow({ label, value }: { label: string; value: number }) {
  const t = tier(value);
  return (
    <div className="mt-2 flex items-center gap-2.5 rounded-xl px-2.5 py-2" style={{ background: "rgba(27,23,19,.05)" }}>
      <span className="flex-1 font-black text-ink" style={{ fontSize: 15 }}>{label}</span>
      <span
        className="card-ink rounded-full font-black"
        style={{ background: t.bg, color: t.fg, fontSize: 14, padding: "3px 10px", borderWidth: 2 }}
      >
        {value}
      </span>
    </div>
  );
}

function stamp(total: number): string {
  if (total >= 90) return "CERTIFIED JUICY";
  if (total >= 80) return "SOLID PATTY";
  if (total >= 70) return "PASSES MUSTER";
  if (total >= 55) return "MID-GRADE";
  return "NEEDS WORK";
}
