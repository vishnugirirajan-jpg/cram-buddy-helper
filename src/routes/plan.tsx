import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  dailyTarget,
  daysLeft,
  fmtHours,
  loadPlan,
  savePlan,
  todayKey,
  totalHours,
  subtopicPoints,
  subtopicProgress,
  loadChecked,
  saveChecked,
  type Plan,
} from "@/lib/semplan";

import { StudyExtras } from "@/components/study-extras";
import { formatClock, readSaved } from "@/lib/rewards";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "SemPlan — Today's study plan" },
      { name: "description", content: "Your daily study target per subject and a study timer." },
      { property: "og:title", content: "SemPlan — Today's study plan" },
      { property: "og:description", content: "See today's target and track study time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [previousMs, setPreviousMs] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [subName, setSubName] = useState<Record<string, string>>({});
  const [subMins, setSubMins] = useState<Record<string, string>>({});

  useEffect(() => {
    setPlan(loadPlan());
    const all = readSaved<Record<string, Record<string, number>>>(STUDY_KEY, {});
    setStudied(all[todayKey()] || {});
    setPreviousMs(Object.entries(all).filter(([day]) => day !== todayKey()).reduce((sum, [, values]) => sum + Object.values(values).reduce((a, ms) => a + ms, 0), 0));
    const s = localStorage.getItem(START_KEY);
    if (s) setStart(JSON.parse(s));
    setChecked(loadChecked());
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

  const updatePlan = (next: Plan) => {
    setPlan(next);
    savePlan(next);
  };

  const addSubtopic = (subjectId: string) => {
    if (!plan) return;
    const name = (subName[subjectId] || "").trim();
    const minutes = Number(subMins[subjectId]);
    if (!name || !(minutes > 0)) return;
    updatePlan({
      ...plan,
      subjects: plan.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, subtopics: [...s.subtopics, { id: crypto.randomUUID(), name, minutes }] }
          : s,
      ),
    });
    setSubName({ ...subName, [subjectId]: "" });
    setSubMins({ ...subMins, [subjectId]: "" });
  };

  const removeSubtopic = (subjectId: string, subtopicId: string) => {
    if (!plan) return;
    updatePlan({
      ...plan,
      subjects: plan.subjects.map((s) =>
        s.id === subjectId ? { ...s, subtopics: s.subtopics.filter((t) => t.id !== subtopicId) } : s,
      ),
    });
    const next = { ...checked };
    delete next[subtopicId];
    setChecked(next);
    saveChecked(next);
  };

  const toggleSubtopic = (subtopicId: string) => {
    const next = { ...checked, [subtopicId]: !checked[subtopicId] };
    if (!next[subtopicId]) delete next[subtopicId];
    setChecked(next);
    saveChecked(next);
  };

  if (!plan) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 space-y-6">
        <h1 className="font-display text-3xl font-bold">SemPlan</h1>
        <Link to="/" className="text-primary font-semibold inline-flex">Add an exam plan →</Link>
        <StudyExtras examMs={previousMs + Object.values(studied).reduce((sum, ms) => sum + ms, 0) + (start ? Math.max(0, now - start.at) : 0)} />
      </main>
    );
  }

  const days = daysLeft(plan.examDate);
  const target = plan.subjects.reduce((a, s) => a + dailyTarget(s, days), 0);
  const liveMs = (id: string) => (studied[id] || 0) + (start?.subjectId === id ? now - start.at : 0);
  const totalLiveMs = plan.subjects.reduce((a, s) => a + liveMs(s.id), 0);
  const studiedH = totalLiveMs / 3600000;
  const pct = Math.min(100, target ? (studiedH / target) * 100 : 0);
  const clock = formatClock(totalLiveMs);
  const rewardExamMs = previousMs + Object.values(studied).reduce((sum, ms) => sum + ms, 0) + (start ? Math.max(0, now - start.at) : 0);
  const subPoints = plan.subjects.reduce(
    (a, s) => a + s.subtopics.filter((t) => checked[t.id]).reduce((x, t) => x + subtopicPoints(t.minutes), 0),
    0,
  );

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

      <StudyExtras examMs={rewardExamMs} subtopicPoints={subPoints} />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">By subject</h2>
        {plan.subjects.map((s) => {
          const running = start?.subjectId === s.id;
          const ms = liveMs(s.id);
          const subClock = new Date(ms).toISOString().slice(11, 19);
          const prog = subtopicProgress(s, checked);
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

              <div className="border-t border-border pt-3 space-y-2">
                <p className="label">Subtopics</p>
                {prog.total > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {prog.done} of {prog.total} done · {fmtHours(prog.doneMinutes / 60)} of {fmtHours(prog.totalMinutes / 60)} estimated time completed
                  </p>
                )}
                {s.subtopics.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-primary"
                      checked={!!checked[t.id]}
                      onChange={() => toggleSubtopic(t.id)}
                      aria-label={`Mark ${t.name} done`}
                    />
                    <span className={`flex-1 ${checked[t.id] ? "line-through text-muted-foreground" : ""}`}>
                      {t.name} <span className="text-sm text-muted-foreground">· {t.minutes} min · {subtopicPoints(t.minutes)} pts</span>
                    </span>
                    <button aria-label={`Remove ${t.name}`} className="text-destructive text-xl px-1" onClick={() => removeSubtopic(s.id, t.id)}>×</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    className="field flex-1"
                    placeholder="Subtopic name"
                    value={subName[s.id] || ""}
                    onChange={(e) => setSubName({ ...subName, [s.id]: e.target.value })}
                  />
                  <input
                    className="field w-24"
                    type="number"
                    min={1}
                    placeholder="min"
                    value={subMins[s.id] || ""}
                    onChange={(e) => setSubMins({ ...subMins, [s.id]: e.target.value })}
                  />
                  <button className="chip whitespace-nowrap" onClick={() => addSubtopic(s.id)}>+ Add</button>
                </div>
              </div>
            </div>
          );
        })}
      </section>


    </main>
  );
}
