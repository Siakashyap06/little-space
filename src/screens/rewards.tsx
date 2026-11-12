import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check } from "lucide-react";
import { NavBar, Screen } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CAFES, type Reward } from "@/lib/data";
import { getCafe, useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { cn, haptic } from "@/lib/utils";

/** iOS-style action sheet to confirm spending points. */
function ConfirmSheet({ reward, cafeName, onConfirm, onCancel }: { reward: Reward; cafeName: string; onConfirm: () => void; onCancel: () => void }) {
  const host = document.querySelector(".shell") ?? document.body;
  return createPortal(
    <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/30 p-2 animate-fade-in" onClick={onCancel} role="dialog" aria-modal="true" aria-label="Confirm redemption">
      <div className="flex flex-col gap-2 animate-rise" style={{ paddingBottom: "max(8px, var(--safe-bottom))" }} onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-[14px] bg-white/95 text-center backdrop-blur">
          <div className="px-4 py-4">
            <p className="text-[13px] font-semibold text-muted">Redeem {reward.title}?</p>
            <p className="mt-1 text-[13px] text-muted">
              Uses {reward.points} points at {cafeName}. Show the code at the counter.
            </p>
          </div>
          <button type="button" onClick={onConfirm} className="h-14 w-full border-t border-line text-[17px] font-semibold text-brand active:bg-canvas">
            Redeem for {reward.points} pts
          </button>
        </div>
        <button type="button" onClick={onCancel} className="h-14 w-full rounded-[14px] bg-white text-[17px] font-semibold text-ink active:bg-canvas">
          Cancel
        </button>
      </div>
    </div>,
    host,
  );
}

/** 08 Rewards */
export function RewardsScreen({ cafeId }: { cafeId: string }) {
  const { state, redeem, select } = useStore();
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const [confirm, setConfirm] = React.useState<Reward | null>(null);
  const mine = state.redemptions.filter((r) => r.cafeId === cafe.id).slice().reverse();

  return (
    <>
      <Screen nav={<NavBar title="Rewards" onBack={() => nav.switchTab("explore")} />}>
        <div className="flex flex-col gap-[14px]">
          <div className="flex flex-col gap-[6px] rounded-[16px] bg-brand-soft p-4">
            <p className="text-[11px] font-semibold text-brand">YOUR POINTS</p>
            <p className="text-[32px] font-semibold tabular-nums text-brand">{state.points} points</p>
            <p className="text-[12px] text-subtle">Earn 10 points with every café update.</p>
          </div>

          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {CAFES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  haptic();
                  select(c.id);
                  nav.switchTab("rewards", { name: "rewards", cafeId: c.id });
                }}
                className={cn(
                  "h-[30px] shrink-0 rounded-full border border-line px-3 text-[11px]",
                  c.id === cafe.id ? "bg-brand-soft font-semibold text-brand" : "bg-white text-ink",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <p className="text-[18px] font-semibold text-ink">Available at {cafe.name}</p>
          {cafe.rewards.map((r) => {
            const short = r.points - state.points;
            const can = short <= 0;
            return (
              <div key={r.id} className="flex flex-col gap-[7px] rounded-[16px] border border-line bg-white p-[14px]">
                <p className="text-[10px] font-semibold text-brand">{cafe.name.toUpperCase()}</p>
                <p className="text-[16px] font-semibold text-ink">{r.title}</p>
                <p className="text-[11px] text-subtle">{r.detail}</p>
                <div className="flex h-10 items-center justify-between">
                  <p className={cn("text-[12px] font-semibold", can ? "text-brand" : "text-subtle")}>
                    {r.points} pts{can ? "" : ` · ${short} more`}
                  </p>
                  <Button
                    size="redeem"
                    variant={can ? "primary" : "muted"}
                    disabled={!can}
                    aria-label={can ? `Redeem ${r.title}` : `${short} more points needed`}
                    onClick={() => setConfirm(r)}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            );
          })}

          {mine.length > 0 && (
            <>
              <p className="mt-2 text-[18px] font-semibold text-ink">Your codes</p>
              {mine.map((m) => {
                const r = cafe.rewards.find((x) => x.id === m.rewardId);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => nav.push({ name: "redeemed", redemptionId: m.id })}
                    className="flex items-center gap-3 rounded-[16px] border border-line bg-white p-[14px] text-left active:bg-canvas"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft">
                      <Check className="size-4 text-brand" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[14px] font-semibold text-ink">{r?.title}</span>
                      <span className="text-[12px] tracking-[1px] text-brand">{m.code}</span>
                    </span>
                    <ArrowRight className="size-4 text-muted" />
                  </button>
                );
              })}
            </>
          )}
        </div>
      </Screen>
      {confirm && (
        <ConfirmSheet
          reward={confirm}
          cafeName={cafe.name}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const red = redeem(cafe.id, confirm.id);
            setConfirm(null);
            if (red) nav.push({ name: "redeemed", redemptionId: red.id });
          }}
        />
      )}
    </>
  );
}

/** 09 Redemption */
export function RedeemedScreen({ redemptionId }: { redemptionId: string }) {
  const { state } = useStore();
  const nav = useNav();
  const red = state.redemptions.find((r) => r.id === redemptionId);
  if (!red) return null;
  const cafe = getCafe(red.cafeId);
  const reward = cafe.rewards.find((r) => r.id === red.rewardId)!;
  const left = red.before - reward.points;

  return (
    <Screen nav={<NavBar title="Reward redeemed" onBack={nav.pop} />}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-[72px] items-center justify-center rounded-full bg-brand-soft animate-pop">
            <div className="flex size-[50px] items-center justify-center rounded-full bg-brand">
              <Check className="size-[25px] text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-[26px] font-semibold text-ink">{reward.ready ?? "Your reward is ready."}</h2>
          <p className="max-w-[230px] text-[13px] text-subtle">A little thank-you for helping your café community.</p>
        </div>
        <div className="flex flex-col gap-[6px] rounded-[16px] border border-line bg-white p-4">
          <p className="text-[11px] font-semibold text-brand">{cafe.name.toUpperCase()}</p>
          <p className="text-[17px] font-semibold text-ink">{reward.title}</p>
          <p className="text-[12px] text-subtle">
            {cafe.address} · {cafe.neighborhood}
          </p>
        </div>
        <div className="flex flex-col gap-[10px] rounded-[16px] border border-line bg-white p-5 text-center">
          <p className="text-[10px] font-semibold text-subtle">SHOW THIS CODE AT THE COUNTER</p>
          <p className="select-all text-[26px] font-semibold tracking-[2px] text-brand">{red.code}</p>
          <p className="text-[11px] text-subtle">{reward.detail}</p>
        </div>
        <div className="flex flex-col gap-[5px] rounded-[16px] bg-brand-soft p-4">
          <p className="text-[22px] font-semibold text-brand">{left} points left</p>
          <p className="text-[12px] text-subtle">
            {red.before} points − {reward.points} redeemed
          </p>
        </div>
        <Button onClick={nav.pop}>
          <ArrowRight />
          Back to Rewards
        </Button>
      </div>
    </Screen>
  );
}
