import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { CAFES, type Cafe, type Crowd, type Noise, type Seating, levelToCrowd, isOpen } from "./data";

export type Report = { crowd: Crowd; seating: Seating; noise?: Noise; at: number; mine?: boolean };
export type Redemption = { id: string; cafeId: string; rewardId: string; code: string; at: number; before: number };

type State = {
  points: number;
  reports: Record<string, Report[]>;
  redemptions: Redemption[];
  selectedCafeId: string;
};

const KEY = "little-space:v1";
const START_POINTS = 120;

function seedReports(): Record<string, Report[]> {
  const now = Date.now();
  return Object.fromEntries(
    CAFES.map((c) => [
      c.id,
      [{ crowd: c.seed.crowd, seating: c.seed.seating, noise: c.seed.noise, at: now - c.seed.minutesAgo * 60_000 }],
    ]),
  );
}

function initial(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      // Refresh community seed reports if the saved ones are stale (> 3 h old) so the map stays live.
      const now = Date.now();
      const reports = { ...s.reports };
      for (const c of CAFES) {
        const list = reports[c.id] ?? [];
        const latest = list[list.length - 1];
        if (!latest || now - latest.at > 3 * 3600_000) {
          reports[c.id] = [...list.filter((r) => r.mine), { crowd: c.seed.crowd, seating: c.seed.seating, noise: c.seed.noise, at: now - c.seed.minutesAgo * 60_000 }];
        }
      }
      return { ...s, reports };
    }
  } catch {
    /* storage unavailable */
  }
  return { points: START_POINTS, reports: seedReports(), redemptions: [], selectedCafeId: "acro" };
}

type Action =
  | { type: "select"; cafeId: string }
  | { type: "report"; cafeId: string; report: Omit<Report, "at" | "mine"> }
  | { type: "redeem"; redemption: Redemption; cost: number }
  | { type: "reset" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "select":
      return { ...s, selectedCafeId: a.cafeId };
    case "report": {
      const list = s.reports[a.cafeId] ?? [];
      return {
        ...s,
        points: s.points + 10,
        reports: { ...s.reports, [a.cafeId]: [...list, { ...a.report, at: Date.now(), mine: true }] },
      };
    }
    case "redeem":
      return { ...s, points: s.points - a.cost, redemptions: [...s.redemptions, a.redemption] };
    case "reset":
      return { points: START_POINTS, reports: seedReports(), redemptions: [], selectedCafeId: "acro" };
  }
}

type Ctx = {
  state: State;
  select: (id: string) => void;
  submitReport: (cafeId: string, r: Omit<Report, "at" | "mine">) => void;
  redeem: (cafeId: string, rewardId: string) => Redemption | null;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const select = useCallback((cafeId: string) => dispatch({ type: "select", cafeId }), []);
  const submitReport = useCallback(
    (cafeId: string, report: Omit<Report, "at" | "mine">) => dispatch({ type: "report", cafeId, report }),
    [],
  );
  const redeem = useCallback(
    (cafeId: string, rewardId: string) => {
      const cafe = CAFES.find((c) => c.id === cafeId);
      const reward = cafe?.rewards.find((r) => r.id === rewardId);
      if (!cafe || !reward || state.points < reward.points) return null;
      const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
      const code =
        cafe.code + "–" + Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
      const redemption: Redemption = {
        id: `${rewardId}-${Date.now()}`,
        cafeId,
        rewardId,
        code,
        at: Date.now(),
        before: state.points,
      };
      dispatch({ type: "redeem", redemption, cost: reward.points });
      return redemption;
    },
    [state.points],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo(() => ({ state, select, submitReport, redeem, reset }), [state, select, submitReport, redeem, reset]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

export function getCafe(id: string): Cafe {
  return CAFES.find((c) => c.id === id) ?? CAFES[0];
}

export type LiveStatus = {
  crowd: Crowd;
  seating: Seating;
  noise?: Noise;
  updatedLabel: string;
  fromReport: boolean;
  open: boolean;
};

const FRESH_MS = 90 * 60_000;

export function minutesAgoLabel(at: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - at) / 60_000));
  if (m < 1) return "Updated just now";
  if (m < 60) return `Updated ${m} min ago`;
  const h = Math.round(m / 60);
  return `Updated ${h} hr ago`;
}

/** Combine the freshest community report with typical patterns for right now. */
export function liveStatus(cafe: Cafe, reports: Report[] | undefined, now = new Date()): LiveStatus {
  const open = isOpen(cafe, now);
  if (!open) {
    return { crowd: "quiet", seating: "plenty", updatedLabel: "Closed now", fromReport: false, open };
  }
  const latest = reports?.[reports.length - 1];
  if (latest && now.getTime() - latest.at < FRESH_MS) {
    return { crowd: latest.crowd, seating: latest.seating, noise: latest.noise, updatedLabel: minutesAgoLabel(latest.at, now.getTime()), fromReport: true, open };
  }
  const v = cafe.typical[now.getDay()][now.getHours()];
  const crowd = levelToCrowd(v);
  const seating: Seating = crowd === "busy" ? "none" : crowd === "moderate" ? "some" : "plenty";
  return { crowd, seating, updatedLabel: open ? "Based on typical patterns" : "Closed now", fromReport: false, open };
}
