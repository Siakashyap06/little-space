export type Crowd = "quiet" | "moderate" | "busy";
export type Seating = "plenty" | "some" | "none";
export type Noise = "quiet" | "conversational" | "loud";

export type Reward = {
  id: string;
  title: string;
  detail: string;
  points: number;
  /** compact label for the details perk row */
  short?: string;
  /** headline on the redemption screen */
  ready?: string;
};

export type Cafe = {
  id: string;
  name: string;
  short: string;
  code: string;
  address: string;
  neighborhood: string;
  photo: string;
  walkMin: number;
  miles: number;
  /** opening hours in 24h, [open, close) */
  open: number;
  close: number;
  amenities: string[];
  /** marker position on the Lower East Side map (402 × 508 design space) */
  pos: { x: number; y: number };
  /** typical occupancy per weekday (0 = Sun) per hour, 0–1 */
  typical: number[][];
  seed: { crowd: Crowd; seating: Seating; noise: Noise; minutesAgo: number };
  rewards: Reward[];
};

const H = 24;
/** Build a typical-week curve from a base daily shape + weekday weights. */
function week(shape: Partial<Record<number, number>>, weights: number[]): number[][] {
  return weights.map((w) =>
    Array.from({ length: H }, (_, h) => {
      const v = shape[h] ?? 0;
      return Math.max(0, Math.min(0.92, +(v * w).toFixed(2)));
    }),
  );
}

// Levels mirror the Figma chart: quiet ≈ .18, steady ≈ .39, busy ≈ .63
const Q = 0.18, S = 0.39, B = 0.63;

export const CAFES: Cafe[] = [
  {
    id: "acro",
    name: "Acro Coffee",
    short: "Acro",
    code: "ACRO",
    address: "168 Ludlow St",
    neighborhood: "Lower East Side",
    photo: "cafes/acro.jpg",
    walkMin: 5,
    miles: 0.2,
    open: 7,
    close: 20,
    amenities: ["Wi-Fi"],
    pos: { x: 125, y: 176 },
    typical: week(
      { 7: 0.1, 8: Q, 9: S, 10: Q, 11: S, 12: B, 13: B, 14: S, 15: S, 16: Q, 17: Q },
      [0.85, 1, 1, 1, 1, 1.1, 1.05],
    ),
    seed: { crowd: "moderate", seating: "some", noise: "conversational", minutesAgo: 8 },
    rewards: [
      { id: "acro-upgrade", title: "Complimentary size upgrade", short: "Size upgrade", ready: "Your upgrade is ready.", detail: "Tue–Thu, 3–5 PM · With drink purchase", points: 100 },
      { id: "acro-espresso", title: "Espresso on the house", short: "Free espresso", ready: "Your espresso is ready.", detail: "One espresso, made just for you", points: 200 },
      { id: "acro-coffee", title: "Your coffee, on us", detail: "One regular coffee of your choice", points: 300 },
    ],
  },
  {
    id: "fern-tile",
    name: "Fern & Tile",
    short: "Fern",
    code: "FERN",
    address: "92 Stanton St",
    neighborhood: "Lower East Side",
    photo: "cafes/fern-tile.jpg",
    walkMin: 8,
    miles: 0.4,
    open: 7,
    close: 19,
    amenities: ["Wi-Fi", "Outlets"],
    pos: { x: 47, y: 47 },
    typical: week(
      { 7: Q, 8: S, 9: S, 10: Q, 11: Q, 12: S, 13: S, 14: Q, 15: Q, 16: Q, 17: S, 18: Q },
      [0.9, 1, 0.95, 0.95, 1, 1.1, 1.1],
    ),
    seed: { crowd: "quiet", seating: "plenty", noise: "quiet", minutesAgo: 14 },
    rewards: [
      { id: "fern-pastry", title: "Half-price pastry", detail: "Any pastry · With drink purchase", points: 80 },
      { id: "fern-pourover", title: "Pour-over upgrade", detail: "Swap drip for a single-origin pour-over", points: 150 },
      { id: "fern-coffee", title: "Your coffee, on us", detail: "One regular coffee of your choice", points: 300 },
    ],
  },
  {
    id: "brass-tap",
    name: "Brass Tap Espresso",
    short: "Brass Tap",
    code: "BRSS",
    address: "131 Orchard St",
    neighborhood: "Lower East Side",
    photo: "cafes/brass-tap.jpg",
    walkMin: 4,
    miles: 0.2,
    open: 7,
    close: 20,
    amenities: ["Espresso bar", "Standing room"],
    pos: { x: 278, y: 103 },
    typical: week(
      { 7: S, 8: B, 9: 0.8, 10: B, 11: B, 12: 0.85, 13: 0.8, 14: B, 15: B, 16: S, 17: B, 18: S, 19: Q },
      [0.8, 1, 1, 1, 1.05, 1.1, 1],
    ),
    seed: { crowd: "busy", seating: "none", noise: "loud", minutesAgo: 3 },
    rewards: [
      { id: "brass-shot", title: "Extra shot, free", detail: "Add a shot to any drink", points: 60 },
      { id: "brass-cortado", title: "Cortado on the house", detail: "Before 9 AM, weekdays", points: 180 },
      { id: "brass-beans", title: "10% off beans", detail: "Any 12 oz bag", points: 250 },
    ],
  },
  {
    id: "long-table",
    name: "Long Table Coffee",
    short: "Long Table",
    code: "LONG",
    address: "54 Essex St",
    neighborhood: "Lower East Side",
    photo: "cafes/long-table.jpg",
    walkMin: 7,
    miles: 0.3,
    open: 8,
    close: 21,
    amenities: ["Wi-Fi", "Outlets", "Communal table"],
    pos: { x: 257, y: 362 },
    typical: week(
      { 8: Q, 9: S, 10: S, 11: B, 12: B, 13: B, 14: S, 15: S, 16: S, 17: Q, 18: Q, 19: Q, 20: Q },
      [1.05, 0.95, 1, 1, 1, 1, 1.15],
    ),
    seed: { crowd: "moderate", seating: "some", noise: "conversational", minutesAgo: 22 },
    rewards: [
      { id: "long-cookie", title: "Cookie with any drink", detail: "Chocolate chip or oat", points: 90 },
      { id: "long-latte", title: "Oat latte on the house", detail: "Any size", points: 220 },
      { id: "long-coffee", title: "Your coffee, on us", detail: "One regular coffee of your choice", points: 300 },
    ],
  },
  {
    id: "orchard-reading-room",
    name: "Orchard Reading Room",
    short: "Reading Room",
    code: "READ",
    address: "185 Orchard St",
    neighborhood: "Lower East Side",
    photo: "cafes/orchard-reading-room.jpg",
    walkMin: 9,
    miles: 0.4,
    open: 9,
    close: 22,
    amenities: ["Wi-Fi", "Books", "Quiet zone"],
    pos: { x: 62, y: 258 },
    typical: week(
      { 9: Q, 10: Q, 11: S, 12: S, 13: S, 14: S, 15: Q, 16: S, 17: S, 18: B, 19: S, 20: Q, 21: Q },
      [1.1, 0.9, 0.9, 0.95, 1, 1.1, 1.15],
    ),
    seed: { crowd: "quiet", seating: "some", noise: "quiet", minutesAgo: 31 },
    rewards: [
      { id: "read-tea", title: "Pot of tea for one", detail: "Any loose-leaf tea", points: 120 },
      { id: "read-book", title: "$5 off any used book", detail: "From the front shelves", points: 200 },
      { id: "read-coffee", title: "Your coffee, on us", detail: "One regular coffee of your choice", points: 300 },
    ],
  },
  {
    id: "norfolk-tea",
    name: "Norfolk Tea & Coffee",
    short: "Norfolk",
    code: "NRFK",
    address: "112 Norfolk St",
    neighborhood: "Lower East Side",
    photo: "cafes/norfolk-tea.jpg",
    walkMin: 3,
    miles: 0.1,
    open: 8,
    close: 23,
    amenities: ["Window seats", "Tea bar"],
    pos: { x: 300, y: 300 },
    typical: week(
      { 8: Q, 9: Q, 10: Q, 11: S, 12: S, 13: Q, 14: Q, 15: Q, 16: S, 17: S, 18: S, 19: S, 20: Q, 21: Q, 22: Q },
      [1, 0.9, 0.9, 1, 1, 1.15, 1.1],
    ),
    seed: { crowd: "quiet", seating: "plenty", noise: "quiet", minutesAgo: 47 },
    rewards: [
      { id: "nrfk-refill", title: "Free tea refill", detail: "Same visit, any tea", points: 50 },
      { id: "nrfk-scone", title: "Scone on the house", detail: "With any pot of tea", points: 160 },
      { id: "nrfk-coffee", title: "Your coffee, on us", detail: "One regular coffee of your choice", points: 300 },
    ],
  },
];

