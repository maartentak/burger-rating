"use client";

import type { AnswerMap } from "./questions";

/** A rate-flow draft, persisted in sessionStorage between the flow and scorecard. */
export interface Draft {
  establishmentId: string;
  curatorId: string;
  answers: AnswerMap;
}

const key = (estId: string) => `pp:draft:${estId}`;

export function saveDraft(d: Draft) {
  sessionStorage.setItem(key(d.establishmentId), JSON.stringify(d));
}

export function loadDraft(estId: string): Draft | null {
  const raw = sessionStorage.getItem(key(estId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

export function clearDraft(estId: string) {
  sessionStorage.removeItem(key(estId));
}
