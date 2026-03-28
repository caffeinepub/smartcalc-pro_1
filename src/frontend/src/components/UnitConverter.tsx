import { useApp } from "@/context/AppContext";
import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";

type Category =
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "speed"
  | "volume";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "weight", label: "Weight" },
  { key: "temperature", label: "Temp" },
  { key: "area", label: "Area" },
  { key: "speed", label: "Speed" },
  { key: "volume", label: "Volume" },
];

type UnitDef = {
  key: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { key: "m", label: "Meters (m)", toBase: (v) => v, fromBase: (v) => v },
    {
      key: "km",
      label: "Kilometers (km)",
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    {
      key: "cm",
      label: "Centimeters (cm)",
      toBase: (v) => v / 100,
      fromBase: (v) => v * 100,
    },
    {
      key: "mm",
      label: "Millimeters (mm)",
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    {
      key: "ft",
      label: "Feet (ft)",
      toBase: (v) => v * 0.3048,
      fromBase: (v) => v / 0.3048,
    },
    {
      key: "in",
      label: "Inches (in)",
      toBase: (v) => v * 0.0254,
      fromBase: (v) => v / 0.0254,
    },
    {
      key: "mi",
      label: "Miles (mi)",
      toBase: (v) => v * 1609.344,
      fromBase: (v) => v / 1609.344,
    },
    {
      key: "yd",
      label: "Yards (yd)",
      toBase: (v) => v * 0.9144,
      fromBase: (v) => v / 0.9144,
    },
  ],
  weight: [
    {
      key: "kg",
      label: "Kilograms (kg)",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      key: "g",
      label: "Grams (g)",
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    {
      key: "lb",
      label: "Pounds (lb)",
      toBase: (v) => v * 0.453592,
      fromBase: (v) => v / 0.453592,
    },
    {
      key: "oz",
      label: "Ounces (oz)",
      toBase: (v) => v * 0.0283495,
      fromBase: (v) => v / 0.0283495,
    },
    {
      key: "t",
      label: "Tonnes (t)",
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    {
      key: "mg",
      label: "Milligrams (mg)",
      toBase: (v) => v / 1e6,
      fromBase: (v) => v * 1e6,
    },
  ],
  temperature: [
    {
      key: "C",
      label: "Celsius (\u00b0C)",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      key: "F",
      label: "Fahrenheit (\u00b0F)",
      toBase: (v) => ((v - 32) * 5) / 9,
      fromBase: (v) => (v * 9) / 5 + 32,
    },
    {
      key: "K",
      label: "Kelvin (K)",
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  ],
  area: [
    {
      key: "m2",
      label: "Sq. Meters (m\u00b2)",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      key: "km2",
      label: "Sq. Km (km\u00b2)",
      toBase: (v) => v * 1e6,
      fromBase: (v) => v / 1e6,
    },
    {
      key: "ft2",
      label: "Sq. Feet (ft\u00b2)",
      toBase: (v) => v * 0.0929,
      fromBase: (v) => v / 0.0929,
    },
    {
      key: "ac",
      label: "Acres",
      toBase: (v) => v * 4046.86,
      fromBase: (v) => v / 4046.86,
    },
    {
      key: "ha",
      label: "Hectares (ha)",
      toBase: (v) => v * 10000,
      fromBase: (v) => v / 10000,
    },
  ],
  speed: [
    { key: "ms", label: "m/s", toBase: (v) => v, fromBase: (v) => v },
    {
      key: "kmh",
      label: "km/h",
      toBase: (v) => v / 3.6,
      fromBase: (v) => v * 3.6,
    },
    {
      key: "mph",
      label: "mph",
      toBase: (v) => v * 0.44704,
      fromBase: (v) => v / 0.44704,
    },
    {
      key: "kn",
      label: "Knots",
      toBase: (v) => v * 0.514444,
      fromBase: (v) => v / 0.514444,
    },
  ],
  volume: [
    { key: "l", label: "Liters (L)", toBase: (v) => v, fromBase: (v) => v },
    {
      key: "ml",
      label: "Milliliters (mL)",
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    {
      key: "m3",
      label: "Cubic m (m\u00b3)",
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    {
      key: "gal",
      label: "Gallons (US)",
      toBase: (v) => v * 3.78541,
      fromBase: (v) => v / 3.78541,
    },
    {
      key: "fl",
      label: "Fl. oz (US)",
      toBase: (v) => v * 0.0295735,
      fromBase: (v) => v / 0.0295735,
    },
  ],
};

function fmtNum(v: number): string {
  if (!Number.isFinite(v)) return "\u2014";
  const abs = Math.abs(v);
  if (abs === 0) return "0";
  if (abs >= 1e9 || (abs > 0 && abs < 1e-6)) return v.toExponential(4);
  return String(Number.parseFloat(v.toPrecision(8)));
}

export function UnitConverter() {
  const { isDark } = useApp();
  const [cat, setCat] = useState<Category>("length");
  const units = UNITS[cat];
  const [fromUnit, setFromUnit] = useState(units[0].key);
  const [toUnit, setToUnit] = useState(units[1].key);
  const [inputVal, setInputVal] = useState("1");

  const changeCategory = (c: Category) => {
    setCat(c);
    const us = UNITS[c];
    setFromUnit(us[0].key);
    setToUnit(us[1].key);
    setInputVal("1");
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getResult = () => {
    const v = Number.parseFloat(inputVal);
    if (Number.isNaN(v)) return "\u2014";
    const from = units.find((u) => u.key === fromUnit);
    const to = units.find((u) => u.key === toUnit);
    if (!from || !to) return "\u2014";
    return fmtNum(to.fromBase(from.toBase(v)));
  };

  const glassCls = isDark ? "glass" : "glass-light";
  const tabCls = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
      active
        ? "accent-gradient text-white"
        : isDark
          ? "glass-btn"
          : "glass-btn-light"
    }`;
  const selectCls = `w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none ${
    isDark
      ? "bg-white/[0.08] border border-white/[0.12]"
      : "bg-black/[0.06] border border-black/[0.10]"
  }`;

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2 gap-3 overflow-y-auto">
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            data-ocid="converter.tab"
            className={tabCls(cat === c.key)}
            onClick={() => changeCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={`p-5 rounded-2xl ${glassCls} space-y-4`}>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">From</p>
          <div className="flex gap-2">
            <input
              data-ocid="converter.input"
              type="number"
              className={`flex-1 px-3 py-2.5 rounded-xl text-lg outline-none ${
                isDark
                  ? "bg-white/[0.08] border border-white/[0.12] focus:border-white/30"
                  : "bg-black/[0.06] border border-black/[0.10]"
              }`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <select
              data-ocid="converter.select"
              className={`${selectCls} w-auto`}
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            data-ocid="converter.button"
            onClick={swap}
            className={`p-2.5 rounded-full transition-all ${
              isDark ? "glass-btn" : "glass-btn-light"
            }`}
          >
            <ArrowRightLeft size={16} className="accent-text" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">To</p>
          <div className="flex gap-2 items-center">
            <div
              data-ocid="converter.success_state"
              className={`flex-1 px-3 py-2.5 rounded-xl text-lg font-light ${
                isDark
                  ? "bg-white/[0.04] border border-white/[0.08]"
                  : "bg-black/[0.03] border border-black/[0.06]"
              }`}
            >
              <span className="accent-text font-medium">{getResult()}</span>
            </div>
            <select
              data-ocid="converter.select"
              className={`${selectCls} w-auto`}
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-2xl ${glassCls}`}>
        <p className="text-xs text-muted-foreground mb-3">All Conversions</p>
        <div className="space-y-2">
          {units.map((u) => {
            const v = Number.parseFloat(inputVal);
            const from = units.find((x) => x.key === fromUnit);
            if (!from || Number.isNaN(v)) return null;
            const converted = fmtNum(u.fromBase(from.toBase(v)));
            return (
              <div
                key={u.key}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">{u.label}</span>
                <span className={u.key === fromUnit ? "font-semibold" : ""}>
                  {converted}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
