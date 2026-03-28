import { useApp } from "@/context/AppContext";
import { evaluate } from "@/utils/mathUtils";
import { Delete } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CalcDisplay } from "./CalcDisplay";

const BUTTONS = [
  ["AC", "+/-", "%", "\u00f7"],
  ["7", "8", "9", "\u00d7"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["(", "0", ".", "="],
];

// All button labels are unique so using them as keys is safe
const FLAT_BUTTONS = BUTTONS.flat();

export function BasicCalculator() {
  const { isDark, addHistory, recallExpression, setRecallExpression } =
    useApp();
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [justEvaled, setJustEvaled] = useState(false);

  useEffect(() => {
    if (recallExpression !== null) {
      setExpr(recallExpression);
      setResult("");
      setRecallExpression(null);
    }
  }, [recallExpression, setRecallExpression]);

  const press = useCallback(
    (btn: string) => {
      if (btn === "AC") {
        setExpr("");
        setResult("");
        setJustEvaled(false);
        return;
      }
      if (btn === "=") {
        if (!expr) return;
        const r = evaluate(expr);
        setResult(r);
        if (r !== "Error") {
          addHistory({ expression: expr, result: r, mode: "basic" });
        }
        setJustEvaled(true);
        return;
      }
      if (btn === "+/-") {
        setExpr((p) => (p.startsWith("-") ? p.slice(1) : p ? `-${p}` : "-"));
        setJustEvaled(false);
        return;
      }
      if (btn === "DEL") {
        setExpr((p) => p.slice(0, -1));
        setJustEvaled(false);
        return;
      }

      if (btn === "(") {
        setExpr((p) => {
          const base = justEvaled ? "" : p;
          setResult("");
          setJustEvaled(false);
          return `${base}()`;
        });
        return;
      }

      setExpr((p) => {
        const base = justEvaled && /[\d.]/.test(btn) ? "" : p;
        return base + btn;
      });
      setResult("");
      setJustEvaled(false);
    },
    [expr, justEvaled, addHistory],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key;
      if (k >= "0" && k <= "9") press(k);
      else if (k === "+") press("+");
      else if (k === "-") press("-");
      else if (k === "*") press("\u00d7");
      else if (k === "/") {
        e.preventDefault();
        press("\u00f7");
      } else if (k === ".") press(".");
      else if (k === "Enter" || k === "=") press("=");
      else if (k === "Backspace") press("DEL");
      else if (k === "Escape") press("AC");
      else if (k === "%") press("%");
      else if (k === "(") press("(");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [press]);

  const btnClass = (btn: string) => {
    const base =
      "h-16 w-full rounded-2xl text-lg font-medium flex items-center justify-center select-none cursor-pointer";
    if (btn === "=") return `${base} accent-gradient text-white glow`;
    if (["\u00f7", "\u00d7", "-", "+"].includes(btn))
      return `${base} ${
        isDark ? "glass-btn text-cyan-300" : "glass-btn-light text-cyan-600"
      }`;
    if (["AC", "+/-", "%"].includes(btn))
      return `${base} ${
        isDark
          ? "bg-white/[0.12] border border-white/[0.18]"
          : "bg-black/[0.09] border border-black/[0.12]"
      } hover:brightness-110 transition-all`;
    return `${base} ${isDark ? "glass-btn" : "glass-btn-light"}`;
  };

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2">
      <CalcDisplay expression={expr} result={result || "0"} />
      <div className="grid grid-cols-4 gap-2.5 flex-1">
        {FLAT_BUTTONS.map((btn) => (
          <button
            key={btn}
            type="button"
            data-ocid={
              btn === "="
                ? "calc.submit_button"
                : btn === "AC"
                  ? "calc.delete_button"
                  : "calc.button"
            }
            className={btnClass(btn)}
            onClick={() => press(btn)}
          >
            {btn}
          </button>
        ))}
        <button
          type="button"
          data-ocid="calc.secondary_button"
          className={`h-16 w-full rounded-2xl text-lg font-medium flex items-center justify-center select-none cursor-pointer ${
            isDark ? "glass-btn" : "glass-btn-light"
          }`}
          onClick={() => press("DEL")}
        >
          <Delete size={20} />
        </button>
      </div>
    </div>
  );
}
