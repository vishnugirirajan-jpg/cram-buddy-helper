export type Difficulty = "easy" | "medium" | "hard";
export type Subject = { id: string; name: string; credits: number; difficulty: Difficulty };
export const EXAMS = ["Cycle Test 1", "Cycle Test 2", "Mid-Sem", "End-Sem"] as const;
export type Plan = { subjects: Subject[]; exam: string; examDate: string };

export const WEIGHT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };

export const totalHours = (s: Pick<Subject, "credits" | "difficulty">) => s.credits * WEIGHT[s.difficulty];

/** Days left from today until the exam day (today counts, exam day doesn't). Minimum 1. */
export function daysLeft(examDate: string, today = new Date()): number {
  const [y = 0, m = 1, d = 1] = examDate.split("-").map(Number);
  const exam = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(1, Math.round((exam - now) / 86400000));
}

export const dailyTarget = (s: Subject, days: number) => totalHours(s) / days;

export const todayKey = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

export const fmtHours = (h: number) => {
  const mins = Math.round(h * 60);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const KEY = "semplan.plan";
export const loadPlan = (): Plan | null => {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
};
export const savePlan = (p: Plan) => localStorage.setItem(KEY, JSON.stringify(p));
