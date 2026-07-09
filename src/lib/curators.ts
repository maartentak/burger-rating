export type CuratorId = "axel" | "simon" | "marty";

export interface Curator {
  id: CuratorId;
  name: string;
  initial: string;
  /** Signature colour from the design system. */
  color: string;
  /** Optional custom avatar (data URL or hosted image). Falls back to initial circle. */
  avatarUrl?: string | null;
}

/**
 * Fixed roster. Names/avatars are editable, ids and colours are stable.
 * `avatarUrl` points at the drop-in convention: put axel.png / simon.png /
 * marty.png in /public/avatars and they show automatically. Missing files
 * fall back to the coloured initial circle (see Avatar).
 */
export const DEFAULT_CURATORS: Curator[] = [
  { id: "axel", name: "Axel", initial: "A", color: "#F48FBB", avatarUrl: "/avatars/axel.png" },
  { id: "simon", name: "Simon", initial: "S", color: "#F5C445", avatarUrl: "/avatars/simon.png" },
  { id: "marty", name: "Marty", initial: "M", color: "#F0865A", avatarUrl: "/avatars/marty.png" },
];

export const CURATOR_IDS: CuratorId[] = ["axel", "simon", "marty"];

export function curatorColor(id: string): string {
  return DEFAULT_CURATORS.find((c) => c.id === id)?.color ?? "#F48FBB";
}
