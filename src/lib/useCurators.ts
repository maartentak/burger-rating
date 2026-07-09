"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CURATORS, type Curator, type CuratorId } from "./curators";

const KEY = "pp:activeCurator";

/**
 * Loads the roster from the API and tracks which curator is "me" (saved locally).
 * No login — the active curator is just a device-local preference.
 */
export function useCurators() {
  const [curators, setCurators] = useState<Curator[]>(DEFAULT_CURATORS);
  const [activeId, setActiveId] = useState<CuratorId | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/curators")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (Array.isArray(d.curators)) setCurators(d.curators);
        setDemo(Boolean(d.demo));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    const saved = localStorage.getItem(KEY) as CuratorId | null;
    if (saved) setActiveId(saved);
    return () => {
      alive = false;
    };
  }, []);

  const setActive = useCallback((id: CuratorId) => {
    setActiveId(id);
    localStorage.setItem(KEY, id);
  }, []);

  const patchCurator = useCallback(async (id: string, patch: Partial<Curator>) => {
    setCurators((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await fetch("/api/curators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => {});
  }, []);

  const active = curators.find((c) => c.id === activeId) ?? null;

  return { curators, active, activeId, setActive, patchCurator, loading, demo };
}
