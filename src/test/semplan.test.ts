import { describe, it, expect } from "vitest";
import { totalHours, daysLeft, dailyTarget } from "@/lib/semplan";

describe("study hours formula", () => {
  it("easy = 2h per credit", () => expect(totalHours({ credits: 3, difficulty: "easy" })).toBe(6));
  it("medium = 3h per credit", () => expect(totalHours({ credits: 4, difficulty: "medium" })).toBe(12));
  it("hard = 4h per credit", () => expect(totalHours({ credits: 2, difficulty: "hard" })).toBe(8));
  it("splits evenly across days left", () => {
    const days = daysLeft("2026-10-21", new Date(2026, 9, 17));
    expect(days).toBe(4);
    expect(dailyTarget({ id: "a", name: "x", credits: 4, difficulty: "hard" }, days)).toBe(4);
  });
  it("exam today still gives at least 1 day", () => expect(daysLeft("2026-10-17", new Date(2026, 9, 17))).toBe(1));
});
