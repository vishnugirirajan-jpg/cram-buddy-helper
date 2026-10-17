import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { dailyTarget, daysLeft, fmtHours, loadPlan, todayKey, totalHours, type Plan } from "@/lib/semplan";

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

const STUDY_KEY = "semplan.studied";
const START_KEY = "semplan.start";

function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [studiedMs, setStudiedMs] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setPlan(loadPlan());
    const all = JSON.parse(localStorage.getItem(STUDY_KEY) || "{}");
    setStudiedMs(all[todayKey()] || 0);
    const s = localStorage.getItem(START_KEY);
    if (s) setStart(Number(s));
  }, []);

  useEffect(() => {
    if (!start) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [start]);

  const startTimer = () => { const t = Date.now(); setStart(t); setNow(t); localStorage.setItem(START_KEY, String(t)); };
  const stopTimer = () => {
    if (!start) return;
    const total = studiedMs + (Date.now() - start);
    const all = JSON.parse(localStorage.getItem(STUDY_KEY) || "{}");
    all[todayKey()] = total;
    localStorage.setItem(STUDY_KEY, JSON.stringify(all));
    localStorage.removeItem(START_KEY);
    setStudiedMs(total); setStart(null);
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
  const liveMs = studiedMs + (start ? now - start : 0);
  const studiedH = liveMs / 3600000;
  const pct = Math.min(100, target ? (studiedH / target) * 100 : 0);
  const clock = new Date(liveMs).toISOString().slice(11, 19);

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
        {start ? (
          <button className="btn-big btn-stop" onClick={stopTimer}>■ Stop</button>
        ) : (
          <button className="btn-big btn-primary" onClick={startTimer}>▶ Start</button>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">By subject</h2>
        {plan.subjects.map((s) => (
          <div key={s.id} className="card-box flex items-center justify-between py-3">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-muted-foreground">{totalHours(s)}h total</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-primary">{fmtHours(dailyTarget(s, days))}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
