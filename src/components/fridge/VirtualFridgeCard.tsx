import { AlertCircle, Home as HomeIcon, Snowflake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScanRecord, StorageEnvironment } from "@/types";
import { DateFormatter } from "@/utils/formatters";

interface VirtualFridgeCardProps {
  item: ScanRecord;
  onToggleStorage: (id: string, storage: StorageEnvironment) => void;
  onClick: () => void;
}

export default function VirtualFridgeCard({ item, onToggleStorage, onClick }: VirtualFridgeCardProps) {
  const { t } = useTranslation();

  const calculateExpiryDate = (timestamp: number, days: number) => {
    if (days === -1) return null;
    const expiry = new Date(timestamp);
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  };

  const currentStorage = item.current_storage || 'FRIDGE';
  const daysLeft = item.estimated_shelf_life_days?.[currentStorage as keyof typeof item.estimated_shelf_life_days] || -1;
  const expiryDate = calculateExpiryDate(item.timestamp, daysLeft);

  let isExpired = false;
  let isExpiringSoon = false;
  if (expiryDate) {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpired = diffDays < 0;
    isExpiringSoon = diffDays >= 0 && diffDays <= 2;
  }

  return (
    <div 
      className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden transition-all hover:border-emerald-500/30 cursor-pointer group" 
      onClick={onClick}
    >
      {/* Item Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{item.identified_item}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('scannedOn', { date: DateFormatter.formatDate(item.timestamp) })}</p>
        </div>
        {/* Status Badge */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${isExpired ? 'bg-red-500/20 text-red-400' : isExpiringSoon ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {isExpired ? t('fridgeStatus.expired') : isExpiringSoon ? t('fridgeStatus.expiringSoon') : t('fridgeStatus.fresh')}
        </div>
      </div>

      {/* Expiration Info */}
      <div className="text-sm font-medium">
        {daysLeft === -1 ? (
          <span className="text-red-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {t('unsafeStorage')}</span>
        ) : (
          <span className="text-slate-300">
            {t('expiresOn')} <strong className={isExpired ? 'text-red-400' : 'text-white'}>{DateFormatter.formatDate(expiryDate!.getTime())}</strong>
          </span>
        )}
      </div>

      {/* Smart Storage Toggle */}
      <div className="mt-2 bg-slate-950 rounded-xl p-1 flex items-center shadow-inner border border-white/5" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => onToggleStorage(item.id, 'PANTRY')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${currentStorage === 'PANTRY' ? 'bg-amber-900/40 text-amber-500 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <HomeIcon className="w-3.5 h-3.5" /> {t('storage.pantry')}
        </button>
        <button 
          onClick={() => onToggleStorage(item.id, 'FRIDGE')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${currentStorage === 'FRIDGE' ? 'bg-sky-900/40 text-sky-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Snowflake className="w-3.5 h-3.5" /> {t('storage.fridge')}
        </button>
        <button 
          onClick={() => onToggleStorage(item.id, 'FREEZER')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${currentStorage === 'FREEZER' ? 'bg-indigo-900/40 text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <span className="text-base leading-none">🧊</span> {t('storage.freezer')}
        </button>
      </div>
    </div>
  );
}
