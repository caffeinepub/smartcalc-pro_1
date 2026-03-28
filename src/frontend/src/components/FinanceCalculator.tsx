import { useApp } from "@/context/AppContext";
import { calcCompound, calcEMI, calcGST, calcSIP } from "@/utils/mathUtils";
import { useState } from "react";

type SubMode = "emi" | "compound" | "gst" | "sip";

const MODES: { key: SubMode; label: string }[] = [
  { key: "emi", label: "EMI" },
  { key: "compound", label: "Compound" },
  { key: "gst", label: "GST" },
  { key: "sip", label: "SIP" },
];

function fmt(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  isDark,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  id: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs text-muted-foreground cursor-pointer"
      >
        {label}
      </label>
      <input
        id={id}
        data-ocid="finance.input"
        type="number"
        className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors ${
          isDark
            ? "bg-white/[0.08] border border-white/[0.12] focus:border-white/30"
            : "bg-black/[0.06] border border-black/[0.10] focus:border-black/20"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold accent-text">{value}</span>
    </div>
  );
}

export function FinanceCalculator() {
  const { isDark } = useApp();
  const [subMode, setSubMode] = useState<SubMode>("emi");

  const [emiP, setEmiP] = useState("");
  const [emiR, setEmiR] = useState("");
  const [emiN, setEmiN] = useState("");
  const [emiResult, setEmiResult] = useState<ReturnType<typeof calcEMI> | null>(
    null,
  );

  const [cpP, setCpP] = useState("");
  const [cpR, setCpR] = useState("");
  const [cpT, setCpT] = useState("");
  const [cpF, setCpF] = useState("12");
  const [cpResult, setCpResult] = useState<ReturnType<
    typeof calcCompound
  > | null>(null);

  const [gstBase, setGstBase] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [gstResult, setGstResult] = useState<ReturnType<typeof calcGST> | null>(
    null,
  );

  const [sipM, setSipM] = useState("");
  const [sipR, setSipR] = useState("");
  const [sipY, setSipY] = useState("");
  const [sipResult, setSipResult] = useState<ReturnType<typeof calcSIP> | null>(
    null,
  );

  const glassCls = isDark ? "glass" : "glass-light";
  const tabCls = (active: boolean) =>
    `flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
      active
        ? "accent-gradient text-white"
        : isDark
          ? "glass-btn"
          : "glass-btn-light"
    }`;
  const calcBtn =
    "w-full py-3.5 rounded-2xl accent-gradient text-white font-semibold glow mt-1";

  return (
    <div className="flex flex-col h-full px-3 pb-3 pt-2 gap-3 overflow-y-auto">
      <div className="flex gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            data-ocid="finance.tab"
            className={tabCls(subMode === m.key)}
            onClick={() => setSubMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {subMode === "emi" && (
        <div className={`p-4 rounded-2xl ${glassCls} space-y-3`}>
          <p className="text-sm font-semibold">EMI Calculator</p>
          <Field
            id="emi-p"
            label="Principal Amount (\u20b9)"
            value={emiP}
            onChange={setEmiP}
            placeholder="e.g. 500000"
            isDark={isDark}
          />
          <Field
            id="emi-r"
            label="Annual Interest Rate (%)"
            value={emiR}
            onChange={setEmiR}
            placeholder="e.g. 8.5"
            isDark={isDark}
          />
          <Field
            id="emi-n"
            label="Loan Tenure (months)"
            value={emiN}
            onChange={setEmiN}
            placeholder="e.g. 60"
            isDark={isDark}
          />
          <button
            type="button"
            data-ocid="finance.submit_button"
            className={calcBtn}
            onClick={() => setEmiResult(calcEMI(+emiP, +emiR, +emiN))}
          >
            Calculate EMI
          </button>
          {emiResult && (
            <div data-ocid="finance.success_state" className="space-y-1 pt-2">
              <ResultRow
                label="Monthly EMI"
                value={`\u20b9 ${fmt(emiResult.emi)}`}
              />
              <ResultRow
                label="Total Amount"
                value={`\u20b9 ${fmt(emiResult.total)}`}
              />
              <ResultRow
                label="Total Interest"
                value={`\u20b9 ${fmt(emiResult.interest)}`}
              />
            </div>
          )}
        </div>
      )}

      {subMode === "compound" && (
        <div className={`p-4 rounded-2xl ${glassCls} space-y-3`}>
          <p className="text-sm font-semibold">Compound Interest</p>
          <Field
            id="cp-p"
            label="Principal (\u20b9)"
            value={cpP}
            onChange={setCpP}
            placeholder="e.g. 100000"
            isDark={isDark}
          />
          <Field
            id="cp-r"
            label="Annual Rate (%)"
            value={cpR}
            onChange={setCpR}
            placeholder="e.g. 10"
            isDark={isDark}
          />
          <Field
            id="cp-t"
            label="Time (years)"
            value={cpT}
            onChange={setCpT}
            placeholder="e.g. 5"
            isDark={isDark}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="cp-f"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Compounding Frequency
            </label>
            <select
              id="cp-f"
              data-ocid="finance.select"
              className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none ${
                isDark
                  ? "bg-white/[0.08] border border-white/[0.12]"
                  : "bg-black/[0.06] border border-black/[0.10]"
              }`}
              value={cpF}
              onChange={(e) => setCpF(e.target.value)}
            >
              <option value="1">Annually (1\u00d7/year)</option>
              <option value="2">Semi-annually (2\u00d7/year)</option>
              <option value="4">Quarterly (4\u00d7/year)</option>
              <option value="12">Monthly (12\u00d7/year)</option>
              <option value="365">Daily (365\u00d7/year)</option>
            </select>
          </div>
          <button
            type="button"
            data-ocid="finance.submit_button"
            className={calcBtn}
            onClick={() => setCpResult(calcCompound(+cpP, +cpR, +cpT, +cpF))}
          >
            Calculate
          </button>
          {cpResult && (
            <div data-ocid="finance.success_state" className="space-y-1 pt-2">
              <ResultRow
                label="Total Amount"
                value={`\u20b9 ${fmt(cpResult.amount)}`}
              />
              <ResultRow
                label="Interest Earned"
                value={`\u20b9 ${fmt(cpResult.interest)}`}
              />
            </div>
          )}
        </div>
      )}

      {subMode === "gst" && (
        <div className={`p-4 rounded-2xl ${glassCls} space-y-3`}>
          <p className="text-sm font-semibold">GST Calculator</p>
          <Field
            id="gst-b"
            label="Base Price (\u20b9)"
            value={gstBase}
            onChange={setGstBase}
            placeholder="e.g. 1000"
            isDark={isDark}
          />
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">GST Rate (%)</p>
            <div className="flex gap-2 flex-wrap">
              {["5", "12", "18", "28"].map((r) => (
                <button
                  key={r}
                  type="button"
                  data-ocid="finance.button"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    gstRate === r
                      ? "accent-gradient text-white"
                      : isDark
                        ? "glass-btn"
                        : "glass-btn-light"
                  }`}
                  onClick={() => setGstRate(r)}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            data-ocid="finance.submit_button"
            className={calcBtn}
            onClick={() => setGstResult(calcGST(+gstBase, +gstRate))}
          >
            Calculate GST
          </button>
          {gstResult && (
            <div data-ocid="finance.success_state" className="space-y-1 pt-2">
              <ResultRow
                label="GST Amount"
                value={`\u20b9 ${fmt(gstResult.gst)}`}
              />
              <ResultRow
                label="Total (incl. GST)"
                value={`\u20b9 ${fmt(gstResult.total)}`}
              />
            </div>
          )}
        </div>
      )}

      {subMode === "sip" && (
        <div className={`p-4 rounded-2xl ${glassCls} space-y-3`}>
          <p className="text-sm font-semibold">SIP Calculator</p>
          <Field
            id="sip-m"
            label="Monthly Investment (\u20b9)"
            value={sipM}
            onChange={setSipM}
            placeholder="e.g. 5000"
            isDark={isDark}
          />
          <Field
            id="sip-r"
            label="Expected Return Rate (%)"
            value={sipR}
            onChange={setSipR}
            placeholder="e.g. 12"
            isDark={isDark}
          />
          <Field
            id="sip-y"
            label="Investment Period (years)"
            value={sipY}
            onChange={setSipY}
            placeholder="e.g. 10"
            isDark={isDark}
          />
          <button
            type="button"
            data-ocid="finance.submit_button"
            className={calcBtn}
            onClick={() => setSipResult(calcSIP(+sipM, +sipR, +sipY))}
          >
            Calculate SIP
          </button>
          {sipResult && (
            <div data-ocid="finance.success_state" className="space-y-1 pt-2">
              <ResultRow
                label="Maturity Amount"
                value={`\u20b9 ${fmt(sipResult.maturity)}`}
              />
              <ResultRow
                label="Total Invested"
                value={`\u20b9 ${fmt(+sipM * +sipY * 12)}`}
              />
              <ResultRow
                label="Estimated Gain"
                value={`\u20b9 ${fmt(sipResult.gain)}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
