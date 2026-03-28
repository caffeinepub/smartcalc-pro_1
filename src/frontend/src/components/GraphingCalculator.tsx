import { useApp } from "@/context/AppContext";
import { evaluateAt } from "@/utils/mathUtils";
import { Plus, RefreshCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const COLORS = [
  "#22d3ee",
  "#34d399",
  "#f59e0b",
  "#f87171",
  "#a78bfa",
  "#60a5fa",
];

interface FnEntry {
  id: string;
  expr: string;
  color: string;
}

function drawGraph(
  canvas: HTMLCanvasElement,
  functions: FnEntry[],
  xMin: number,
  xMax: number,
  isDark: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const step = (xMax - xMin) / W;
  let yMin = -10;
  let yMax = 10;
  for (const fn of functions) {
    for (let px = 0; px < W; px++) {
      const x = xMin + px * step;
      const y = evaluateAt(fn.expr, x);
      if (Number.isFinite(y)) {
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
  }
  const yPad = (yMax - yMin) * 0.1 || 1;
  yMin -= yPad;
  yMax += yPad;

  const xToPixel = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const yToPixel = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.30)";
  const textColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const xGridStep = 10 ** (Math.floor(Math.log10(xMax - xMin)) - 1);
  const yGridStep = 10 ** (Math.floor(Math.log10(yMax - yMin)) - 1);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (
    let gx = Math.ceil(xMin / xGridStep) * xGridStep;
    gx <= xMax;
    gx += xGridStep
  ) {
    const px = xToPixel(gx);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, H);
    ctx.stroke();
  }
  for (
    let gy = Math.ceil(yMin / yGridStep) * yGridStep;
    gy <= yMax;
    gy += yGridStep
  ) {
    const py = yToPixel(gy);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W, py);
    ctx.stroke();
  }

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1.5;
  const x0 = xToPixel(0);
  const y0 = yToPixel(0);
  if (x0 >= 0 && x0 <= W) {
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, H);
    ctx.stroke();
  }
  if (y0 >= 0 && y0 <= H) {
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(W, y0);
    ctx.stroke();
  }

  ctx.fillStyle = textColor;
  ctx.font = "10px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  const labelCountX = Math.min(10, Math.floor(W / 60));
  for (let i = 0; i <= labelCountX; i++) {
    const x = xMin + (i / labelCountX) * (xMax - xMin);
    const px = xToPixel(x);
    const py = Math.min(H - 4, Math.max(14, y0 + 14));
    ctx.fillText(Number(x.toFixed(2)).toString(), px, py);
  }

  for (const fn of functions) {
    ctx.strokeStyle = fn.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= W; px++) {
      const x = xMin + (px / W) * (xMax - xMin);
      const y = evaluateAt(fn.expr, x);
      if (!Number.isFinite(y)) {
        started = false;
        continue;
      }
      const py = yToPixel(y);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

export function GraphingCalculator() {
  const { isDark } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<FnEntry[]>([
    { id: "1", expr: "sin(x)", color: COLORS[0] },
    { id: "2", expr: "x^2/10", color: COLORS[1] },
  ]);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [inputVal, setInputVal] = useState("");

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    drawGraph(
      canvas,
      functions.filter((f) => f.expr.trim()),
      xMin,
      xMax,
      isDark,
    );
  }, [functions, xMin, xMax, isDark]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => redraw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [redraw]);

  const addFn = () => {
    if (!inputVal.trim()) return;
    setFunctions((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        expr: inputVal.trim(),
        color: COLORS[p.length % COLORS.length],
      },
    ]);
    setInputVal("");
  };

  const zoom = (factor: number) => {
    const range = xMax - xMin;
    const center = (xMax + xMin) / 2;
    const newRange = range * factor;
    setXMin(center - newRange / 2);
    setXMax(center + newRange / 2);
  };

  const btnCls = `p-2 rounded-xl transition-all ${
    isDark ? "glass-btn" : "glass-btn-light"
  }`;

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2 gap-3">
      <div
        className={`flex-1 rounded-2xl overflow-hidden relative ${
          isDark ? "calc-screen" : "calc-screen-light"
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          data-ocid="graph.button"
          className={btnCls}
          onClick={() => zoom(0.6)}
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          data-ocid="graph.secondary_button"
          className={btnCls}
          onClick={() => zoom(1.6)}
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => {
            setXMin(-10);
            setXMax(10);
          }}
        >
          <RefreshCw size={16} />
        </button>
        <span className="text-xs text-muted-foreground self-center ml-1">
          x: [{xMin.toFixed(1)}, {xMax.toFixed(1)}]
        </span>
      </div>
      <div className="space-y-2">
        {functions.map((fn, idx) => (
          <div
            key={fn.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              isDark ? "glass-btn" : "glass-btn-light"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: fn.color }}
            />
            <input
              data-ocid="graph.input"
              className="flex-1 bg-transparent text-sm outline-none"
              value={fn.expr}
              onChange={(e) =>
                setFunctions((p) =>
                  p.map((f) =>
                    f.id === fn.id ? { ...f, expr: e.target.value } : f,
                  ),
                )
              }
              placeholder="e.g. sin(x)"
            />
            <button
              type="button"
              data-ocid={`graph.delete_button.${idx + 1}`}
              onClick={() =>
                setFunctions((p) => p.filter((f) => f.id !== fn.id))
              }
              className="opacity-50 hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          data-ocid="graph.search_input"
          className={`flex-1 px-3 py-2.5 rounded-xl text-sm outline-none ${
            isDark ? "glass-btn" : "glass-btn-light"
          }`}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addFn()}
          placeholder="Add function e.g. cos(x)*2"
        />
        <button
          type="button"
          data-ocid="graph.primary_button"
          onClick={addFn}
          className="px-3 py-2.5 rounded-xl accent-gradient text-white text-sm font-medium"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
