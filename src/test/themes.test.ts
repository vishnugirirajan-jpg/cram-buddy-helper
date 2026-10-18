import { beforeEach, describe, expect, it } from "vitest";
import { availablePoints, defaultThemeState, isThemeUnlocked, loadThemes, saveThemes, unlockTheme } from "@/lib/themes";

beforeEach(() => localStorage.clear());
describe("theme rewards", () => {
  it("defaults to dark and makes light free", () => {
    expect(loadThemes().selected).toBe("dark");
    expect(isThemeUnlocked("light", defaultThemeState, false)).toBe(true);
  });
  it.each([["neon", 100], ["paper", 150], ["sunset", 200]] as const)("unlocks %s for exactly %i points", (theme, cost) => {
    expect(isThemeUnlocked(theme, defaultThemeState, false)).toBe(false);
    expect(unlockTheme(defaultThemeState, theme, cost - 1)).toBeNull();
    const result = unlockTheme(defaultThemeState, theme, cost);
    expect(result).toEqual({ selected: theme, unlocked: [theme], spent: cost });
    if (!result) throw new Error("Unlock failed");
    expect(unlockTheme(result, theme, cost)?.spent).toBe(cost);
    expect(availablePoints(cost, result.spent)).toBe(0);
  });
  it("deducts previous purchases from available points", () => {
    const state = unlockTheme(defaultThemeState, "neon", 200);
    if (!state) throw new Error("Unlock failed");
    expect(unlockTheme(state, "paper", 200)).toBeNull();
    expect(unlockTheme(state, "paper", 250)?.spent).toBe(250);
  });
  it("includes every extra theme with Pro without spending points", () => {
    for (const theme of ["neon", "paper", "sunset"] as const) {
      expect(isThemeUnlocked(theme, defaultThemeState, true)).toBe(true);
      expect(unlockTheme(defaultThemeState, theme, 0, true)?.spent).toBe(0);
    }
  });
  it("preserves selected and purchased themes after reload", () => {
    const state = unlockTheme(defaultThemeState, "paper", 150);
    if (!state) throw new Error("Unlock failed");
    saveThemes(state);
    expect(loadThemes()).toEqual({ selected: "paper", unlocked: ["paper"], spent: 150 });
  });
});