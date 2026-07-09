"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";
import { euros, parseEuros } from "@/lib/split";
import type { SplitSummary } from "@/db/data";
import type { EstablishmentSummary } from "@/lib/aggregate";
import type { CuratorId } from "@/lib/curators";

const EMPTY: SplitSummary = {
  expenses: [],
  balances: [],
  settlements: [],
  totalCents: 0,
  demo: false,
};

export default function SplitPage() {
  return (
    <Suspense fallback={<PhoneShell><div className="flex-1" /></PhoneShell>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const { curators, active, activeId } = useCurators();
  const preEst = useSearchParams().get("establishmentId");

  const [summary, setSummary] = useState<SplitSummary>(EMPTY);
  const [joints, setJoints] = useState<EstablishmentSummary[]>([]);

  // form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [withIds, setWithIds] = useState<string[]>([]);
  const [estId, setEstId] = useState<string>(preEst ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((d) => setSummary({ ...EMPTY, ...d }))
      .catch(() => {});
  }

  useEffect(() => {
    load();
    fetch("/api/establishments")
      .then((r) => r.json())
      .then((d) => setJoints(d.establishments ?? []))
      .catch(() => {});
  }, []);

  // Default the payer to me, and split between everyone, once the roster loads.
  useEffect(() => {
    if (!paidBy && activeId) setPaidBy(activeId);
    if (withIds.length === 0 && curators.length)
      setWithIds(curators.map((c) => c.id));
  }, [activeId, curators, paidBy, withIds.length]);

  function toggleWith(id: string) {
    setWithIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  async function save() {
    setError(null);
    const cents = parseEuros(amount);
    if (!paidBy) return setError("Who paid?");
    if (cents == null) return setError("Enter a valid amount.");
    if (withIds.length === 0) return setError("Pick who's splitting it.");

    setSaving(true);
    try {
      const r = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidBy,
          amountCents: cents,
          participants: withIds,
          description: desc,
          establishmentId: estId || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Could not save.");
        return;
      }
      setDesc("");
      setAmount("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" }).catch(() => {});
    load();
  }

  const owed = summary.balances.filter((b) => b.netCents !== 0);

  return (
    <PhoneShell>
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/")} />
        <span className="eyebrow">THE TAB</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
          Split the bill 💸
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
          Log who paid, split it fair, and see who owes who.
        </p>

        {/* ---- Add an expense ---- */}
        <div className="card-ink mt-4 rounded-3xl p-5" style={{ background: "#FFF6E3" }}>
          {!activeId && (
            <div className="mb-3 text-center font-bold" style={{ fontSize: 12.5, color: "#E4589B" }}>
              Pick your badge on the home screen first.
            </div>
          )}

          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={120}
            placeholder="What for? (e.g. Burgers at Bun Intended)"
            className="card-ink w-full rounded-2xl bg-white px-4 py-3 font-bold text-ink outline-none"
            style={{ fontSize: 15 }}
          />

          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-[52px] w-[52px] shrink-0 place-items-center card-ink rounded-2xl bg-white font-black" style={{ fontSize: 22 }}>
              €
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="card-ink w-full rounded-2xl bg-white px-4 py-3 font-black text-ink outline-none"
              style={{ fontSize: 20 }}
            />
          </div>

          <div className="mt-4 eyebrow" style={{ fontSize: 11 }}>PAID BY</div>
          <div className="mt-2 flex gap-2">
            {curators.map((c) => {
              const on = paidBy === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setPaidBy(c.id)}
                  className="card-ink flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5"
                  style={{ background: on ? c.color : "#fff", opacity: on ? 1 : 0.65 }}
                >
                  <Avatar name={c.name} color={c.color} avatarUrl={c.avatarUrl} size={30} />
                  <span className="font-extrabold text-ink" style={{ fontSize: 12 }}>{c.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 eyebrow" style={{ fontSize: 11 }}>SPLIT BETWEEN</div>
          <div className="mt-2 flex gap-2">
            {curators.map((c) => {
              const on = withIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleWith(c.id)}
                  className="card-ink flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5"
                  style={{ background: on ? "#A5B45B" : "#fff", opacity: on ? 1 : 0.6 }}
                >
                  <span className="font-extrabold text-ink" style={{ fontSize: 12.5 }}>
                    {on ? "✓ " : ""}{c.name}
                  </span>
                </button>
              );
            })}
          </div>
          {amount && parseEuros(amount) != null && withIds.length > 0 && (
            <div className="mt-2 font-bold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
              {euros(Math.round((parseEuros(amount) ?? 0) / withIds.length))} each
            </div>
          )}

          <select
            value={estId}
            onChange={(e) => setEstId(e.target.value)}
            className="card-ink mt-4 w-full rounded-2xl bg-white px-4 py-3 font-bold text-ink outline-none"
            style={{ fontSize: 14 }}
          >
            <option value="">No joint — freestyle</option>
            {joints.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>

          <motion.button
            onClick={save}
            whileTap={{ scale: 0.98 }}
            disabled={saving || !activeId}
            className="card-ink mt-4 w-full rounded-full py-3 font-extrabold text-ink"
            style={{ background: "#F5C445", fontSize: 15, boxShadow: "3px 4px 0 rgba(27,23,19,.2)", opacity: activeId ? 1 : 0.5 }}
          >
            {saving ? "Adding…" : "Add to the tab →"}
          </motion.button>

          {error && (
            <div className="mt-3 text-center font-bold" style={{ fontSize: 12.5, color: "#EE5A29" }}>
              {error}
            </div>
          )}
          {summary.demo && (
            <div className="mt-3 text-center font-bold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
              Demo mode — connect Neon to keep a real tab.
            </div>
          )}
        </div>

        {/* ---- Settle up ---- */}
        <div className="mt-6 flex items-center justify-between">
          <span className="eyebrow" style={{ fontSize: 13 }}>WHO OWES WHO</span>
          {active && <Avatar name={active.name} color={active.color} avatarUrl={active.avatarUrl} size={30} />}
        </div>

        {summary.settlements.length === 0 ? (
          <div className="card-ink mt-2.5 rounded-2xl p-5 text-center" style={{ background: "#FFFDF7" }}>
            <div className="font-black" style={{ fontSize: 16 }}>
              {summary.expenses.length === 0 ? "No bills yet. 🧾" : "All square. 🤝"}
            </div>
            <div className="mt-1 font-semibold" style={{ fontSize: 13, opacity: 0.6 }}>
              {summary.expenses.length === 0
                ? "Add the first bill above."
                : "Nobody owes anybody a cent."}
            </div>
          </div>
        ) : (
          <div className="mt-2.5 flex flex-col gap-2.5">
            {summary.settlements.map((s, i) => (
              <div
                key={i}
                className="card-ink flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: "#FFFDF7" }}
              >
                <Avatar name={s.fromName} color={s.fromColor} size={34} />
                <div className="min-w-0 flex-1 font-black text-ink" style={{ fontSize: 14.5 }}>
                  {s.fromName} <span style={{ opacity: 0.45 }}>pays</span> {s.toName}
                </div>
                <Avatar name={s.toName} color={s.toColor} size={34} />
                <div
                  className="card-ink rounded-full px-3 py-1.5 font-black text-ink"
                  style={{ background: "#F5C445", fontSize: 14 }}
                >
                  {euros(s.amountCents)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- Balances ---- */}
        {owed.length > 0 && (
          <>
            <div className="mt-6 eyebrow" style={{ fontSize: 13 }}>THE BALANCE SHEET</div>
            <div className="mt-2.5 flex flex-col gap-2">
              {summary.balances.map((b) => (
                <div
                  key={b.curatorId}
                  className="card-ink flex items-center gap-3 rounded-2xl px-4 py-2.5"
                  style={{ background: "#FFFDF7" }}
                >
                  <Avatar name={b.name} color={b.color} size={30} />
                  <div className="flex-1 font-black text-ink" style={{ fontSize: 14 }}>{b.name}</div>
                  <div
                    className="font-black"
                    style={{
                      fontSize: 14,
                      color: b.netCents > 0 ? "#3F7D3B" : b.netCents < 0 ? "#EE5A29" : "rgba(27,23,19,.4)",
                    }}
                  >
                    {b.netCents > 0
                      ? `gets back ${euros(b.netCents)}`
                      : b.netCents < 0
                        ? `owes ${euros(-b.netCents)}`
                        : "settled"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---- The tab (expense list) ---- */}
        {summary.expenses.length > 0 && (
          <>
            <div className="mt-6 flex items-center justify-between">
              <span className="eyebrow" style={{ fontSize: 13 }}>THE TAB</span>
              <span className="font-black text-ink" style={{ fontSize: 14 }}>
                {euros(summary.totalCents)} total
              </span>
            </div>
            <div className="mt-2.5 flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {summary.expenses.map((e) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    curators={curators}
                    demo={summary.demo}
                    onDelete={() => remove(e.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </PhoneShell>
  );
}

function ExpenseRow({
  expense,
  curators,
  demo,
  onDelete,
}: {
  expense: SplitSummary["expenses"][number];
  curators: { id: string; name: string }[];
  demo: boolean;
  onDelete: () => void;
}) {
  const names = expense.participants
    .map((id) => curators.find((c) => c.id === id)?.name ?? id)
    .join(", ");
  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -20 }}
      className="card-ink rounded-2xl px-4 py-3"
      style={{ background: "#FFFDF7" }}
    >
      <div className="flex items-center gap-3">
        <Avatar name={expense.paidByName} color={expense.color} size={34} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-black text-ink" style={{ fontSize: 15 }}>{expense.description}</div>
          <div className="truncate font-semibold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
            {expense.paidByName} paid
            {expense.establishmentName ? ` · ${expense.establishmentName}` : ""}
            {` · split ${expense.participants.length}-way`}
          </div>
        </div>
        <div className="font-black text-ink" style={{ fontSize: 15 }}>{euros(expense.amountCents)}</div>
        {!demo && (
          <button
            onClick={onDelete}
            aria-label="Remove"
            className="font-black"
            style={{ fontSize: 16, color: "rgba(27,23,19,.35)" }}
          >
            ✕
          </button>
        )}
      </div>
      <div className="mt-1 font-semibold" style={{ fontSize: 11.5, color: "rgba(27,23,19,.4)" }}>
        {names}
      </div>
    </motion.div>
  );
}
