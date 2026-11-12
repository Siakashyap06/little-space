import * as React from "react";
import {
  Armchair,
  ArrowRight,
  Check,
  CircleCheck,
  CircleSlash,
  HeartHandshake,
  UserRound,
  Users,
  UsersRound,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { NavBar, Screen } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice";
import { OccupancyBadge } from "@/components/ui/badge";
import { Card, Divider } from "@/components/ui/card";
import { CafePhoto } from "@/components/cafe-bits";
import { NOISE_LABEL, SEATING_LABEL, type Crowd, type Noise, type Seating } from "@/lib/data";
import { getCafe, useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { cn, haptic } from "@/lib/utils";

export type Draft = { crowd?: Crowd; seating?: Seating; noise?: Noise };
export const DraftCtx = React.createContext<{ draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> } | null>(null);
function useDraft() {
  const d = React.useContext(DraftCtx);
  if (!d) throw new Error("draft");
  return d;
}

function Progress({ step, label }: { step: 1 | 2; label: string }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex justify-between text-[12px]">
        <p className="font-semibold text-brand">STEP {step} OF 2</p>
        <p className="text-muted">{label}</p>
      </div>
      <div className="flex gap-[6px]" role="progressbar" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step}>
        <span className="h-1 flex-1 rounded-[2px] bg-brand" />
        <span className={cn("h-1 flex-1 rounded-[2px] transition-colors duration-300", step === 2 ? "bg-brand" : "bg-line")} />
      </div>
    </div>
  );
}

function Intro({ title, cafeName }: { title: string; cafeName: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.7px] text-ink">{title}</h2>
      <p className="text-[12px] leading-[1.4] text-muted">{cafeName} · Your view, right now</p>
    </div>
  );
}

/** 05 Quick update — crowd level */
export function UpdateCrowdScreen({ cafeId }: { cafeId: string }) {
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const { draft, setDraft } = useDraft();

  const options: { id: Crowd; title: string; desc: string; icon: React.ReactNode }[] = [
    { id: "quiet", title: "Not Busy", desc: "Lots of room around you", icon: <UserRound strokeWidth={1.75} /> },
    { id: "moderate", title: "Moderate", desc: "A steady buzz, with room to settle", icon: <Users strokeWidth={1.75} /> },
    { id: "busy", title: "Very Busy", desc: "Crowded, with little room to spare", icon: <UsersRound strokeWidth={1.75} /> },
  ];

  return (
    <Screen
      nav={<NavBar title="Share an update" onBack={() => { setDraft({}); nav.popTo("details"); }} close />}
      bodyClassName="pt-[22px]"
      action={
        <Button disabled={!draft.crowd} className="disabled:opacity-40" onClick={() => nav.push({ name: "update-seating", cafeId })}>
          <ArrowRight />
          Continue
        </Button>
      }
    >
      <div className="flex flex-col gap-[18px]">
        <Progress step={1} label="Crowd level" />
        <Intro title="How full is this café?" cafeName={cafe.name} />
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Crowd level">
          {options.map((o) => (
            <ChoiceCard
              key={o.id}
              className="h-24"
              selected={draft.crowd === o.id}
              onSelect={() => setDraft((d) => ({ ...d, crowd: o.id }))}
              icon={o.icon}
              title={o.title}
              description={o.desc}
            />
          ))}
        </div>
        <div className="flex gap-3 rounded-[16px] bg-brand-soft p-[14px]">
          <HeartHandshake className="size-5 shrink-0 text-brand" strokeWidth={1.75} />
          <div className="flex flex-col gap-1 leading-[1.4]">
            <p className="text-[14px] font-semibold text-brand-deep">A little local knowledge. +10 points.</p>
            <p className="text-[11px] text-muted">Help someone find their kind of space.</p>
          </div>
        </div>
      </div>
    </Screen>
  );
}

