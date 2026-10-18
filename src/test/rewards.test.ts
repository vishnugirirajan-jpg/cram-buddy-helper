import { describe, expect, it } from "vitest";
import { activateDemoPro, loadProActive, PRO_KEY, canAddSubject, FREE_PLAN_LIMIT, PRO_SEMESTER_PRICE, studyPoints, weeklyGoalPoints, weekKey, type WeeklyGoal } from "@/lib/rewards";

describe("rewards and free limits", () => {
  it("earns 10 points per full study hour including free study", () => {
    expect(studyPoints(3600000, 3600000)).toBe(20);
    expect(studyPoints(0, 3600000)).toBe(10);
    expect(studyPoints(0, 3599999)).toBe(0);
    expect(studyPoints(1800000, 1800000)).toBe(10);
  });
  it("earns 20 points per checked weekly goal without repeated-toggle bonuses", () => {
    const goal: WeeklyGoal = { id: "a", name: "Revise maths", week: "2026-10-12", done: true };
    expect(weeklyGoalPoints([goal])).toBe(20);
    expect(weeklyGoalPoints([{ ...goal, done: false }])).toBe(0);
    expect(weeklyGoalPoints([goal, { ...goal, id: "b" }])).toBe(40);
  });
  it("allows 3 subjects but not a fourth", () => {
    expect(canAddSubject(2)).toBe(true);
    expect(canAddSubject(3)).toBe(false);
    expect(canAddSubject(4)).toBe(false);
  });
  it("allows one free exam plan", () => expect(FREE_PLAN_LIMIT).toBe(1));
  it("removes the three-subject limit for active Pro", () => {
    expect(canAddSubject(3, true)).toBe(true);
    expect(canAddSubject(50, true)).toBe(true);
    expect(canAddSubject(3, false)).toBe(false);
  });
  it("saves successful demo Pro activation in browser storage", () => {
    localStorage.removeItem(PRO_KEY);
    expect(loadProActive()).toBe(false);
    activateDemoPro();
    expect(JSON.parse(localStorage.getItem("semplan.pro") || "null")).toEqual({ active: true, mode: "test" });
    expect(loadProActive()).toBe(true);
    localStorage.removeItem(PRO_KEY);
  });
  it("prices Pro at Rs 49 per semester", () => expect(PRO_SEMESTER_PRICE).toBe(49));
  it("groups goals by Monday-to-Sunday week", () => {
    expect(weekKey(new Date(2026, 9, 17))).toBe("2026-10-12");
    expect(weekKey(new Date(2026, 9, 18))).toBe("2026-10-12");
    expect(weekKey(new Date(2026, 9, 19))).toBe("2026-10-19");
  });
});