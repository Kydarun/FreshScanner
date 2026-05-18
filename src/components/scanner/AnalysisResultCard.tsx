import { Refrigerator } from "lucide-react";
import { AnalysisResult } from "@/types";
import { STATUS_CONFIG } from "@/config/status";

interface AnalysisResultCardProps {
  analysisResult: AnalysisResult;
  onAddToFridge: () => void;
  t: (key: string) => string;
}

export default function AnalysisResultCard({ analysisResult, onAddToFridge, t }: AnalysisResultCardProps) {
  const statusConfig = STATUS_CONFIG[analysisResult.freshness_status] || STATUS_CONFIG['SPOILED'];
  const StatusIcon = statusConfig.Icon;

  return (
    <div className="glass-card flex flex-col gap-4 mt-[-4rem] relative z-10 mx-4 shadow-xl border-t border-white/10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">{analysisResult.identified_item}</h2>
          {analysisResult.specific_cut_or_part && analysisResult.specific_cut_or_part !== 'N/A' && (
            <p className="text-emerald-400 text-sm font-medium mt-1">{analysisResult.specific_cut_or_part}</p>
          )}
        </div>

        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusConfig.colorClass}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {t(`status.${analysisResult.freshness_status}`)}
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.analysis}</p>

      {analysisResult.visual_cues_detected && analysisResult.visual_cues_detected.length > 0 && (
        <div className="mt-2 pt-3 border-t border-white/10 flex flex-wrap gap-2">
          {analysisResult.visual_cues_detected.map((cue, i) => (
            <span key={i} className="bg-white/10 px-2.5 py-1 rounded-md text-xs text-slate-300 border border-white/5">{cue}</span>
          ))}
        </div>
      )}

      {/* Add to Fridge Button */}
      {analysisResult.freshness_status !== 'NOT_FOOD' && analysisResult.freshness_status !== 'UNCLEAR' && (
        <div className="mt-1 pt-3 border-t border-white/10">
          <button
            onClick={onAddToFridge}
            className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-sky-500/30"
          >
            <Refrigerator className="w-5 h-5" />
            {t('addToFridge')}
          </button>
        </div>
      )}
    </div>
  );
}
