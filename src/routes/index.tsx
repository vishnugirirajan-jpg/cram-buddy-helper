import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EXAMS, loadPlan, savePlan, totalHours, type Difficulty, type Subject } from "@/lib/semplan";

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

function Setup() {
  const nav = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exam, setExam] = useState<string>(EXAMS[0]);
  const [examDate, setExamDate] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  useEffect(() => {
    const p = loadPlan();
    if (p) { setSubjects(p.subjects); setExam(p.exam); setExamDate(p.examDate); }
  }, []);

  const add = () => {
    if (!name.trim()) return;
    setSubjects([...subjects, { id: crypto.randomUUID(), name: name.trim(), credits, difficulty }]);
    setName("");
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
        <button className="btn-big btn-secondary" onClick={add}>+ Add subject</button>
      </section>

      {subjects.length > 0 && (
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li key={s.id} className="card-box flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{s.credits} credits · {s.difficulty} · {totalHours(s)}h total</p>
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
