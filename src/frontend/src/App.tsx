import { BasicCalculator } from "@/components/BasicCalculator";
import { FinanceCalculator } from "@/components/FinanceCalculator";
import { GraphingCalculator } from "@/components/GraphingCalculator";
import { HistoryPanel } from "@/components/HistoryPanel";
import { MatrixCalculator } from "@/components/MatrixCalculator";
import { ProgrammerCalculator } from "@/components/ProgrammerCalculator";
import { ScientificCalculator } from "@/components/ScientificCalculator";
import { UnitConverter } from "@/components/UnitConverter";
import { AppProvider, type Theme, useApp } from "@/context/AppContext";
import type { Mode } from "@/context/AppContext";
import {
  ArrowRightLeft,
  Calculator,
  Code2,
  DollarSign,
  FlaskConical,
  Grid3x3,
  History,
  Moon,
  Sun,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const THEMES: { key: Theme; color: string }[] = [
  { key: "teal", color: "oklch(0.81 0.12 196)" },
  { key: "purple", color: "oklch(0.70 0.22 290)" },
  { key: "orange", color: "oklch(0.78 0.17 55)" },
  { key: "blue", color: "oklch(0.63 0.19 258)" },
  { key: "green", color: "oklch(0.75 0.18 142)" },
];

const NAV_ITEMS: { mode: Mode; icon: React.ReactNode; label: string }[] = [
  { mode: "basic", icon: <Calculator size={20} />, label: "Basic" },
  { mode: "scientific", icon: <FlaskConical size={20} />, label: "Sci" },
  { mode: "graphing", icon: <TrendingUp size={20} />, label: "Graph" },
  { mode: "matrix", icon: <Grid3x3 size={20} />, label: "Matrix" },
  { mode: "converter", icon: <ArrowRightLeft size={20} />, label: "Convert" },
  { mode: "finance", icon: <DollarSign size={20} />, label: "Finance" },
  { mode: "programmer", icon: <Code2 size={20} />, label: "Prog" },
];

function CalcApp() {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    isDark,
    toggleDark,
    historyOpen,
    setHistoryOpen,
  } = useApp();

  const bg = isDark
    ? "bg-gradient-to-b from-[oklch(0.09_0.018_234)] to-[oklch(0.11_0.016_230)]"
    : "bg-gradient-to-b from-[oklch(0.96_0.008_220)] to-[oklch(0.98_0.005_220)]";

  return (
    <div
      className={`fixed inset-0 flex justify-center ${
        isDark ? "bg-black" : "bg-gray-100"
      }`}
    >
      <div
        className={`relative flex flex-col w-full max-w-[420px] h-full ${
          bg
        } overflow-hidden`}
      >
        {/* Header */}
        <header
          className={`flex items-center justify-between px-4 pt-4 pb-3 shrink-0 ${
            isDark
              ? "border-b border-white/[0.07]"
              : "border-b border-black/[0.07]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight accent-text">
              SmartCalc
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isDark
                  ? "bg-white/[0.1] text-white/60"
                  : "bg-black/[0.08] text-black/50"
              }`}
            >
              PRO
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme dots */}
            <div className="flex gap-1">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  data-ocid="app.button"
                  onClick={() => setTheme(t.key)}
                  className={`w-5 h-5 rounded-full transition-all ${
                    theme === t.key
                      ? "ring-2 ring-offset-1 ring-offset-transparent scale-110"
                      : "opacity-60 hover:opacity-90"
                  }`}
                  style={{ background: t.color }}
                  title={t.key}
                />
              ))}
            </div>
            {/* History button */}
            <button
              type="button"
              data-ocid="app.open_modal_button"
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`p-2 rounded-xl transition-all ${
                isDark ? "hover:bg-white/10" : "hover:bg-black/[0.08]"
              }`}
            >
              <History size={18} />
            </button>
            {/* Dark/light toggle */}
            <button
              type="button"
              data-ocid="app.toggle"
              onClick={toggleDark}
              className={`p-2 rounded-xl transition-all ${
                isDark ? "hover:bg-white/10" : "hover:bg-black/[0.08]"
              }`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Mode label */}
        <div className="px-4 pt-2 pb-1 text-xs font-medium text-muted-foreground shrink-0">
          {NAV_ITEMS.find((n) => n.mode === mode)?.label ?? ""}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 overflow-y-auto"
            >
              {mode === "basic" && <BasicCalculator />}
              {mode === "scientific" && <ScientificCalculator />}
              {mode === "graphing" && <GraphingCalculator />}
              {mode === "matrix" && <MatrixCalculator />}
              {mode === "converter" && <UnitConverter />}
              {mode === "finance" && <FinanceCalculator />}
              {mode === "programmer" && <ProgrammerCalculator />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom nav */}
        <nav
          className={`shrink-0 flex border-t ${
            isDark
              ? "border-white/[0.08] bg-[oklch(0.10_0.015_232)]/80"
              : "border-black/[0.08] bg-white/80"
          } backdrop-blur-xl`}
        >
          {NAV_ITEMS.map((item) => {
            const active = mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                data-ocid={`nav.${item.mode}.link`}
                onClick={() => setMode(item.mode)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all ${
                  active ? "" : "opacity-45 hover:opacity-70"
                }`}
              >
                <span
                  className={`p-1 rounded-lg transition-all ${
                    active ? "accent-gradient text-white" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[9px] font-medium ${
                    active ? "accent-text" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* History panel overlay */}
        <HistoryPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CalcApp />
    </AppProvider>
  );
}
