"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoBurger } from "./art";
import { Avatar } from "./Avatar";
import { BackButton } from "./BackButton";
import type { Curator } from "@/lib/curators";

export function AppHeader({
  active,
  showBack = false,
}: {
  active: Curator | null;
  showBack?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <div className="flex items-center gap-2.5">
        {showBack && <BackButton onClick={() => router.push("/")} />}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-ink"
          style={{ fontSize: 17 }}
        >
          <LogoBurger />
          Patty Petrol
          <span style={{ fontSize: 10, verticalAlign: 8 }}>®</span>
        </Link>
      </div>
      <Link href="/curators" aria-label="Your profile">
        {active ? (
          <Avatar
            name={active.name}
            color={active.color}
            avatarUrl={active.avatarUrl}
            size={38}
          />
        ) : (
          <div className="card-ink grid h-[38px] w-[38px] place-items-center rounded-full bg-paper text-lg font-black">
            ?
          </div>
        )}
      </Link>
    </div>
  );
}
