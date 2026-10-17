export type Difficulty = "easy" | "medium" | "hard";
export type SubjectType = "problem-solving" | "memorising" | "mixed";
export type Subtopic = { id: string; name: string; minutes: number };
export type Subject = {
  id: string;
  name: string;
  credits: number;
  difficulty: Difficulty;
  type: SubjectType;
  hours: number; // student-editable total hours
  subtopics: Subtopic[];
};
export const EXAMS = ["Cycle Test 1", "Cycle Test 2", "Mid-Sem", "End-Sem"] as const;
export type Plan = { subjects: Subject[]; exam: string; examDate: string };

export const WEIGHT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };
export const TYPE_MULT: Record<SubjectType, number> = { "problem-solving": 1.2, mixed: 1.0, memorising: 0.9 };
export const SUBJECT_TYPES: SubjectType[] = ["problem-solving", "memorising", "mixed"];

/** Suggested total hours: credits x difficulty weight x type multiplier, rounded to nearest 0.5h. */
export const suggestedHours = (credits: number, difficulty: Difficulty, type: SubjectType) =>
  Math.round(credits * WEIGHT[difficulty] * TYPE_MULT[type] * 2) / 2;

export const totalHours = (s: Pick<Subject, "hours">) => s.hours;

/** True when entered hours are below 60% of the suggested hours. */
export const isLowHours = (hours: number, suggested: number) => suggested > 0 && hours < 0.6 * suggested;

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

// ===== Subtopics =====
export const subtopicPoints = (minutes: number) => Math.floor(minutes / 6);

export type SubtopicProgress = { done: number; total: number; doneMinutes: number; totalMinutes: number };
export const subtopicProgress = (s: Subject, checked: Record<string, boolean>): SubtopicProgress => {
  const subs = s.subtopics || [];
  const done = subs.filter((t) => checked[t.id]);
  return {
    done: done.length,
    total: subs.length,
    doneMinutes: done.reduce((a, t) => a + t.minutes, 0),
    totalMinutes: subs.reduce((a, t) => a + t.minutes, 0),
  };
};

// ===== Gamify =====
export const POINTS_PER_HOUR = 10;
export const CASHBACK_MAX = 20;

/** Points earned: 10 per full hour studied. */
export const gamifyPoints = (hoursStudied: number) => Math.floor(hoursStudied) * POINTS_PER_HOUR;

/** Cashback credit in Rs: up to 20, proportional to plan completion (rounded to Rs 0.5). */
export const cashbackFor = (pct: number) =>
  Math.min(CASHBACK_MAX, Math.round((Math.max(0, pct) / 100) * CASHBACK_MAX * 2) / 2);

const KEY = "semplan.plan";
export const loadPlan = (): Plan | null => {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!p) return null;
    // Migrate old plans without type/hours/subtopics
    p.subjects = (p.subjects || []).map((s: Subject & { type?: SubjectType; hours?: number; subtopics?: Subtopic[] }) => ({
      ...s,
      type: s.type ?? "mixed",
      hours: s.hours ?? suggestedHours(s.credits, s.difficulty, s.type ?? "mixed"),
      subtopics: s.subtopics ?? [],
    }));
    return p;
  } catch {
    return null;
  }
};
export const savePlan = (p: Plan) => localStorage.setItem(KEY, JSON.stringify(p));

const CHECK_KEY = "semplan.subtopics"; // { [subtopicId]: true }
export const loadChecked = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(CHECK_KEY) || "{}");
  } catch {
    return {};
  }
};
export const saveChecked = (c: Record<string, boolean>) => localStorage.setItem(CHECK_KEY, JSON.stringify(c));
