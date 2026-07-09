"use client";

import { useEffect, useState } from "react";

interface AvatarProps {
  name: string;
  color: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * Curator avatar: shows the custom image only once it's confirmed to load,
 * otherwise the signature colour circle with the initial. Preloading (rather
 * than rendering <img> and reacting to onError) avoids the broken-image glyph
 * for the drop-in /avatars/{id}.png convention when a file isn't there yet.
 */
export function Avatar({
  name,
  color,
  avatarUrl,
  size = 42,
  className = "",
}: AvatarProps) {
  const [ok, setOk] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    setOk(false);
    if (!avatarUrl) return;
    let alive = true;
    const img = new window.Image();
    img.onload = () => alive && setOk(true);
    img.onerror = () => alive && setOk(false);
    img.src = avatarUrl;
    return () => {
      alive = false;
    };
  }, [avatarUrl]);

  return (
    <div
      className={`card-ink grid place-items-center overflow-hidden rounded-full font-black ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
        color: "#1B1713",
      }}
      aria-label={name}
    >
      {avatarUrl && ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
