"use client";

import { useMemo, useRef, useState } from "react";

const PITCH = 6; // px per unit

interface Tick {
  h: number;
  o: number;
  label: string;
}

/**
 * The signature ruler dial. Drag the strip left/right to set a 0-100 value.
 * Controlled: parent owns `value`, gets updates via `onChange`.
 */
export function RulerDial({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; v: number } | null>(null);

  const ticks = useMemo<Tick[]>(
    () =>
      Array.from({ length: 101 }, (_, i) => ({
        h: i % 10 === 0 ? 28 : i % 5 === 0 ? 19 : 12,
        o: i % 10 === 0 ? 1 : 0.45,
        label: i % 10 === 0 ? String(i) : "",
      })),
    []
  );

  function down(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, v: value };
    setDragging(true);
  }
  function move(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const raw = d.v + (d.x - e.clientX) / PITCH;
    onChange(Math.max(0, Math.min(100, Math.round(raw))));
  }
  function up() {
    drag.current = null;
    setDragging(false);
  }

  return (
    <div className="select-none">
      <div
        className="text-center font-black leading-none text-ink"
        style={{ fontSize: 78, letterSpacing: "-.03em" }}
      >
        {value}
        <span style={{ fontSize: 34, verticalAlign: 18 }}>%</span>
      </div>

      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="relative mt-1.5 h-[76px] cursor-grab overflow-hidden active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute left-1/2 top-2 flex"
          style={{
            transform: `translateX(${-(value * PITCH + 3)}px)`,
            transition: dragging
              ? "none"
              : "transform .18s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {ticks.map((t, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center"
              style={{ width: PITCH }}
            >
              <div
                style={{
                  width: 2.5,
                  borderRadius: 2,
                  background: "#1B1713",
                  height: t.h,
                  opacity: t.o,
                }}
              />
              {t.label && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-extrabold text-ink"
                  style={{ top: 36, fontSize: 12, opacity: 0.5 }}
                >
                  {t.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Fixed center indicator */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid #1B1713",
          }}
        />
        <div
          className="absolute left-1/2 top-2 -translate-x-1/2"
          style={{ width: 4, height: 34, borderRadius: 2, background: "#1B1713" }}
        />
      </div>

      <div
        className="text-center font-bold text-ink"
        style={{ fontSize: 12, letterSpacing: ".1em", opacity: 0.5 }}
      >
        ‹&nbsp;&nbsp;SWIPE THE RULER&nbsp;&nbsp;›
      </div>
    </div>
  );
}
