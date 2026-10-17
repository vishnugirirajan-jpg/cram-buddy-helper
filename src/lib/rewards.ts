import { gamifyPoints } from "@/lib/semplan";

export const FREE_SUBJECT_LIMIT = 3;
export const FREE_PLAN_LIMIT = 1;
export const PRO_SEMESTER_PRICE = 49;
export const WEEKLY_GOAL_POINTS = 20;
export type WeeklyGoal = { id: string; name: string; week: string; done: boolean };
export const canAddSubject = (count: number) => count < FREE_SUBJECT_LIMIT;

export function weekKey(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

export const weeklyGoalPoints = (goals: WeeklyGoal[]) => goals.filter((g) => g.done).length * WEEKLY_GOAL_POINTS;
export const studyPoints = (examMs: number, freeMs: number) => gamifyPoints((examMs + freeMs) / 3600000);
export const formatClock = (ms: number) => {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((n) => String(n).padStart(2, "0")).join(":");
};

export function readSaved<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}