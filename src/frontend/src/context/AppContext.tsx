import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "teal" | "purple" | "orange" | "blue" | "green";
export type Mode =
  | "basic"
  | "scientific"
  | "graphing"
  | "matrix"
  | "converter"
  | "finance"
  | "programmer";

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  mode: Mode;
  timestamp: number;
}

interface AppContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  toggleDark: () => void;
  history: HistoryEntry[];
  addHistory: (e: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  historyOpen: boolean;
  setHistoryOpen: (v: boolean) => void;
  recallExpression: string | null;
  setRecallExpression: (v: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("basic");
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("calc-theme") as Theme) || "teal";
  });
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("calc-dark");
    return stored === null ? true : stored === "true";
  });
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("calc-history") || "[]");
    } catch {
      return [];
    }
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recallExpression, setRecallExpression] = useState<string | null>(null);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("calc-theme", t);
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      localStorage.setItem("calc-dark", String(!prev));
      return !prev;
    });
  }, []);

  const addHistory = useCallback(
    (e: Omit<HistoryEntry, "id" | "timestamp">) => {
      const entry: HistoryEntry = {
        ...e,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        localStorage.setItem("calc-history", JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("calc-history");
  }, []);

  // Apply dark class and theme class to documentElement
  useEffect(() => {
    const el = document.documentElement;
    if (isDark) el.classList.add("dark");
    else el.classList.remove("dark");
  }, [isDark]);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove(
      "theme-purple",
      "theme-orange",
      "theme-blue",
      "theme-green",
    );
    if (theme !== "teal") el.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        theme,
        setTheme,
        isDark,
        toggleDark,
        history,
        addHistory,
        clearHistory,
        historyOpen,
        setHistoryOpen,
        recallExpression,
        setRecallExpression,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