/** 06 Seating update — seats + optional noise */
export function UpdateSeatingScreen({ cafeId }: { cafeId: string }) {
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const { submitReport } = useStore();
  const { draft, setDraft } = useDraft();

  const seats: { id: Seating; icon: React.ReactNode }[] = [
    { id: "plenty", icon: <Armchair strokeWidth={1.75} /> },
    { id: "some", icon: <Armchair strokeWidth={1.75} /> },
    { id: "none", icon: <CircleSlash strokeWidth={1.75} /> },
  ];
  const noises: { id: Noise; icon: React.ReactNode }[] = [
    { id: "quiet", icon: <VolumeX strokeWidth={1.75} /> },
    { id: "conversational", icon: <Volume1 strokeWidth={1.75} /> },
    { id: "loud", icon: <Volume2 strokeWidth={1.75} /> },
  ];

  const submit = () => {
    if (!draft.crowd || !draft.seating) return;
    submitReport(cafeId, { crowd: draft.crowd, seating: draft.seating, noise: draft.noise });
    nav.replaceAfter("details", { name: "update-done", cafeId });
  };

  return (
    <Screen
      nav={<NavBar title="Share an update" onBack={nav.pop} />}
      bodyClassName="pt-[22px]"
      action={
        <Button disabled={!draft.seating} className="disabled:opacity-40" onClick={submit}>
          Submit update
        </Button>
      }
    >
      <div className="flex flex-col gap-[18px]">
        <Progress step={2} label="Seating & noise" />
        <Intro title="Any seats available?" cafeName={cafe.name} />
        <div className="flex items-center gap-[10px]">
          <p className="text-[12px] text-muted">Crowd level</p>
          {draft.crowd && <OccupancyBadge crowd={draft.crowd} />}
          <button type="button" onClick={nav.pop} className="-my-3 flex-1 py-3 text-right text-[12px] font-semibold text-brand">
            Edit
          </button>
        </div>
        <div className="flex flex-col gap-[10px]" role="radiogroup" aria-label="Seating">
          {seats.map((s) => (
            <ChoiceCard
              key={s.id}
              className="h-[68px]"
              iconBox={32}
              selected={draft.seating === s.id}
              onSelect={() => setDraft((d) => ({ ...d, seating: s.id }))}
              icon={s.icon}
              title={SEATING_LABEL[s.id]}
            />
          ))}
        </div>
        <div className="flex flex-col gap-[10px]">
          <div className="flex justify-between">
            <p className="text-[17px] font-semibold text-ink">And the noise?</p>
            <p className="text-[12px] text-muted">Optional</p>
          </div>
          <div className="flex gap-2" role="radiogroup" aria-label="Noise">
            {noises.map((n) => {
              const on = draft.noise === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    haptic();
                    setDraft((d) => ({ ...d, noise: on ? undefined : n.id }));
                  }}
                  className={cn(
                    "flex h-[82px] min-w-0 flex-col items-center justify-center gap-2 rounded-[16px] text-[12px] leading-[1.4] transition-[flex-grow,background-color] duration-200",
                    on ? "flex-[1.5] border-[1.5px] border-brand bg-brand-soft font-semibold text-brand" : "flex-1 border border-line bg-white text-ink",
                  )}
                >
                  <span className="flex items-center gap-[5px] text-brand [&>svg:first-child]:size-[21px]">
                    {n.icon}
                    {on && <CircleCheck className="size-[14px]" strokeWidth={2} />}
                  </span>
                  {NOISE_LABEL[n.id]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Screen>
  );
}

/** 07 Confirmation */
export function UpdateDoneScreen({ cafeId }: { cafeId: string }) {
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const { state } = useStore();
  const { draft, setDraft } = useDraft();
  const mine = state.reports[cafeId]?.filter((r) => r.mine).slice(-1)[0];
  const crowd = mine?.crowd ?? draft.crowd;
  const seating = mine?.seating ?? draft.seating;
  const noise = mine?.noise ?? draft.noise;
  React.useEffect(() => () => setDraft({}), [setDraft]);

  const rows = [
    { icon: <Users className="size-4" strokeWidth={1.75} />, label: "Crowd", value: crowd ? { quiet: "Not Busy", moderate: "Moderate", busy: "Very Busy" }[crowd] : "—" },
    { icon: <Armchair className="size-4" strokeWidth={1.75} />, label: "Seating", value: seating ? SEATING_LABEL[seating] : "—" },
    { icon: <Volume1 className="size-4" strokeWidth={1.75} />, label: "Noise", value: noise ? NOISE_LABEL[noise] : "Not shared" },
  ];

  return (
    <Screen
      nav={<NavBar title="Update shared" onBack={() => nav.popTo("details")} close />}
      bodyClassName="pt-8"
      action={
        <Button onClick={() => nav.popTo("details")}>
          <ArrowRight />
          Back to Café
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-[72px] items-center justify-center rounded-full bg-brand-soft animate-pop">
            <div className="flex size-[50px] items-center justify-center rounded-full bg-brand">
              <Check className="size-[25px] text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.6px] text-ink">Thanks for looking out.</h2>
          <p className="text-[13px] leading-[1.4] text-muted">You’re helping others find a little space.</p>
        </div>
        <div className="flex items-center justify-between rounded-[16px] bg-brand-soft p-4">
          <div className="flex flex-col gap-[3px]">
            <p className="text-[24px] font-semibold text-brand-deep">+10 points earned</p>
            <p className="text-[11px] text-muted">Added to your balance</p>
          </div>
          <div className="flex flex-col items-end gap-[3px]">
            <p className="text-[24px] font-semibold tabular-nums text-brand-deep">{state.points}</p>
            <p className="text-[11px] text-muted">points total</p>
          </div>
        </div>
        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <CafePhoto cafe={cafe} className="size-12" />
            <div className="flex flex-col gap-[3px] leading-[1.4]">
              <p className="text-[16px] font-semibold text-ink">{cafe.name}</p>
              <p className="text-[11px] text-muted">Shared just now</p>
            </div>
          </div>
          <Divider />
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-[9px]">
              <span className="text-muted">{r.icon}</span>
              <p className="flex-1 text-[12px] text-muted">{r.label}</p>
              <p className="text-[13px] font-semibold text-ink">{r.value}</p>
            </div>
          ))}
        </Card>
      </div>
    </Screen>
  );
}
