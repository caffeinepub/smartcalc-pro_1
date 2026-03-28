import { useApp } from "@/context/AppContext";
import { Copy } from "lucide-react";
import { useState } from "react";

type Base = "DEC" | "BIN" | "OCT" | "HEX";

const BASES: Base[] = ["DEC", "BIN", "OCT", "HEX"];
const HEX_BTNS = ["A", "B", "C", "D", "E", "F"];

const BITWISE_OPS: { label: string; fn: (a: number, b: number) => number }[] = [
  { label: "AND", fn: (a, b) => a & b },
  { label: "OR", fn: (a, b) => a | b },
  { label: "XOR", fn: (a, b) => a ^ b },
  { label: "NOT", fn: (a) => ~a },
  { label: "<<", fn: (a, b) => a << b },
  { label: ">>", fn: (a, b) => a >> b },
];

function toBase(n: number, base: Base): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) return "Error";
  const i = Math.trunc(n);
  if (base === "DEC") return String(i);
  if (base === "BIN") return i < 0 ? `-${(-i).toString(2)}` : i.toString(2);
  if (base === "OCT") return i < 0 ? `-${(-i).toString(8)}` : i.toString(8);
  return (i < 0 ? `-${(-i).toString(16)}` : i.toString(16)).toUpperCase();
}

function parseBase(s: string, base: Base): number {
  const negative = s.startsWith("-");
  const abs = negative ? s.slice(1) : s;
  let n: number;
  if (base === "DEC") n = Number.parseInt(abs, 10);
  else if (base === "BIN") n = Number.parseInt(abs, 2);
  else if (base === "OCT") n = Number.parseInt(abs, 8);
  else n = Number.parseInt(abs, 16);
  return negative ? -n : n;
}

export function ProgrammerCalculator() {
  const { isDark } = useApp();
  const [inputBase, setInputBase] = useState<Base>("DEC");
  const [inputStr, setInputStr] = useState("0");
  const [opA, setOpA] = useState("");
  const [opB, setOpB] = useState("");
  const [bitwiseResult, setBitwiseResult] = useState<string | null>(null);

  const decValue = (() => {
    try {
      return parseBase(inputStr || "0", inputBase);
    } catch {
      return Number.NaN;
    }
  })();

  const append = (ch: string) => setInputStr((p) => (p === "0" ? ch : p + ch));
  const del = () => setInputStr((p) => (p.length <= 1 ? "0" : p.slice(0, -1)));
  const clear = () => setInputStr("0");

  const digitAllowed = (d: string): boolean => {
    if (inputBase === "BIN") return "01".includes(d);
    if (inputBase === "OCT") return "01234567".includes(d);
    if (inputBase === "HEX") return "0123456789ABCDEF".includes(d);
    return true;
  };

  const glassCls = isDark ? "glass" : "glass-light";
  const tabCls = (active: boolean) =>
    `flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
      active
        ? "accent-gradient text-white"
        : isDark
          ? "glass-btn"
          : "glass-btn-light"
    }`;

  const numBtns = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."];

  const copyBase = (base: Base) => {
    navigator.clipboard.writeText(toBase(decValue, base));
  };

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2 gap-3 overflow-y-auto">
      <div className="flex gap-1.5">
        {BASES.map((b) => (
          <button
            key={b}
            type="button"
            data-ocid="prog.tab"
            className={tabCls(inputBase === b)}
            onClick={() => {
              setInputBase(b);
              setInputStr("0");
            }}
          >
            {b}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-2xl ${glassCls}`}>
        <input
          data-ocid="prog.input"
          className="w-full bg-transparent text-3xl font-light text-right outline-none tracking-wide"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value.toUpperCase())}
          placeholder="0"
        />
      </div>

      <div className={`p-4 rounded-2xl ${glassCls} space-y-2`}>
        {BASES.map((b) => (
          <div key={b} className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground w-10">
              {b}
            </span>
            <span
              data-ocid="prog.panel"
              className={`flex-1 text-sm font-mono text-right ${
                b === inputBase ? "accent-text font-semibold" : ""
              } ${b === "BIN" ? "text-xs leading-relaxed break-all" : ""}`}
            >
              {toBase(decValue, b)}
            </span>
            <button
              type="button"
              data-ocid="prog.button"
              className="ml-2 p-1 opacity-50 hover:opacity-100"
              onClick={() => copyBase(b)}
            >
              <Copy size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {HEX_BTNS.map((h) => (
          <button
            key={h}
            type="button"
            className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
              inputBase === "HEX"
                ? isDark
                  ? "bg-purple-500/25 border border-purple-500/30 text-purple-300"
                  : "bg-purple-500/15 border border-purple-500/20 text-purple-700"
                : `opacity-30 cursor-not-allowed ${
                    isDark ? "glass-btn" : "glass-btn-light"
                  }`
            }`}
            onClick={() => inputBase === "HEX" && digitAllowed(h) && append(h)}
            disabled={inputBase !== "HEX"}
          >
            {h}
          </button>
        ))}
        <button
          type="button"
          className={`py-2.5 rounded-xl text-sm font-medium ${
            isDark
              ? "bg-destructive/50 border border-destructive/30"
              : "bg-destructive/20 text-destructive"
          }`}
          onClick={clear}
        >
          AC
        </button>
        <button
          type="button"
          className={`py-2.5 rounded-xl text-sm font-medium ${
            isDark ? "glass-btn" : "glass-btn-light"
          }`}
          onClick={del}
        >
          &#x232B;
        </button>

        {numBtns.map((d) => (
          <button
            key={d}
            type="button"
            data-ocid="prog.secondary_button"
            className={`py-3 rounded-xl text-sm font-medium transition-all ${
              digitAllowed(d)
                ? isDark
                  ? "glass-btn"
                  : "glass-btn-light"
                : `opacity-30 cursor-not-allowed ${
                    isDark ? "glass-btn" : "glass-btn-light"
                  }`
            }`}
            onClick={() => digitAllowed(d) && append(d)}
            disabled={!digitAllowed(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-2xl ${glassCls} space-y-3`}>
        <p className="text-xs font-semibold text-muted-foreground">
          Bitwise Operations
        </p>
        <div className="flex gap-2">
          <input
            data-ocid="prog.search_input"
            className={`flex-1 px-2.5 py-2 rounded-xl text-sm outline-none ${
              isDark
                ? "bg-white/[0.08] border border-white/[0.12]"
                : "bg-black/[0.06] border border-black/[0.10]"
            }`}
            placeholder="Operand A"
            value={opA}
            onChange={(e) => setOpA(e.target.value)}
          />
          <input
            className={`flex-1 px-2.5 py-2 rounded-xl text-sm outline-none ${
              isDark
                ? "bg-white/[0.08] border border-white/[0.12]"
                : "bg-black/[0.06] border border-black/[0.10]"
            }`}
            placeholder="Operand B"
            value={opB}
            onChange={(e) => setOpB(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {BITWISE_OPS.map((op) => (
            <button
              key={op.label}
              type="button"
              data-ocid="prog.primary_button"
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                isDark
                  ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                  : "bg-blue-500/15 text-blue-600"
              }`}
              onClick={() => {
                const a = Number.parseInt(opA || "0");
                const b = Number.parseInt(opB || "0");
                const res = op.fn(a, b);
                setBitwiseResult(`${op.label}: ${res} (${toBase(res, "BIN")})`);
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
        {bitwiseResult && (
          <p
            data-ocid="prog.success_state"
            className="text-sm text-center accent-text font-mono"
          >
            {bitwiseResult}
          </p>
        )}
      </div>
    </div>
  );
}
