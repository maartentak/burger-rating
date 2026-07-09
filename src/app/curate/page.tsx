"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";
import { ScoreChip } from "@/components/ScoreChip";
import type { PlaceResult } from "@/lib/places";
import type { EstablishmentSummary } from "@/lib/aggregate";

export default function CuratePage() {
  const router = useRouter();
  const { active, curators, activeId, setActive } = useCurators();

  const [q, setQ] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [placesConfigured, setPlacesConfigured] = useState(true);
  const [existing, setExisting] = useState<EstablishmentSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/establishments")
      .then((r) => r.json())
      .then((d) => setExisting(d.establishments ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setResults(d.results ?? []);
        setPlacesConfigured(d.configured ?? false);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [q]);

  async function pickPlace(p: PlaceResult) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/establishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googlePlaceId: p.placeId,
          name: p.name,
          area: p.area,
          address: p.address,
          photoName: p.photoName,
          lat: p.lat,
          lng: p.lng,
          pickedBy: activeId,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Could not add joint.");
        return;
      }
      router.push(`/curate/${d.establishment.id}/rate`);
    } finally {
      setBusy(false);
    }
  }

  if (!activeId) {
    return (
      <PhoneShell>
        <div className="flex items-center gap-3 px-5 pt-4">
          <BackButton onClick={() => router.push("/")} />
          <span className="eyebrow">CURATION</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8">
          <p className="text-center font-black" style={{ fontSize: 22 }}>
            Who's rating today?
          </p>
          <div className="flex gap-4">
            {curators.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)} className="flex flex-col items-center gap-1.5">
                <Avatar name={c.name} color={c.color} avatarUrl={c.avatarUrl} size={58} />
                <span className="font-extrabold" style={{ fontSize: 12 }}>
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.push("/")} />
          <span className="eyebrow">CURATION</span>
        </div>
        {active && <Avatar name={active.name} color={active.color} avatarUrl={active.avatarUrl} size={34} />}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
          Where are we eating?
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
          Search the joint, we'll pull the details.
        </p>

        <div className="mt-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Bun Intended"
            className="card-ink w-full rounded-2xl bg-white px-4 py-3.5 font-bold text-ink outline-none"
            style={{ fontSize: 16 }}
          />
          {!placesConfigured && q.length >= 2 && (
            <p className="mt-2 font-bold" style={{ fontSize: 11.5, color: "rgba(27,23,19,.5)" }}>
              Showing mock results — add GOOGLE_PLACES_API_KEY for the real thing.
            </p>
          )}
        </div>

        <AnimatePresence>
          {searching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 font-bold" style={{ fontSize: 13, opacity: 0.5 }}>
              Searching…
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex flex-col gap-2.5">
          <AnimatePresence>
            {results.map((p, i) => (
              <motion.button
                key={p.placeId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy}
                onClick={() => pickPlace(p)}
                className="card-ink flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
                style={{ background: "#FFFDF7" }}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "#F5C445", fontSize: 20 }}>
                  🍔
                </div>
                <div className="flex-1">
                  <div className="font-black text-ink" style={{ fontSize: 16 }}>
                    {p.name}
                  </div>
                  <div className="font-semibold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
                    {p.area ? `${p.area} · ` : ""}
                    {p.address}
                  </div>
                </div>
                <span className="font-black" style={{ fontSize: 18, color: "rgba(27,23,19,.4)" }}>
                  +
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <div className="card-ink mt-3 rounded-2xl px-4 py-3 font-bold" style={{ background: "#F0865A", fontSize: 13 }}>
            {error}
          </div>
        )}

        {existing.length > 0 && (
          <>
            <div className="eyebrow mt-7 mb-2">OR RATE ONE WE'VE LOGGED</div>
            <div className="flex flex-col gap-2.5">
              {existing.map((e) => (
                <motion.button
                  key={e.id}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ x: -2, y: -2 }}
                  onClick={() => router.push(`/curate/${e.id}/rate`)}
                  className="card-ink flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
                  style={{ background: "#FFFDF7" }}
                >
                  <div className="flex-1">
                    <div className="font-black text-ink" style={{ fontSize: 16 }}>
                      {e.name}
                    </div>
                    <div className="font-semibold" style={{ fontSize: 12, color: "rgba(27,23,19,.5)" }}>
                      {e.area} · {e.when}
                    </div>
                  </div>
                  {e.evaluationCount > 0 && <ScoreChip score={e.total} size={13} />}
                  <span className="font-black" style={{ fontSize: 18, color: "rgba(27,23,19,.4)" }}>
                    ›
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </PhoneShell>
  );
}
