import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { dailyTarget, daysLeft, fmtHours, loadPlan, todayKey, totalHours, gamifyPoints, cashbackFor, type Plan } from "@/lib/semplan";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "SemPlan — Today's study plan" },
      { name: "description", content: "Your daily study target per subject and a study timer." },
      { property: "og:title", content: "SemPlan — Today's study plan" },
      { property: "og:description", content: "See today's target and track study time." },
    ],
  }),
  component: PlanPage,
});

const STUDY_KEY = "semplan.studied"; // { [date]: { [subjectId]: ms } }
const START_KEY = "semplan.start"; // { subjectId, at } | null

type StartState = { subjectId: string; at: number } | null;

function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [studied, setStudied] = useState<Record<string, number>>({});
  const [start, setStart] = useState<StartState>(null);
  const [now, setNow] = useState(Date.now());
  const [gamifyOpen, setGamifyOpen] = useState(false);

  useEffect(() => {
    setPlan(loadPlan());
    const all = JSON.parse(localStorage.getItem(STUDY_KEY) || "{}");
    setStudied(all[todayKey()] || {});
    const s = localStorage.getItem(START_KEY);
    if (s) setStart(JSON.parse(s));
  }, []);

  useEffect(() => {
    if (!start) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [start]);

  const persistStudied = (next: Record<string, number>) => {
    const all = JSON.parse(localStorage.getItem(STUDY_KEY) || "{}");
    all[todayKey()] = next;
    localStorage.setItem(STUDY_KEY, JSON.stringify(all));
    setStudied(next);
  };

  const startTimer = (subjectId: string) => {
    // Stop any running timer first, saving its time
    let base = studied;
    if (start) {
      base = { ...studied, [start.subjectId]: (studied[start.subjectId] || 0) + (Date.now() - start.at) };
      persistStudied(base);
    }
    const s = { subjectId, at: Date.now() };
    setStart(s);
    setNow(Date.now());
    localStorage.setItem(START_KEY, JSON.stringify(s));
  };

  const stopTimer = () => {
    if (!start) return;
    const next = { ...studied, [start.subjectId]: (studied[start.subjectId] || 0) + (Date.now() - start.at) };
    persistStudied(next);
    localStorage.removeItem(START_KEY);
    setStart(null);
  };

  if (!plan) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center space-y-4">
        <p className="text-muted-foreground">No plan yet.</p>
        <Link to="/" className="btn-big btn-primary inline-flex">Add subjects</Link>
      </main>
    );
  }

  const days = daysLeft(plan.examDate);
  const target = plan.subjects.reduce((a, s) => a + dailyTarget(s, days), 0);
  const liveMs = (id: string) => (studied[id] || 0) + (start?.subjectId === id ? now - start.at : 0);
  const totalLiveMs = plan.subjects.reduce((a, s) => a + liveMs(s.id), 0);
  const studiedH = totalLiveMs / 3600000;
  const pct = Math.min(100, target ? (studiedH / target) * 100 : 0);
  const clock = new Date(totalLiveMs).toISOString().slice(11, 19);

  return (
    <main className="mx-auto max-w-md px-5 py-8 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{plan.exam}</h1>
          <p className="text-muted-foreground">{days} day{days > 1 ? "s" : ""} left · {plan.examDate}</p>
        </div>
        <Link to="/" className="text-primary font-semibold pt-2">Edit</Link>
      </header>

      <section className="card-box text-center space-y-4">
        <p className="label">Today's target</p>
        <p className="font-display text-5xl font-bold text-primary">{fmtHours(target)}</p>
        <p className="font-mono text-3xl tabular-nums">{clock}</p>
        <div className="h-4 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{fmtHours(studiedH)} studied · {Math.round(pct)}%{pct >= 100 ? " — target hit! 🎉" : ""}</p>
        <p className="text-sm text-muted-foreground">Tap a subject below to start studying it.</p>
      </section>

      <section>
        <button className="btn-big btn-secondary flex" onClick={() => setGamifyOpen(true)}>🎮 Gamify?</button>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">By subject</h2>
        {plan.subjects.map((s) => {
          const running = start?.subjectId === s.id;
          const ms = liveMs(s.id);
          const subClock = new Date(ms).toISOString().slice(11, 19);
          return (
            <div key={s.id} className={`card-box py-3 space-y-3 ${running ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{totalHours(s)}h total · {fmtHours(ms / 3600000)} studied today</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-primary">{fmtHours(dailyTarget(s, days))}</p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-2xl tabular-nums">{subClock}</p>
                {running ? (
                  <button className="btn-big btn-stop" onClick={stopTimer}>■ Stop</button>
                ) : (
                  <button className="btn-big btn-primary" onClick={() => startTimer(s.id)}>▶ Start</button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
