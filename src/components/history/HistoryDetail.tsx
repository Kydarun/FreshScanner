import { useTranslation } from "react-i18next";
import { STATUS_CONFIG, FreshnessStatus } from "@/config/status";
import { DateFormatter } from "@/utils/formatters";
import { ScanRecord } from "@/types";

interface HistoryDetailProps {
  record: ScanRecord;
}

export default function HistoryDetail({ record }: HistoryDetailProps) {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG[record.freshness_status as FreshnessStatus] || STATUS_CONFIG['NOT_FOOD'];
  const StatusIcon = statusConfig.Icon;

  return (
    <>
      {record.image_url && (
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 shadow-lg shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={record.image_url} alt={record.identified_item} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="glass-card p-6 flex flex-col gap-4 border border-white/10 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-200">{record.identified_item}</h3>
            <p className="text-sm text-slate-500 mt-1">{DateFormatter.formatDateTime(record.timestamp)}</p>
            {record.specific_cut_or_part && record.specific_cut_or_part !== "N/A" && (
              <p className="text-emerald-400 text-sm font-medium mt-1">{record.specific_cut_or_part}</p>
            )}
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shrink-0 ${statusConfig.colorClass}`}>
            <StatusIcon className="w-4 h-4" />
            {t(`status.${record.freshness_status}`)}
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/10" />

        <p className="text-slate-300 text-sm leading-relaxed">{record.analysis}</p>

        {record.visual_cues_detected && record.visual_cues_detected.length > 0 && (
          <div className="mt-2 pt-4 border-t border-white/10 flex flex-wrap gap-2">
            {record.visual_cues_detected.map((cue, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                {cue}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
