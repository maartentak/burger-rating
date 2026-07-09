/**
 * Bill-splitting math — the Splitwise-style engine.
 *
 * Everything is kept in integer **cents** so the numbers always add up: no
 * floating-point drift, and every balance sheet nets to exactly zero.
 */

export interface ExpenseInput {
  id: string;
  amountCents: number;
  /** Curator id who footed the bill. */
  paidBy: string;
  /** Curator ids the bill is split between (equal shares). */
  participants: string[];
}

export interface Balance {
  curatorId: string;
  /** Total this curator paid out. */
  paidCents: number;
  /** Total this curator's share of the bills came to. */
  shareCents: number;
  /** paid − share. Positive → they're owed money. Negative → they owe. */
  netCents: number;
}

export interface Settlement {
  /** Debtor — the one who pays. */
  fromId: string;
  /** Creditor — the one who gets paid. */
  toId: string;
  amountCents: number;
}

/**
 * Split an amount into `n` equal integer-cent shares. Any leftover cents from
 * the division are handed to the first shares, so the parts always sum back to
 * the exact total (e.g. €10 / 3 → 334, 333, 333).
 */
export function splitShares(amountCents: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(amountCents / n);
  const remainder = amountCents - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}

/**
 * Tally up who paid what and who owes what across every expense.
 * Returns one balance per curator id passed in (even if they have no activity).
 */
export function computeBalances(
  expenses: ExpenseInput[],
  curatorIds: string[]
): Balance[] {
  const paid = new Map<string, number>();
  const share = new Map<string, number>();
  for (const id of curatorIds) {
    paid.set(id, 0);
    share.set(id, 0);
  }

  for (const e of expenses) {
    const parts = e.participants.filter((p) => curatorIds.includes(p));
    if (parts.length === 0) continue;
    paid.set(e.paidBy, (paid.get(e.paidBy) ?? 0) + e.amountCents);
    const shares = splitShares(e.amountCents, parts.length);
    parts.forEach((pid, i) => share.set(pid, (share.get(pid) ?? 0) + shares[i]));
  }

  return curatorIds.map((id) => {
    const p = paid.get(id) ?? 0;
    const s = share.get(id) ?? 0;
    return { curatorId: id, paidCents: p, shareCents: s, netCents: p - s };
  });
}

/**
 * Greedy debt simplification: repeatedly settle the biggest debtor against the
 * biggest creditor. For three people this always yields the minimal set of
 * transfers to square everyone up.
 */
export function settle(balances: Balance[]): Settlement[] {
  const creditors = balances
    .filter((b) => b.netCents > 0)
    .map((b) => ({ id: b.curatorId, amt: b.netCents }))
    .sort((a, b) => b.amt - a.amt);
  const debtors = balances
    .filter((b) => b.netCents < 0)
    .map((b) => ({ id: b.curatorId, amt: -b.netCents }))
    .sort((a, b) => b.amt - a.amt);

  const out: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0) {
      out.push({ fromId: debtors[i].id, toId: creditors[j].id, amountCents: pay });
    }
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt === 0) i++;
    if (creditors[j].amt === 0) j++;
  }
  return out;
}

/** Format cents as a euro string, e.g. 1250 → "€12.50". */
export function euros(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}€${(Math.abs(cents) / 100).toFixed(2)}`;
}

/** Parse a free-text euro amount ("12,50", "€12.5", "10") into cents. */
export function parseEuros(input: string): number | null {
  const cleaned = input.replace(/[€\s]/g, "").replace(",", ".");
  if (!cleaned || !/^\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}
