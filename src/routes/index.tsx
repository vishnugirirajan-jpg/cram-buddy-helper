import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  EXAMS,
  SUBJECT_TYPES,
  isLowHours,
  loadPlan,
  savePlan,
  suggestedHours,
  type Difficulty,
  type Subject,
  type SubjectType,
} from "@/lib/semplan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SemPlan — Add your subjects" },
      { name: "description", content: "Add your subjects and next exam date to get a daily study plan." },
      { property: "og:title", content: "SemPlan — Add your subjects" },
      { property: "og:description", content: "Plan study hours for Cycle Tests, Mid-Sem and End-Sem." },
    ],
  }),
  component: Setup,
});

const TYPE_LABEL: Record<SubjectType, string> = {
  "problem-solving": "Problem-solving",
  memorising: "Memorising",
  mixed: "Mixed",
};

function Setup() {
  const nav = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exam, setExam] = useState<string>(EXAMS[0]);
  const [examDate, setExamDate] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [type, setType] = useState<SubjectType>("mixed");
  const [hours, setHours] = useState<string>("");
  const [hoursTouched, setHoursTouched] = useState(false);

  useEffect(() => {
    const p = loadPlan();
    if (p) { setSubjects(p.subjects); setExam(p.exam); setExamDate(p.examDate); }
  }, []);

  const suggested = suggestedHours(credits, difficulty, type);
  const hoursNum = hoursTouched ? Number(hours) : suggested;
  const lowWarning = isLowHours(hoursNum, suggested);

  const add = () => {
    if (!name.trim() || !(hoursNum > 0)) return;
    setSubjects([...subjects, { id: crypto.randomUUID(), name: name.trim(), credits, difficulty, type, hours: hoursNum }]);
    setName("");
    setHours("");
    setHoursTouched(false);
  };

  const go = () => {
    savePlan({ subjects, exam, examDate });
    nav({ to: "/plan" });
  };

  return (
    <main className="mx-auto max-w-md px-5 py-8 space-y-6">
      <header>
        <h1 className="font-display text-4xl font-bold text-primary">SemPlan</h1>
        <p className="text-muted-foreground mt-1">Add your subjects, pick your next exam.</p>
      </header>

      <section className="card-box space-y-4">
        <h2 className="font-display text-lg font-semibold">Add a subject</h2>
        <input className="field" placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <p className="label">Credits</p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((c) => (
              <button key={c} onClick={() => setCredits(c)} className={credits === c ? "chip chip-on" : "chip"}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Difficulty</p>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} className={difficulty === d ? "chip chip-on capitalize" : "chip capitalize"}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Type of subject</p>
          <div className="grid grid-cols-3 gap-2">
            {SUBJECT_TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} className={type === t ? "chip chip-on" : "chip"}>{TYPE_LABEL[t]}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Total study hours (suggested: {suggested}h)</p>
          <input
            className="field"
            type="number"
            min={0.5}
            step={0.5}
            value={hoursTouched ? hours : String(suggested)}
            onChange={(e) => { setHours(e.target.value); setHoursTouched(true); }}
          />
          {lowWarning && (
            <p className="text-sm text-destructive mt-1">This is much lower than recommended. Are you sure?</p>
          )}
        </div>
        <button className="btn-big btn-secondary" onClick={add}>+ Add subject</button>
      </section>

      {subjects.length > 0 && (
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li key={s.id} className="card-box flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {s.credits} credits · {s.difficulty} · {TYPE_LABEL[s.type]} · {s.hours}h total
                </p>
              </div>
              <button aria-label={`Remove ${s.name}`} className="text-destructive text-2xl px-2" onClick={() => setSubjects(subjects.filter((x) => x.id !== s.id))}>×</button>
            </li>
          ))}
        </ul>
      )}

      <section className="card-box space-y-4">
        <h2 className="font-display text-lg font-semibold">Next exam</h2>
        <div className="grid grid-cols-2 gap-2">
          {EXAMS.map((e) => (
            <button key={e} onClick={() => setExam(e)} className={exam === e ? "chip chip-on" : "chip"}>{e}</button>
          ))}
        </div>
        <input type="date" className="field" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
      </section>

      <button className="btn-big btn-primary" disabled={!subjects.length || !examDate} onClick={go}>
        See my plan →
      </button>
    </main>
  );
}
