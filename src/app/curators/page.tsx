"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useCurators } from "@/lib/useCurators";
import { PhoneShell } from "@/components/PhoneShell";
import { Avatar } from "@/components/Avatar";
import { BackButton } from "@/components/BackButton";
import type { Curator } from "@/lib/curators";

interface CuratorStat {
  curatorId: string;
  avgGiven: number;
  count: number;
}

export default function CuratorsPage() {
  const { curators, activeId, setActive, patchCurator, demo } = useCurators();
  const [stats, setStats] = useState<CuratorStat[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setStats(d.insights?.curators ?? []))
      .catch(() => {});
  }, []);

  return (
    <PhoneShell bg="#F6F1E5">
      <div className="flex items-center gap-3 px-5 pt-4">
        <BackButton onClick={() => router.push("/")} />
        <span className="eyebrow">THE PATROL</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-3 no-scrollbar">
        <h1 className="font-black leading-none text-ink" style={{ fontSize: 34, letterSpacing: "-.01em" }}>
          Curators
        </h1>
        <p className="mt-1.5 font-semibold" style={{ fontSize: 14, color: "rgba(27,23,19,.55)" }}>
          Three palates. One crown. {demo ? "Editing is paused in demo mode." : "Tap edit to fix your badge."}
        </p>

        <div className="mt-5 flex flex-col gap-4">
          {curators.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <CuratorCard
                curator={c}
                stat={stats.find((s) => s.curatorId === c.id)}
                isActive={c.id === activeId}
                isEditing={editing === c.id}
                onSelect={() => setActive(c.id)}
                onEdit={() => setEditing(c.id)}
                onCancel={() => setEditing(null)}
                onSave={async (patch) => {
                  await patchCurator(c.id, patch);
                  setEditing(null);
                }}
              />
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => router.push("/admin")}
          className="card-ink mt-5 flex items-center justify-center gap-2 rounded-full py-3 font-extrabold text-ink"
          style={{ background: "#FFFDF7", fontSize: 13.5 }}
        >
          ⚙️ Admin desk · manage joints
        </button>
      </div>
    </PhoneShell>
  );
}

