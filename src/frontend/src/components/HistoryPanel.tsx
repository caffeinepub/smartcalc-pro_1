import { useApp } from "@/context/AppContext";
import { Clock, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const MODE_COLORS: Record<string, string> = {
  basic: "text-cyan-400",
  scientific: "text-purple-400",
  graphing: "text-green-400",
  matrix: "text-yellow-400",
  converter: "text-blue-400",
  finance: "text-orange-400",
  programmer: "text-pink-400",
};

export function HistoryPanel() {
  const {
    history,
    clearHistory,
    historyOpen,
    setHistoryOpen,
    setMode,
    setRecallExpression,
    isDark,
  } = useApp();

  const handleRecall = (expr: string, mode: string) => {
    setMode(mode as never);
    if (mode === "basic" || mode === "scientific") {
      setRecallExpression(expr.split(" [")[0]);
    }
    setHistoryOpen(false);
  };

  return (
    <AnimatePresence>
      {historyOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setHistoryOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 rounded-t-3xl ${
              isDark
                ? "bg-[oklch(0.11_0.016_230)] border-t border-white/10"
                : "bg-white border-t border-black/10"
            }`}
            style={{ maxHeight: "70vh" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className={`w-10 h-1 rounded-full ${
                  isDark ? "bg-white/20" : "bg-black/15"
                }`}
              />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="font-semibold text-sm">History</span>
                <span className="text-xs text-muted-foreground">
                  ({history.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    type="button"
                    data-ocid="history.delete_button"
                    onClick={clearHistory}
                    className="flex items-center gap-1 text-xs text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
                <button
                  type="button"
                  data-ocid="history.close_button"
                  onClick={() => setHistoryOpen(false)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? "hover:bg-white/10" : "hover:bg-black/[0.05]"
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              className="overflow-y-auto px-4 pb-6"
              style={{ maxHeight: "50vh" }}
            >
              {history.length === 0 ? (
                <div
                  data-ocid="history.empty_state"
                  className="text-center py-16 text-muted-foreground"
                >
                  <Clock size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No calculations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((entry, idx) => (
                    <button
                      key={entry.id}
                      type="button"
                      data-ocid={`history.item.${idx + 1}`}
                      onClick={() => handleRecall(entry.expression, entry.mode)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        isDark
                          ? "hover:bg-white/[0.08] bg-white/[0.04]"
                          : "hover:bg-black/[0.06] bg-black/[0.03]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.expression}
                          </p>
                          <p className="text-lg font-medium accent-text truncate">
                            {entry.result}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium uppercase mt-1 shrink-0 ${
                            MODE_COLORS[entry.mode] ?? ""
                          }`}
                        >
                          {entry.mode}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
