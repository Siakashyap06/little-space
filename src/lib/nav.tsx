import { createContext, useContext } from "react";
import type { Tab } from "@/components/layout";

export type Route =
  | { name: "explore" }
  | { name: "preview"; cafeId: string }
  | { name: "details"; cafeId: string }
  | { name: "trends"; cafeId: string }
  | { name: "update-crowd"; cafeId: string }
  | { name: "update-seating"; cafeId: string }
  | { name: "update-done"; cafeId: string }
  | { name: "rewards"; cafeId: string }
  | { name: "redeemed"; redemptionId: string };

export type Nav = {
  tab: Tab;
  push: (r: Route) => void;
  pop: () => void;
  /** pop back to the nearest route with this name (or the root) */
  popTo: (name: Route["name"]) => void;
  /** replace the top routes after `name` with r */
  replaceAfter: (name: Route["name"], r: Route) => void;
  switchTab: (t: Tab, root?: Route) => void;
  canGoBack: boolean;
};

export const NavCtx = createContext<Nav | null>(null);
export function useNav() {
  const n = useContext(NavCtx);
  if (!n) throw new Error("useNav outside provider");
  return n;
}
