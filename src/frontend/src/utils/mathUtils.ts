// Safe expression evaluator without external dependencies

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return Number.NaN;
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function formatResult(r: number): string {
  if (!Number.isFinite(r)) return r > 0 ? "∞" : "-∞";
  if (Number.isNaN(r)) return "Error";
  const abs = Math.abs(r);
  if (abs === 0) return "0";
  if (abs >= 1e15 || (abs > 0 && abs < 1e-9)) return r.toExponential(6);
  const p = Number.parseFloat(r.toPrecision(12));
  return String(p);
}

function transformExpr(expr: string, degreeMode: boolean): string {
  let e = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, `(${Math.PI})`)
    .replace(/\^/g, "**")
    .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)")
    .replace(/(\d+)!/g, (_, n) => String(factorial(Number(n))));

  if (degreeMode) {
    e = e
      .replace(/\bsin\(/g, "_sd(")
      .replace(/\bcos\(/g, "_cd(")
      .replace(/\btan\(/g, "_td(");
  } else {
    e = e
      .replace(/\bsin\(/g, "Math.sin(")
      .replace(/\bcos\(/g, "Math.cos(")
      .replace(/\btan\(/g, "Math.tan(");
  }

  e = e
    .replace(/\basin\(/g, "Math.asin(")
    .replace(/\bacos\(/g, "Math.acos(")
    .replace(/\batan\(/g, "Math.atan(")
    .replace(/\bsqrt\(/g, "Math.sqrt(")
    .replace(/\bcbrt\(/g, "Math.cbrt(")
    .replace(/\bln\(/g, "Math.log(")
    .replace(/\blog\(/g, "Math.log10(")
    .replace(/\babs\(/g, "Math.abs(")
    .replace(/\bfloor\(/g, "Math.floor(")
    .replace(/\bceil\(/g, "Math.ceil(")
    .replace(/\bround\(/g, "Math.round(")
    .replace(/\bexp\(/g, "Math.exp(")
    .replace(/\be\b/g, String(Math.E));

  return e;
}

export function evaluate(expr: string, degreeMode = true): string {
  try {
    const trimmed = expr.trim();
    if (!trimmed) return "";

    if (trimmed.includes(";")) {
      return trimmed
        .split(";")
        .map((p) => evaluate(p.trim(), degreeMode))
        .join(" | ");
    }

    const e = transformExpr(trimmed, degreeMode);
    const toRad = (d: number) => (d * Math.PI) / 180;
    const _sd = (d: number) => Math.sin(toRad(d));
    const _cd = (d: number) => Math.cos(toRad(d));
    const _td = (d: number) => Math.tan(toRad(d));

    // eslint-disable-next-line no-new-func
    const result = new Function(
      "Math",
      "_sd",
      "_cd",
      "_td",
      `"use strict"; return (${e})`,
    )(Math, _sd, _cd, _td);

    if (typeof result !== "number") return "Error";
    return formatResult(result);
  } catch {
    return "Error";
  }
}

export function evaluateAt(
  expr: string,
  x: number,
  degreeMode = false,
): number {
  try {
    let e = transformExpr(expr.replace(/\bx\b/g, `(${x})`), degreeMode);
    const toRad = (d: number) => (d * Math.PI) / 180;
    const _sd = (d: number) => Math.sin(toRad(d));
    const _cd = (d: number) => Math.cos(toRad(d));
    const _td = (d: number) => Math.tan(toRad(d));
    // eslint-disable-next-line no-new-func
    const result = new Function(
      "Math",
      "_sd",
      "_cd",
      "_td",
      `"use strict"; return (${e})`,
    )(Math, _sd, _cd, _td);
    return typeof result === "number" ? result : Number.NaN;
  } catch {
    return Number.NaN;
  }
}

// Matrix utilities
export type Matrix = number[][];

export function matAdd(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}
export function matSub(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}
export function matMul(a: Matrix, b: Matrix): Matrix {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      Array.from({ length: inner }, (__, k) => a[i][k] * b[k][j]).reduce(
        (s, v) => s + v,
        0,
      ),
    ),
  );
}
export function matTranspose(a: Matrix): Matrix {
  return a[0].map((_, j) => a.map((row) => row[j]));
}
export function matDet(a: Matrix): number {
  const n = a.length;
  if (n === 1) return a[0][0];
  if (n === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  let det = 0;
  for (let c = 0; c < n; c++) {
    const minor = a.slice(1).map((row) => row.filter((_, j) => j !== c));
    det += (c % 2 === 0 ? 1 : -1) * a[0][c] * matDet(minor);
  }
  return det;
}
export function matInverse(a: Matrix): Matrix | null {
  const n = a.length;
  const det = matDet(a);
  if (Math.abs(det) < 1e-12) return null;
  if (n === 2) {
    return [
      [a[1][1] / det, -a[0][1] / det],
      [-a[1][0] / det, a[0][0] / det],
    ];
  }
  // Gauss-Jordan for 3x3
  const aug = a.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
    }
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
    const scale = aug[col][col];
    if (Math.abs(scale) < 1e-12) return null;
    aug[col] = aug[col].map((v) => v / scale);
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const f = aug[row][col];
        aug[row] = aug[row].map((v, k) => v - f * aug[col][k]);
      }
    }
  }
  return aug.map((row) => row.slice(n));
}

// Finance utilities
export function calcEMI(principal: number, annualRate: number, months: number) {
  if (annualRate === 0)
    return { emi: principal / months, total: principal, interest: 0 };
  const r = annualRate / 100 / 12;
  const emi = (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  const total = emi * months;
  return { emi, total, interest: total - principal };
}
export function calcCompound(
  principal: number,
  rate: number,
  years: number,
  freq: number,
) {
  const amount = principal * (1 + rate / 100 / freq) ** (freq * years);
  return { amount, interest: amount - principal };
}
export function calcGST(base: number, rate: number) {
  const gst = (base * rate) / 100;
  return { gst, total: base + gst };
}
export function calcSIP(monthly: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return { maturity: monthly * n, gain: 0 };
  const maturity = monthly * (((1 + r) ** n - 1) / r) * (1 + r);
  return { maturity, gain: maturity - monthly * n };
}
