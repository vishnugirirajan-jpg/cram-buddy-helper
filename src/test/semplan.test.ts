import { describe, it, expect } from "vitest";
import { totalHours, daysLeft, dailyTarget, suggestedHours, isLowHours, gamifyPoints, cashbackFor, type Subject } from "@/lib/semplan";

const subj = (hours: number): Subject => ({ id: "a", name: "x", credits: 4, difficulty: "hard", type: "mixed", hours });

describe("suggested hours formula", () => {
  it("easy = 2h per credit, medium = 3h, hard = 4h (mixed type, x1.0)", () => {
    expect(suggestedHours(3, "easy", "mixed")).toBe(6);
    expect(suggestedHours(4, "medium", "mixed")).toBe(12);
    expect(suggestedHours(2, "hard", "mixed")).toBe(8);
  });
  it("problem-solving multiplies by 1.2 (rounded to 0.5h)", () => expect(suggestedHours(4, "hard", "problem-solving")).toBe(19));
  it("memorising multiplies by 0.9 (rounded to 0.5h)", () => expect(suggestedHours(4, "hard", "memorising")).toBe(14.5));
});

describe("editable hours", () => {
  it("totalHours uses the student's entered hours", () => expect(totalHours(subj(10))).toBe(10));
  it("warns when hours are below 60% of suggested", () => {
    expect(isLowHours(5, 10)).toBe(true); // 50% of 10
    expect(isLowHours(5.9, 10)).toBe(true);
  });
  it("no warning at or above 60% of suggested", () => {
    expect(isLowHours(6, 10)).toBe(false);
    expect(isLowHours(12, 10)).toBe(false);
  });
});

describe("daily split", () => {
  it("splits evenly across days left", () => {
    const days = daysLeft("2026-10-21", new Date(2026, 9, 17));
    expect(days).toBe(4);
    expect(dailyTarget(subj(16), days)).toBe(4);
  });
  it("exam today still gives at least 1 day", () => expect(daysLeft("2026-10-17", new Date(2026, 9, 17))).toBe(1));
});

describe("gamify", () => {
  it("awards 10 points per full hour studied", () => {
    expect(gamifyPoints(0)).toBe(0);
    expect(gamifyPoints(2.5)).toBe(20);
    expect(gamifyPoints(5)).toBe(50);
  });
  it("cashback credit is up to Rs 20, proportional to plan completion", () => {
    expect(cashbackFor(0)).toBe(0);
    expect(cashbackFor(50)).toBe(10);
    expect(cashbackFor(100)).toBe(20);
    expect(cashbackFor(150)).toBe(20); // never above Rs 20
  });
});
