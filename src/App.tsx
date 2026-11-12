import * as React from "react";
import { StatusBar, TabBar, type Tab } from "@/components/layout";
import { StoreProvider, useStore } from "@/lib/store";
import { NavCtx, type Nav, type Route } from "@/lib/nav";
import { ExploreScreen } from "@/screens/explore";
import { PreviewScreen } from "@/screens/preview";
import { DetailsScreen } from "@/screens/details";
import { TrendsScreen } from "@/screens/trends";
import { DraftCtx, UpdateCrowdScreen, UpdateDoneScreen, UpdateSeatingScreen, type Draft } from "@/screens/update";
import { RedeemedScreen, RewardsScreen } from "@/screens/rewards";

type Stacks = Record<Tab, Route[]>;
type Anim = "push" | "pop" | "fade" | "none";

function routeKey(r: Route) {
  return JSON.stringify(r);
}

function render(r: Route) {
  switch (r.name) {
    case "explore": return <ExploreScreen />;
    case "preview": return <PreviewScreen cafeId={r.cafeId} />;
    case "details": return <DetailsScreen cafeId={r.cafeId} />;
    case "trends": return <TrendsScreen cafeId={r.cafeId} />;
    case "update-crowd": return <UpdateCrowdScreen cafeId={r.cafeId} />;
    case "update-seating": return <UpdateSeatingScreen cafeId={r.cafeId} />;
    case "update-done": return <UpdateDoneScreen cafeId={r.cafeId} />;
    case "rewards": return <RewardsScreen cafeId={r.cafeId} />;
    case "redeemed": return <RedeemedScreen redemptionId={r.redemptionId} />;
  }
}

function Shell() {
  const { state } = useStore();
  const [tab, setTab] = React.useState<Tab>("explore");
  const [stacks, setStacks] = React.useState<Stacks>({
    explore: [{ name: "explore" }],
    trends: [{ name: "trends", cafeId: state.selectedCafeId }],
    rewards: [{ name: "rewards", cafeId: state.selectedCafeId }],
  });
  const [anim, setAnim] = React.useState<Anim>("none");
  const [draft, setDraft] = React.useState<Draft>({});

  const stack = stacks[tab];
  const top = stack[stack.length - 1];

  const nav: Nav = React.useMemo(() => {
    const update = (fn: (s: Route[]) => Route[], a: Anim) => {
      setAnim(a);
      setStacks((all) => ({ ...all, [tab]: fn(all[tab]) }));
    };
    return {
      tab,
      canGoBack: stack.length > 1,
      push: (r) => update((s) => [...s, r], "push"),
      pop: () => update((s) => (s.length > 1 ? s.slice(0, -1) : s), "pop"),
      popTo: (name) =>
        update((s) => {
          const i = s.map((r) => r.name).lastIndexOf(name);
          return i >= 0 ? s.slice(0, i + 1) : s.slice(0, 1);
        }, "pop"),
      replaceAfter: (name, r) =>
        update((s) => {
          const i = s.map((x) => x.name).lastIndexOf(name);
          return [...s.slice(0, i + 1), r];
        }, "push"),
      switchTab: (t, root) => {
        setAnim("fade");
        setStacks((all) => ({ ...all, [t]: root ? [root] : all[t] }));
        setTab(t);
      },
    };
  }, [tab, stack.length]);

  const onTab = (t: Tab) => {
    if (t === tab) {
      // tapping the active tab pops to its root (iOS convention)
      setAnim("pop");
      setStacks((all) => ({ ...all, [t]: all[t].slice(0, 1) }));
      return;
    }
    const root: Route | undefined =
      t === "trends" ? { name: "trends", cafeId: state.selectedCafeId } : t === "rewards" ? { name: "rewards", cafeId: state.selectedCafeId } : undefined;
    nav.switchTab(t, root);
  };

  // iOS-style edge swipe to go back
  const edge = React.useRef<{ x: number; y: number } | null>(null);

  return (
    <NavCtx.Provider value={nav}>
      <DraftCtx.Provider value={{ draft, setDraft }}>
        <div className="shell flex flex-col">
          <StatusBar />
          <main
            className="relative min-h-0 flex-1 overflow-hidden"
            onTouchStart={(e) => {
              const t = e.touches[0];
              edge.current = t.clientX - e.currentTarget.getBoundingClientRect().left < 24 ? { x: t.clientX, y: t.clientY } : null;
            }}
            onTouchEnd={(e) => {
              const s = edge.current;
              edge.current = null;
              if (!s) return;
              const t = e.changedTouches[0];
              if (t.clientX - s.x > 70 && Math.abs(t.clientY - s.y) < 60 && stack.length > 1) nav.pop();
            }}
          >
            <div key={tab + routeKey(top)} className={`absolute inset-0 bg-canvas ${anim !== "none" ? `anim-${anim}` : ""}`}>
              {render(top)}
            </div>
          </main>
          <TabBar active={tab} onChange={onTab} />
          <div className="device-only pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[138px] -translate-x-1/2 rounded-full bg-ink" />
        </div>
      </DraftCtx.Provider>
    </NavCtx.Provider>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
