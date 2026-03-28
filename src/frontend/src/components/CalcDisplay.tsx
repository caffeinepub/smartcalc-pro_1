import { useApp } from "@/context/AppContext";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

interface Props {
  expression: string;
  result: string;
}

export function CalcDisplay({ expression, result }: Props) {
  const { isDark } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!result || result === "Error") return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [result]);

  const screenClass = isDark ? "calc-screen" : "calc-screen-light";

  return (
    <div
      data-ocid="calc.panel"
      className={`${screenClass} rounded-2xl px-5 py-4 mb-3 min-h-[120px] flex flex-col justify-between relative`}
    >
      <p className="text-muted-foreground text-sm text-right min-h-[20px] truncate">
        {expression || "\u00A0"}
      </p>
      <div className="flex items-end justify-between gap-2 mt-2">
        <button
          type="button"
          data-ocid="calc.copy_button"
          onClick={handleCopy}
          className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity shrink-0"
          title="Copy result"
        >
          {copied ? (
            <Check size={15} className="text-green-400" />
          ) : (
            <Copy size={15} />
          )}
        </button>
        <p
          className={`text-right font-light tracking-tight break-all leading-none ${
            result.length > 12
              ? "text-3xl"
              : result.length > 8
                ? "text-4xl"
                : "text-5xl"
          } ${
            result === "Error"
              ? "text-destructive"
              : result === "\u221e" || result === "-\u221e"
                ? "accent-text"
                : ""
          }`}
        >
          {result || "0"}
        </p>
      </div>
    </div>
  );
}
