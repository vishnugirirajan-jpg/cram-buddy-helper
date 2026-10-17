import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Award, ChevronRight, Gift, Play, Square, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatClock, PRO_SEMESTER_PRICE, readSaved, studyPoints, weekKey, weeklyGoalPoints, type WeeklyGoal } from "@/lib/rewards";
import { fmtHours } from "@/lib/semplan";

const FREE_KEY = "semplan.free-study";
const GOALS_KEY = "semplan.weekly-goals";
type FreeStudy = { ms: number; startedAt: number | null };

export function StudyExtras({ examMs = 0, subtopicPoints = 0 }: { examMs?: number; subtopicPoints?: number }) {
  const [free, setFree] = useState<FreeStudy>({ ms: 0, startedAt: null });
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [goalName, setGoalName] = useState("");
  const [now, setNow] = useState(0);
  const [week, setWeek] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFree(readSaved(FREE_KEY, { ms: 0, startedAt: null }));
    setGoals(readSaved(GOALS_KEY, []));
    setNow(Date.now());
    setWeek(weekKey());
    setReady(true);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => { setNow(Date.now()); setWeek(weekKey()); }, 1000);
    return () => clearInterval(timer);
  }, []);

  const freeMs = free.ms + (free.startedAt === null ? 0 : Math.max(0, now - free.startedAt));
  const points = studyPoints(examMs, freeMs) + subtopicPoints + weeklyGoalPoints(goals);
  const currentGoals = goals.filter((goal) => goal.week === week);
  const updateGoals = (next: WeeklyGoal[]) => {
    setGoals(next);
    localStorage.setItem(GOALS_KEY, JSON.stringify(next));
  };
  const toggleTimer = () => {
    const at = Date.now();
    const next = free.startedAt === null
      ? { ...free, startedAt: at }
      : { ms: free.ms + Math.max(0, at - free.startedAt), startedAt: null };
    setFree(next);
    setNow(at);
    localStorage.setItem(FREE_KEY, JSON.stringify(next));
  };

  return <div className="space-y-6">
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost" disabled={!ready} className="card-box w-full h-auto whitespace-normal justify-between text-left p-4">
          <span className="flex items-center gap-3"><Gift className="text-primary" /><span className="text-base font-semibold">Rewards</span></span>
          <span className="flex items-center gap-2"><span className="text-primary text-lg font-bold tabular-nums">{points} points</span><ChevronRight /></span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70" />
        <Dialog.Content className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-2xl border border-border bg-card p-6 pb-8 max-h-[85dvh] overflow-y-auto space-y-4">
          <div className="mx-auto h-1 w-10 rounded-full bg-muted" />
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="font-display text-2xl font-bold">Rewards</Dialog.Title>
            <Dialog.Close asChild><Button size="icon" variant="ghost" aria-label="Close rewards"><X /></Button></Dialog.Close>
          </div>
          <p className="text-primary font-display text-3xl font-bold">{points} points</p>
          <Dialog.Description className="text-muted-foreground">Earn points as you study, then swap them for themes, badges, or a discount on your next semester pass.</Dialog.Description>
          <ul className="text-sm space-y-3">
            <li>10 points per full hour studied, including Free study.</li>
            <li>Completed subtopics earn 1 point per 6 minutes of their estimate.</li>
            <li>20 points per weekly goal completed.</li>
          </ul>
          <p className="text-sm text-muted-foreground">Themes, badges, and pass discounts are coming soon. Points are saved in this browser.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    <section className="space-y-3" aria-labelledby="free-study-title">
      <div className="flex justify-between items-center"><h2 id="free-study-title" className="font-display text-xl font-semibold">Free study</h2><span className="text-sm text-muted-foreground">No exam</span></div>
      <div className="flex items-center gap-4">
        <p className="font-mono text-3xl tabular-nums flex-1" aria-label="Free study time">{formatClock(freeMs)}</p>
        <Button disabled={!ready} onClick={toggleTimer} variant={free.startedAt === null ? "default" : "destructive"} className="h-14 px-6 text-lg">
          {free.startedAt === null ? <Play /> : <Square />}{free.startedAt === null ? "Start free study" : "Stop free study"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{fmtHours(freeMs / 3600000)} studied · 10 points per hour</p>
    </section>

    <section className="border-t border-border pt-5 space-y-3" aria-labelledby="weekly-title">
      <div className="flex items-center justify-between gap-2"><h2 id="weekly-title" className="font-display text-xl font-semibold">This week</h2><span className="text-sm text-muted-foreground">{currentGoals.filter((g) => g.done).length}/{currentGoals.length} goals done</span></div>
      {week && <p className="text-sm text-muted-foreground">Week of {week} · 20 points per goal</p>}
      {currentGoals.map((goal) => <label key={goal.id} className="flex items-center gap-3 py-2">
        <input type="checkbox" className="h-5 w-5 shrink-0 accent-primary" checked={goal.done} onChange={() => updateGoals(goals.map((g) => g.id === goal.id ? { ...g, done: !g.done } : g))} />
        <span className={`flex-1 min-w-0 break-words ${goal.done ? "line-through text-muted-foreground" : ""}`}>{goal.name}</span>
        <span className="text-sm text-primary shrink-0">20 pts</span>
      </label>)}
      <form className="flex gap-2" onSubmit={(event) => {
        event.preventDefault();
        if (!goalName.trim() || !ready) return;
        updateGoals([...goals, { id: crypto.randomUUID(), name: goalName.trim(), week: weekKey(), done: false }]);
        setGoalName("");
      }}>
        <input className="field flex-1 min-w-0" aria-label="Weekly goal" placeholder="Add a weekly goal" value={goalName} onChange={(e) => setGoalName(e.target.value)} />
        <Button type="submit" className="h-14" disabled={!ready || !goalName.trim()} aria-label="Add weekly goal"><Plus /></Button>
      </form>
    </section>

    <ProCard />
  </div>;
}

export function ProCard() {
  const [notice, setNotice] = useState(false);
  return <section className="card-box space-y-3">
    <h2 className="font-display text-lg font-bold flex items-center gap-2"><Award className="text-primary size-5" />Pro — Rs {PRO_SEMESTER_PRICE} per semester</h2>
    <ul className="text-sm text-muted-foreground space-y-1"><li>More than 3 subjects</li><li>Multiple exam plans per semester</li></ul>
    <p className="text-sm text-muted-foreground">Free: 1 exam plan · 3 subjects. Free study and weekly goals included.</p>
    <Button className="w-full h-12 text-lg" onClick={() => setNotice(true)}>Buy Pro</Button>
    {notice && <p role="status" className="text-sm text-muted-foreground">Purchases are coming soon. No payment has been taken.</p>}
  </section>;
}