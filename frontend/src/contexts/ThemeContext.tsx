import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const themes = [
  { id: "cappuccino", name: "Cappuccino", description: "Cozy espresso, caramel and cream", swatches: ["#18110f", "#d69c65", "#faedd8"] },
  { id: "github", name: "GitHub AMOLED", description: "Vibrant green on true black", swatches: ["#000000", "#1de660", "#f1f7f2"] },
  { id: "godzilla", name: "Godzilla AMOLED", description: "Neon blue against deep black", swatches: ["#000308", "#0026ff", "#e7faff"] },
  { id: "starry", name: "Starry Night", description: "Vibrant purple and AMOLED black", swatches: ["#04020c", "#5d25f5", "#f7f0ff"] },
  { id: "light", name: "Light", description: "Soft paper with forest accents", swatches: ["#f8f6f0", "#2f7e52", "#2d312e"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
interface ThemeContextValue { theme: ThemeId; setTheme: (theme: ThemeId) => void }
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const storageKey = "anteiku-theme";

function isThemeId(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const stored = window.localStorage.getItem(storageKey);
    return isThemeId(stored) ? stored : "cappuccino";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
