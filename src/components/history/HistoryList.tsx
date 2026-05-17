import { useTranslation } from "react-i18next";
import { STATUS_CONFIG, FreshnessStatus } from "@/config/status";
import { DateFormatter } from "@/utils/formatters";
import { ScanRecord } from "@/types";

interface HistoryListProps {
  history: ScanRecord[];
  loading: boolean;
  onSelectRecord: (record: ScanRecord) => void;
}

export default function HistoryList({ history, loading, onSelectRecord }: HistoryListProps) {
  const { t } = useTranslation();

  if (loading) {
    return <div className="text-center text-slate-500 mt-10">{t('loading')}</div>;
  }

  if (history.length === 0) {
    return <div className="text-center text-slate-500 mt-10">{t('noHistory')}</div>;
  }

  return (
    <>
      {history.map((record) => {
        const statusConfig = STATUS_CONFIG[record.freshness_status as FreshnessStatus] || STATUS_CONFIG['NOT_FOOD'];
        const StatusIcon = statusConfig.Icon;
        const date = DateFormatter.formatDateTime(record.timestamp);

        return (
          <div
            key={record.id}
            onClick={() => onSelectRecord(record)}
            className="glass-card p-4 flex gap-4 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            {record.image_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={record.image_url} alt={record.identified_item} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-200 line-clamp-1 group-hover:text-emerald-400 transition-colors">{record.identified_item}</h3>
                  <p className="text-xs text-slate-500">{date}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${statusConfig.colorClass}`}>
                  <StatusIcon className="w-3 h-3" />
                  {t(`status.${record.freshness_status}`)}
                </div>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{record.analysis}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}
