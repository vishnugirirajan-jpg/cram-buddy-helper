import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Check, Lock, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadProActive } from "@/lib/rewards";
import { availablePoints, defaultThemeState, isThemeUnlocked, loadThemes, REWARD_THEMES, saveThemes, unlockTheme, type Theme, type ThemeState, type RewardTheme } from "@/lib/themes";

type ThemeContextValue = {
  state: ThemeState; shown: Theme; ready: boolean; error: string;
  select: (theme: Theme) => void; preview: (theme: Theme | null) => void;
  unlock: (theme: RewardTheme, earned: number, pro: boolean) => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("Theme controls require ThemeProvider");
  return value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(defaultThemeState);
  const [previewTheme, setPreview] = useState<Theme | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const shown = previewTheme ?? state.selected;
  useEffect(() => {
    const saved = loadThemes();
    setState(isThemeUnlocked(saved.selected, saved, loadProActive()) ? saved : { ...saved, selected: "dark" });
    setReady(true);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = shown; }, [shown]);
  const commit = (next: ThemeState) => {
    try { saveThemes(next); setState(next); setPreview(null); setError(""); }
    catch { setError("Theme could not be saved. Allow browser storage, then try again."); }
  };
  return <ThemeContext.Provider value={{ state, shown, ready, error,
    select: theme => { if (isThemeUnlocked(theme, state, loadProActive())) commit({ ...state, selected: theme }); },
    preview: setPreview,
    unlock: (theme, earned, pro) => {
      const next = unlockTheme(state, theme, earned, pro);
      if (next) commit(next);
      else setError("You need more points to unlock this theme.");
    },
  }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { shown, select, ready } = useTheme();
  return <div className="mx-auto max-w-md px-5 pt-3 flex justify-end">
    <Button variant="ghost" size="icon" role="switch" aria-checked={shown === "light"} aria-label="Light mode" title={shown === "light" ? "Switch to dark mode" : "Switch to light mode"} disabled={!ready} onClick={() => select(shown === "light" ? "dark" : "light")}>
      {shown === "light" ? <Moon /> : <Sun />}
    </Button>
  </div>;
}

export function RewardThemes({ earned, pro }: { earned: number; pro: boolean }) {
  const { state, shown, preview, select, unlock, ready, error } = useTheme();
  const balance = availablePoints(earned, state.spent);
  return <section className="border-t border-border pt-4 space-y-3" aria-labelledby="themes-title">
    <h3 id="themes-title" className="font-display text-lg font-semibold">Themes</h3>
    <div className="grid grid-cols-3 gap-3">
      {REWARD_THEMES.map(theme => {
        const unlocked = isThemeUnlocked(theme.id, state, pro);
        return <div key={theme.id} className="min-w-0 space-y-2">
          <Button variant="outline" className={`w-full h-auto p-2 flex-col whitespace-normal ${shown === theme.id ? "ring-2 ring-primary" : ""}`} disabled={!ready} aria-label={`Preview ${theme.name}`} aria-pressed={shown === theme.id} onClick={() => preview(theme.id)}>
            <span data-theme={theme.id} className="theme-swatch w-full h-12 rounded-md border border-border bg-background flex items-center justify-center gap-1.5" aria-hidden="true"><span className="size-5 rounded-full bg-primary" /><span className="size-5 rounded-full bg-secondary border border-border" /><span className="size-5 rounded-full bg-foreground" /></span>
            <span className="flex items-center gap-1">{unlocked ? <Check /> : <Lock />}{theme.name}</span>
          </Button>
          <p className="text-xs text-muted-foreground text-center">{unlocked ? (pro ? "Included in Pro" : "Unlocked") : `${theme.cost} points`}</p>
          {unlocked ? <Button variant={state.selected === theme.id ? "secondary" : "default"} className="w-full" disabled={!ready || state.selected === theme.id} onClick={() => select(theme.id)}>{state.selected === theme.id ? "Active" : "Use"}</Button> : <Button className="w-full" aria-label={`Unlock ${theme.name}`} disabled={!ready || balance < theme.cost} onClick={() => unlock(theme.id, earned, pro)}>Unlock</Button>}
        </div>;
      })}
    </div>
    {shown !== state.selected && <div className="flex items-center justify-between gap-2"><p className="text-sm text-muted-foreground">Previewing {REWARD_THEMES.find(t => t.id === shown)?.name}</p><Button variant="ghost" onClick={() => preview(null)}>Cancel preview</Button></div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}