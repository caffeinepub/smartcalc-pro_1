import { useApp } from "@/context/AppContext";
import {
  type Matrix,
  matAdd,
  matDet,
  matInverse,
  matMul,
  matSub,
  matTranspose,
} from "@/utils/mathUtils";
import { useState } from "react";

type Op = "add" | "sub" | "mul" | "det" | "inv" | "transpose";
type Size = 2 | 3;

const OPS: { key: Op; label: string }[] = [
  { key: "add", label: "A + B" },
  { key: "sub", label: "A - B" },
  { key: "mul", label: "A \u00d7 B" },
  { key: "det", label: "det(A)" },
  { key: "inv", label: "A\u207b\u00b9" },
  { key: "transpose", label: "A\u1d40" },
];

// Pre-defined stable key pools for matrix rows and cells (max 3x3)
const ROW_KEYS = ["r0", "r1", "r2"];
const COL_KEYS = ["c0", "c1", "c2"];

function emptyMatrix(n: Size): Matrix {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function MatrixInput({
  mat,
  label,
  onChange,
  isDark,
}: {
  mat: Matrix;
  label: string;
  onChange: (m: Matrix) => void;
  isDark: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5 font-medium">
        {label}
      </p>
      <div className="space-y-1.5">
        {mat.map((row, i) => (
          <div key={ROW_KEYS[i]} className="flex gap-1.5">
            {row.map((val, j) => (
              <input
                key={COL_KEYS[j]}
                data-ocid="matrix.input"
                type="number"
                className={`flex-1 w-0 min-w-0 px-2 py-2 rounded-lg text-center text-sm outline-none transition-colors ${
                  isDark
                    ? "bg-white/[0.08] border border-white/[0.12] focus:border-white/30"
                    : "bg-black/[0.06] border border-black/[0.10] focus:border-black/20"
                }`}
                value={val}
                onChange={(e) => {
                  const newMat = mat.map((r, ri) =>
                    r.map((v, ci) =>
                      ri === i && ci === j ? Number(e.target.value) || 0 : v,
                    ),
                  );
                  onChange(newMat);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixDisplay({
  mat,
  label,
}: {
  mat: Matrix | null;
  label: string;
}) {
  if (!mat) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5 font-medium">
        {label}
      </p>
      <div className="space-y-1 bg-white/[0.04] rounded-xl p-3 font-mono">
        {mat.map((row, i) => (
          <div key={ROW_KEYS[i]} className="flex gap-3 justify-center">
            {row.map((v, j) => (
              <span
                key={COL_KEYS[j]}
                className="w-16 text-center text-sm accent-text font-semibold"
              >
                {Number(v.toPrecision(6)).toString()}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatrixCalculator() {
  const { isDark } = useApp();
  const [size, setSize] = useState<Size>(2);
  const [matA, setMatA] = useState<Matrix>(emptyMatrix(2));
  const [matB, setMatB] = useState<Matrix>(emptyMatrix(2));
  const [op, setOp] = useState<Op>("add");
  const [result, setResult] = useState<Matrix | null>(null);
  const [scalarResult, setScalarResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const changeSize = (s: Size) => {
    setSize(s);
    setMatA(emptyMatrix(s));
    setMatB(emptyMatrix(s));
    setResult(null);
    setScalarResult(null);
    setError("");
  };

  const calculate = () => {
    setError("");
    setResult(null);
    setScalarResult(null);
    try {
      if (op === "add") setResult(matAdd(matA, matB));
      else if (op === "sub") setResult(matSub(matA, matB));
      else if (op === "mul") setResult(matMul(matA, matB));
      else if (op === "det")
        setScalarResult(String(Number(matDet(matA).toPrecision(10))));
      else if (op === "inv") {
        const inv = matInverse(matA);
        if (!inv) setError("Matrix is singular (not invertible)");
        else setResult(inv);
      } else if (op === "transpose") setResult(matTranspose(matA));
    } catch {
      setError("Calculation error");
    }
  };

  const needsB = op === "add" || op === "sub" || op === "mul";
  const glassCls = isDark ? "glass" : "glass-light";
  const tabCls = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
      active
        ? "accent-gradient text-white"
        : isDark
          ? "glass-btn"
          : "glass-btn-light"
    }`;

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2 gap-3 overflow-y-auto">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Matrix size:</span>
        <button
          type="button"
          data-ocid="matrix.toggle"
          className={tabCls(size === 2)}
          onClick={() => changeSize(2)}
        >
          2 \u00d7 2
        </button>
        <button
          type="button"
          className={tabCls(size === 3)}
          onClick={() => changeSize(3)}
        >
          3 \u00d7 3
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {OPS.map((o) => (
          <button
            key={o.key}
            type="button"
            data-ocid="matrix.button"
            className={tabCls(op === o.key)}
            onClick={() => setOp(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-2xl ${glassCls} space-y-4`}>
        <MatrixInput
          mat={matA}
          label="Matrix A"
          onChange={setMatA}
          isDark={isDark}
        />
        {needsB && (
          <MatrixInput
            mat={matB}
            label="Matrix B"
            onChange={setMatB}
            isDark={isDark}
          />
        )}
      </div>

      <button
        type="button"
        data-ocid="matrix.submit_button"
        onClick={calculate}
        className="w-full py-3.5 rounded-2xl accent-gradient text-white font-semibold glow"
      >
        Calculate
      </button>

      {error && (
        <p
          data-ocid="matrix.error_state"
          className="text-destructive text-sm text-center"
        >
          {error}
        </p>
      )}
      {scalarResult && (
        <div className={`p-4 rounded-2xl ${glassCls} text-center`}>
          <p className="text-xs text-muted-foreground mb-1">Result</p>
          <p className="text-3xl font-light accent-text">{scalarResult}</p>
        </div>
      )}
      {result && (
        <div className={`p-4 rounded-2xl ${glassCls}`}>
          <MatrixDisplay mat={result} label="Result" />
        </div>
      )}
    </div>
  );
}
