import { useApp } from "@/context/AppContext";
import { evaluate } from "@/utils/mathUtils";
import { Delete } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CalcDisplay } from "./CalcDisplay";

const SCI_ROWS = [
  ["sin", "cos", "tan", "\u03c0", "e"],
  ["asin", "acos", "atan", "log", "ln"],
  ["x\u00b2", "x\u00b3", "x\u02b8", "\u221a", "!"],
  ["(", ")", "abs", "%", "AC"],
];
const NUM_ROWS = [
  ["7", "8", "9", "\u00f7"],
  ["4", "5", "6", "\u00d7"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

export function ScientificCalculator() {
  const { isDark, addHistory, recallExpression, setRecallExpression } =
    useApp();
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [degMode, setDegMode] = useState(true);
  const [justEvaled, setJustEvaled] = useState(false);

  useEffect(() => {
    if (recallExpression !== null) {
      setExpr(recallExpression);
      setResult("");
      setRecallExpression(null);
    }
  }, [recallExpression, setRecallExpression]);

  const append = useCallback(
    (s: string) => {
      setExpr((p) => {
        const base = justEvaled && /[\d.]/.test(s[0]) ? "" : p;
        return base + s;
      });
      setResult("");
      setJustEvaled(false);
    },
    [justEvaled],
  );

  const press = useCallback(
    (btn: string) => {
      if (btn === "AC") {
        setExpr("");
        setResult("");
        setJustEvaled(false);
        return;
      }
      if (btn === "DEL") {
        setExpr((p) => p.slice(0, -1));
        return;
      }
      if (btn === "=") {
        if (!expr) return;
        const r = evaluate(expr, degMode);
        setResult(r);
        if (r !== "Error")
          addHistory({
            expression: `${expr} [${degMode ? "DEG" : "RAD"}]`,
            result: r,
            mode: "scientific",
          });
        setJustEvaled(true);
        return;
      }
      if (
        [
          "sin",
          "cos",
          "tan",
          "asin",
          "acos",
          "atan",
          "ln",
          "log",
          "abs",
        ].includes(btn)
      ) {
        append(`${btn}(`);
        return;
      }
      if (btn === "\u221a") {
        append("sqrt(");
        return;
      }
      if (btn === "x\u00b2") {
        append("^2");
        return;
      }
      if (btn === "x\u00b3") {
        append("^3");
        return;
      }
      if (btn === "x\u02b8") {
        append("^");
        return;
      }
      append(btn);
    },
    [expr, degMode, append, addHistory],
  );

  const sciBtnClass = (btn: string) => {
    const base =
      "h-11 w-full rounded-xl text-sm font-medium flex items-center justify-center select-none cursor-pointer transition-all";
    if (btn === "AC")
      return `${base} ${isDark ? "bg-destructive/60 border border-destructive/30" : "bg-destructive/20 text-destructive border border-destructive/20"} hover:brightness-110`;
    if (["sin", "cos", "tan", "asin", "acos", "atan"].includes(btn))
      return `${base} ${isDark ? "bg-blue-500/20 border border-blue-500/30 text-blue-300" : "bg-blue-500/15 border border-blue-500/20 text-blue-600"}`;
    if (["log", "ln", "\u221a", "abs"].includes(btn))
      return `${base} ${isDark ? "bg-purple-500/20 border border-purple-500/30 text-purple-300" : "bg-purple-500/15 border border-purple-500/20 text-purple-600"}`;
    if (["\u03c0", "e", "!", "x\u00b2", "x\u00b3", "x\u02b8"].includes(btn))
      return `${base} ${isDark ? "bg-white/[0.12] border border-white/[0.18]" : "bg-black/[0.08] border border-black/[0.12]"}`;
    return `${base} ${isDark ? "glass-btn" : "glass-btn-light"}`;
  };

  const numBtnClass = (btn: string) => {
    const base =
      "h-14 w-full rounded-2xl text-base font-medium flex items-center justify-center select-none cursor-pointer";
    if (btn === "=") return `${base} accent-gradient text-white glow`;
    if (["\u00f7", "\u00d7", "-", "+"].includes(btn))
      return `${base} ${isDark ? "glass-btn text-cyan-300" : "glass-btn-light text-cyan-600"}`;
    return `${base} ${isDark ? "glass-btn" : "glass-btn-light"}`;
  };

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Scientific</span>
        <button
          type="button"
          data-ocid="sci.toggle"
          onClick={() => setDegMode((p) => !p)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${isDark ? "glass-btn" : "glass-btn-light"}`}
        >
          {degMode ? "DEG" : "RAD"}
        </button>
      </div>
      <CalcDisplay expression={expr} result={result || "0"} />
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {SCI_ROWS.flat().map((btn) => (
          <button
            key={btn}
            type="button"
            className={sciBtnClass(btn)}
            onClick={() => press(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {NUM_ROWS.flat().map((btn) => (
          <button
            key={btn}
            type="button"
            data-ocid={btn === "=" ? "sci.submit_button" : undefined}
            className={numBtnClass(btn)}
            onClick={() => press(btn)}
          >
            {btn}
          </button>
        ))}
        <button
          type="button"
          className={`h-14 w-full rounded-2xl text-base font-medium flex items-center justify-center col-span-1 ${isDark ? "glass-btn" : "glass-btn-light"}`}
          onClick={() => press("DEL")}
        >
          <Delete size={18} />
        </button>
      </div>
    </div>
  );
}
