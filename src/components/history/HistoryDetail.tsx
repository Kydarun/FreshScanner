import { AlertCircle, Home as HomeIcon, Snowflake, Refrigerator } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScanRecord, StorageEnvironment } from "@/types";
import { DateFormatter } from "@/utils/formatters";
import { STATUS_CONFIG, FreshnessStatus } from "@/config/status";

interface StorageTrackerCardProps {
  record: ScanRecord;
  onToggleStorage?: (id: string, storage: StorageEnvironment) => void;
  onRemoveFromFridge?: (id: string) => void;
}

function StorageTrackerCard({ record, onToggleStorage, onRemoveFromFridge }: StorageTrackerCardProps) {
  const { t } = useTranslation();

  const currentStorage = record.current_storage || 'FRIDGE';
  const daysLeft = record.estimated_shelf_life_days?.[currentStorage as keyof typeof record.estimated_shelf_life_days] || -1;

  let expiryDate: Date | null = null;
  let isExpired = false;
  let isExpiringSoon = false;
  let diffDays = -1;

  if (daysLeft !== -1) {
    expiryDate = new Date(record.timestamp);
    expiryDate.setDate(expiryDate.getDate() + daysLeft);

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpired = diffDays < 0;
    isExpiringSoon = diffDays >= 0 && diffDays <= 2;
  }

  return (
    <div className="glass-card p-5 flex flex-col gap-4 border border-white/10 shrink-0 bg-slate-950/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('storageMethod')}</span>
        <div className={`px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold ${isExpired ? 'bg-red-500/20 text-red-400' : isExpiringSoon ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
          {isExpired ? t('fridgeStatus.expired') : isExpiringSoon ? t('fridgeStatus.expiringSoon') : t('fridgeStatus.fresh')}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 shrink-0">
          {currentStorage === 'PANTRY' ? (
            <HomeIcon className="w-5 h-5 text-amber-500" />
          ) : currentStorage === 'FRIDGE' ? (
            <Snowflake className="w-5 h-5 text-sky-400" />
          ) : (
            <span className="text-xl leading-none">🧊</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-100">
            {currentStorage === 'PANTRY' ? t('storage.pantry') : currentStorage === 'FRIDGE' ? t('storage.fridge') : t('storage.freezer')}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 min-w-0 leading-tight">
            {daysLeft === -1 ? (
              <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {t('unsafeStorage')}</span>
            ) : isExpired ? (
              <span className="text-red-400">{t('expiredOn')} {DateFormatter.formatDate(expiryDate!.getTime())}</span>
            ) : (
              <span className="text-slate-300">
                {t('expiresOn')} <strong className="text-white">{DateFormatter.formatDate(expiryDate!.getTime())}</strong> ({t('daysLeft', { count: diffDays })})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Direct Storage Environment Toggles */}
      {onToggleStorage && (
        <div className="mt-1 bg-slate-950 rounded-xl p-0.5 flex items-center shadow-inner border border-white/5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleStorage(record.id, 'PANTRY')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${currentStorage === 'PANTRY' ? 'bg-amber-900/40 text-amber-500 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <HomeIcon className="w-3 h-3" /> {t('storage.pantry')}
          </button>
          <button
            onClick={() => onToggleStorage(record.id, 'FRIDGE')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${currentStorage === 'FRIDGE' ? 'bg-sky-900/40 text-sky-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Snowflake className="w-3 h-3" /> {t('storage.fridge')}
          </button>
          <button
            onClick={() => onToggleStorage(record.id, 'FREEZER')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${currentStorage === 'FREEZER' ? 'bg-indigo-900/40 text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-xs leading-none">🧊</span> {t('storage.freezer')}
          </button>
        </div>
      )}

      {/* Take Out of Fridge Button */}
      {onRemoveFromFridge && (
        <button
          onClick={() => onRemoveFromFridge(record.id)}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-red-500/20 mt-1"
        >
          <Refrigerator className="w-4 h-4 shrink-0" />
          {t('takeOut', 'Take Out of Fridge')}
        </button>
      )}
    </div>
  );
}

interface ScanReportCardProps {
  record: ScanRecord;
  showScanStatus: boolean;
}

function ScanReportCard({ record, showScanStatus }: ScanReportCardProps) {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG[record.freshness_status as FreshnessStatus] || STATUS_CONFIG['NOT_FOOD'];
  const StatusIcon = statusConfig.Icon;

  return (
    <div className="glass-card p-6 flex flex-col gap-4 border border-white/10 shrink-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-slate-200">{record.identified_item}</h3>
          <p className="text-sm text-slate-500 mt-1">{DateFormatter.formatDateTime(record.timestamp)}</p>
          {record.specific_cut_or_part && record.specific_cut_or_part !== "N/A" && (
            <p className="text-emerald-400 text-sm font-medium mt-1">{record.specific_cut_or_part}</p>
          )}
        </div>
        {showScanStatus && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shrink-0 ${statusConfig.colorClass}`}>
            <StatusIcon className="w-4 h-4" />
            {t(`status.${record.freshness_status}`)}
          </div>
        )}
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
  );
}

interface HistoryDetailProps {
  record: ScanRecord;
  onToggleStorage?: (id: string, storage: StorageEnvironment) => void;
  onRemoveFromFridge?: (id: string) => void;
  showStorageDetails?: boolean;
}

export default function HistoryDetail({
  record,
  onToggleStorage,
  onRemoveFromFridge,
  showStorageDetails = false
}: HistoryDetailProps) {
  return (
    <>
      {/* 1. Raw Capture Thumbnail (Shared) */}
      {record.image_url && (
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 shadow-lg shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={record.image_url} alt={record.identified_item} className="w-full h-full object-cover" />
        </div>
      )}

      {/* 2. Expiration and Active Storage Tracker (Fridge Mode Only) */}
      {showStorageDetails && record.in_virtual_fridge && (
        <StorageTrackerCard
          record={record}
          onToggleStorage={onToggleStorage}
          onRemoveFromFridge={onRemoveFromFridge}
        />
      )}

      {/* 3. Pure AI Analysis & Visual Tag Report (Shared Presentation) */}
      <ScanReportCard
        record={record}
        showScanStatus={!showStorageDetails}
      />
    </>
  );
}