function CuratorCard({
  curator,
  stat,
  isActive,
  isEditing,
  onSelect,
  onEdit,
  onCancel,
  onSave,
}: {
  curator: Curator;
  stat?: CuratorStat;
  isActive: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (patch: Partial<Curator>) => void;
}) {
  const [name, setName] = useState(curator.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(curator.avatarUrl);
  const [cutout, setCutout] = useState(true);
  const [busy, setBusy] = useState(false);
  const rawFile = useRef<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(curator.name);
    setAvatarUrl(curator.avatarUrl);
  }, [curator, isEditing]);

  async function process(f: File, cut: boolean) {
    setBusy(true);
    try {
      setAvatarUrl(await downscale(f, 220, cut));
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    rawFile.current = f;
    await process(f, cutout);
  }

  async function toggleCutout() {
    const next = !cutout;
    setCutout(next);
    if (rawFile.current) await process(rawFile.current, next);
  }

  return (
    <div
      className="card-ink rounded-3xl p-4"
      style={{ background: "#FFFDF7", boxShadow: isActive ? "4px 5px 0 rgba(27,23,19,.18)" : "none" }}
    >
      <div className="flex items-center gap-4">
        <Avatar name={name} color={curator.color} avatarUrl={avatarUrl} size={58} />
        <div className="flex-1">
          {isEditing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="card-ink w-full rounded-xl bg-white px-3 py-2 font-black text-ink outline-none"
              style={{ fontSize: 20 }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-black text-ink" style={{ fontSize: 22 }}>
                {curator.name}
              </span>
              {isActive && (
                <span
                  className="card-ink rounded-full px-2 py-0.5 font-extrabold"
                  style={{ fontSize: 10, background: curator.color, borderWidth: 1.5 }}
                >
                  YOU
                </span>
              )}
            </div>
          )}
          {!isEditing && (
            <div className="mt-1 flex gap-4 font-bold" style={{ fontSize: 12.5, color: "rgba(27,23,19,.55)" }}>
              <span>{stat?.count ?? 0} rated</span>
              <span>avg given · {stat?.avgGiven ?? "–"}</span>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <div className="flex w-full flex-wrap items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="card-ink rounded-full px-3 py-2 font-extrabold"
              style={{ fontSize: 13, background: "#AFC6E9" }}
            >
              {busy ? "…" : "📷 Photo"}
            </button>
            <button
              onClick={toggleCutout}
              className="card-ink rounded-full px-3 py-2 font-extrabold"
              style={{ fontSize: 13, background: cutout ? "#A5B45B" : "#FFFDF7", color: cutout ? "#fff" : "#1B1713" }}
              title="Remove the background so your curator colour shows through"
            >
              ✂️ Cut out bg {cutout ? "ON" : "OFF"}
            </button>
            {avatarUrl && (
              <button
                onClick={() => { setAvatarUrl(null); rawFile.current = null; }}
                className="card-ink rounded-full px-3 py-2 font-extrabold"
                style={{ fontSize: 13, background: "#FFFDF7" }}
              >
                Clear
              </button>
            )}
            <div className="flex-1" />
            <button onClick={onCancel} className="px-2 font-extrabold underline" style={{ fontSize: 13 }}>
              Cancel
            </button>
            <button
              onClick={() => onSave({ name: name.trim() || curator.name, avatarUrl })}
              className="card-ink rounded-full px-4 py-2 font-extrabold"
              style={{ fontSize: 13, background: "#F5C445" }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          {!isActive && (
            <button
              onClick={onSelect}
              className="card-ink flex-1 rounded-full py-2 font-extrabold"
              style={{ fontSize: 13, background: curator.color }}
            >
              This is me
            </button>
          )}
          <button
            onClick={onEdit}
            className="card-ink flex-1 rounded-full py-2 font-extrabold"
            style={{ fontSize: 13, background: "#FFFDF7" }}
          >
            Edit badge
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Downscale an uploaded image to a square-ish PNG data URL. When `cutout` is on,
 * the background is removed (flood-filled from the edges) so it goes transparent
 * and the curator's signature colour shows through — this fixes photos that come
 * in with a solid black/white background. Outputs PNG to preserve the alpha.
 */
function downscale(file: File, max: number, cutout: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        if (cutout) cutoutBackground(ctx, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Removes the border-connected background: flood-fills inward from every edge
 * pixel, clearing pixels close in colour to the sampled edge colour. Because it
 * only follows the region connected to the border, dark details INSIDE the
 * subject (beards, hair, jackets) are preserved.
 */
function cutoutBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;

  // Reference background colour = average of the four corners.
  let r = 0, g = 0, b = 0;
  for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) {
    const i = (y * w + x) * 4;
    r += d[i]; g += d[i + 1]; b += d[i + 2];
  }
  r /= 4; g /= 4; b /= 4;

  const T = 70 * 70; // squared colour-distance threshold
  const near = (i: number) => {
    if (d[i + 3] === 0) return true; // already transparent
    const dr = d[i] - r, dg = d[i + 1] - g, db = d[i + 2] - b;
    return dr * dr + dg * dg + db * db < T;
  };

  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + (w - 1)); }

  while (stack.length) {
    const p = stack.pop()!;
    if (p < 0 || p >= w * h || visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    if (!near(i)) continue;
    d[i + 3] = 0;
    const x = p % w, y = (p - x) / w;
    if (x + 1 < w) stack.push(p + 1);
    if (x - 1 >= 0) stack.push(p - 1);
    if (y + 1 < h) stack.push(p + w);
    if (y - 1 >= 0) stack.push(p - w);
  }
  ctx.putImageData(image, 0, 0);
}