export const USER_LOCATION = { x: 299, y: 239 };

export const CROWD_META: Record<Crowd, { label: string; long: string; text: string; dot: string; soft: string }> = {
  quiet: { label: "Quiet", long: "Not busy", text: "#496952", dot: "#496952", soft: "#e8eee5" },
  moderate: { label: "Moderate", long: "Moderately busy", text: "#936d32", dot: "#936d32", soft: "#f3ecdc" },
  busy: { label: "Very Busy", long: "Very busy", text: "#a55f4c", dot: "#a55f4c", soft: "#f6e6e0" },
};

export const SEATING_LABEL: Record<Seating, string> = {
  plenty: "Plenty of seats",
  some: "Some seats",
  none: "No seats",
};

export const NOISE_LABEL: Record<Noise, string> = {
  quiet: "Quiet",
  conversational: "Conversational",
  loud: "Loud",
};

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function levelToCrowd(v: number): Crowd {
  if (v >= 0.5) return "busy";
  if (v >= 0.28) return "moderate";
  return "quiet";
}

export function hourLabel(h: number, withSuffix = false) {
  const n = h % 12 === 0 ? 12 : h % 12;
  return withSuffix ? `${n} ${h < 12 ? "AM" : "PM"}` : String(n);
}

export function isOpen(c: Cafe, d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60;
  return h >= c.open && h < c.close;
}

export function hoursLine(c: Cafe, d = new Date()) {
  if (isOpen(c, d)) return `Open until ${hourLabel(c.close, true)}`;
  const h = d.getHours();
  return h < c.open ? `Opens at ${hourLabel(c.open, true)}` : `Closed · Opens ${hourLabel(c.open, true)}`;
}
