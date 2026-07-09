import pizza2024 from "@/data/seasons/pizza-2024.json";

/**
 * Generic "season" archive model — a past run of the club under some cuisine,
 * normalized to 0–100. Add a new season by generating another JSON and listing
 * it in SEASONS below; the recap pages render any cuisine.
 */
export interface SeasonReview {
  when: string;
  place: string;
  itemName: string;
  curatorId: string;
  curatorName: string;
  color: string;
  price: number | null;
  metrics: Record<string, number | null>;
  joint: Record<string, number | null>;
  itemScore: number;
  jointScore: number;
  total: number;
  worth: number | null;
  sauce: string;
  cheese: string;
  bias: { day: number | null; hunger: number | null; horny: number | null };
  quote: string;
}

export interface SeasonPlace {
  id: string;
  name: string;
  when: string;
  itemScore: number;
  jointScore: number;
  total: number;
  reviews: SeasonReview[];
}

export interface Season {
  slug: string;
  cuisine: string;
  emoji: string;
  title: string;
  dateRange: string;
  blurb: string;
  scaleNote: string;
  metricLabels: { key: string; label: string }[];
  jointLabels: { key: string; label: string }[];
  places: SeasonPlace[];
  podium: SeasonPlace[];
  ranked: SeasonPlace[];
  bestItem: { name: string; place: string; curatorName: string; score: number };
  trend: { when: string; value: number }[];
  redVsWhite: {
    red: { avg: number; count: number };
    white: { avg: number; count: number };
  };
  cheese: {
    favourite: { name: string; count: number; avg: number } | null;
    topRated: { name: string; avg: number; count: number } | null;
  };
  curators: { id: string; name: string; color: string; count: number; avgGiven: number }[];
  generous: string | null;
  harsh: string | null;
  horny: { avg: number; note: string };
  value: { name: string; place: string; price: number; score: number } | null;
  fold: { name: string; place: string; value: number } | null;
  quotes: { text: string; curatorName: string; place: string; item: string }[];
}

/** Newest first. */
export const SEASONS: Season[] = [pizza2024 as Season];

export function getSeason(slug: string): Season | undefined {
  return SEASONS.find((s) => s.slug === slug);
}
