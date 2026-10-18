import { readSaved } from "@/lib/rewards";

export const THEME_KEY = "semplan.themes";
export const REWARD_THEMES = [
  { id: "neon", name: "Neon", cost: 100 },
  { id: "paper", name: "Paper", cost: 150 },
  { id: "sunset", name: "Sunset", cost: 200 },
] as const;
export type RewardTheme = (typeof REWARD_THEMES)[number]["id"];
export type Theme = "dark" | "light" | RewardTheme;
export type ThemeState = { selected: Theme; unlocked: RewardTheme[]; spent: number };
export const defaultThemeState: ThemeState = { selected: "dark", unlocked: [], spent: 0 };
export const isTheme = (value: unknown): value is Theme => ["dark", "light", ...REWARD_THEMES.map(t => t.id)].includes(value as Theme);
export const isThemeUnlocked = (theme: Theme, state: ThemeState, pro: boolean) => theme === "dark" || theme === "light" || pro || state.unlocked.includes(theme);
export const availablePoints = (earned: number, spent: number) => Math.max(0, earned - spent);

export function unlockTheme(state: ThemeState, theme: RewardTheme, earned: number, pro = false): ThemeState | null {
  if (isThemeUnlocked(theme, state, pro)) return { ...state, selected: theme };
  const reward = REWARD_THEMES.find(t => t.id === theme);
  if (!reward || availablePoints(earned, state.spent) < reward.cost) return null;
  return { selected: theme, unlocked: [...state.unlocked, theme], spent: state.spent + reward.cost };
}

export function loadThemes(): ThemeState {
  const saved = readSaved<Partial<ThemeState> | null>(THEME_KEY, null);
  return {
    selected: isTheme(saved?.selected) ? saved.selected : "dark",
    unlocked: Array.isArray(saved?.unlocked) ? REWARD_THEMES.filter(t => saved.unlocked?.includes(t.id)).map(t => t.id) : [],
    spent: typeof saved?.spent === "number" && Number.isFinite(saved.spent) ? Math.max(0, saved.spent) : 0,
  };
}
export function saveThemes(state: ThemeState) {
  localStorage.setItem(THEME_KEY, JSON.stringify(state));
}