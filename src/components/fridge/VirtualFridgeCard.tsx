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
      className="glass-card p-4 flex gap-4 relative overflow-hidden transition-all hover:border-emerald-500/30 cursor-pointer group" 
      onClick={onClick}
    >
      {/* Left side: Captured Food Image Thumbnail or Fallback */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/5 bg-slate-800/50 flex items-center justify-center shrink-0 shadow-md">
        {item.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={item.image_url} 
            alt={item.identified_item} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <span className="text-3xl filter drop-shadow-md">🥗</span>
        )}
        {/* Subtle overlay status indicator */}
        <div className={`absolute top-1.5 right-1.5 w-3 h-3 rounded-full border border-slate-900 shadow-md ${isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      </div>

      {/* Right side: Information and Controls */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Item Header & Info */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors truncate min-w-0">
              {item.identified_item}
            </h3>
            {/* Status Badge */}
            <div className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold shrink-0 ${
              isExpired ? 'bg-red-500/20 text-red-400' : isExpiringSoon ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isExpired ? t('fridgeStatus.expired') : isExpiringSoon ? t('fridgeStatus.expiringSoon') : t('fridgeStatus.fresh')}
            </div>
          </div>
          
          <p className="text-[11px] sm:text-xs text-slate-400 leading-none">
            {t('scannedOn', { date: DateFormatter.formatDate(item.timestamp) })}
          </p>

          <div className="text-xs sm:text-sm font-medium mt-1.5 leading-none">
            {daysLeft === -1 ? (
              <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {t('unsafeStorage')}</span>
            ) : (
              <span className="text-slate-300">
                {t('expiresOn')} <strong className={isExpired ? 'text-red-400' : 'text-white'}>{DateFormatter.formatDate(expiryDate!.getTime())}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Smart Storage Toggle */}
        <div className="mt-3 bg-slate-950 rounded-xl p-0.5 flex items-center shadow-inner border border-white/5" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onToggleStorage(item.id, 'PANTRY')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${currentStorage === 'PANTRY' ? 'bg-amber-900/40 text-amber-500 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <HomeIcon className="w-3 h-3" /> {t('storage.pantry')}
          </button>
          <button 
            onClick={() => onToggleStorage(item.id, 'FRIDGE')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${currentStorage === 'FRIDGE' ? 'bg-sky-900/40 text-sky-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Snowflake className="w-3 h-3" /> {t('storage.fridge')}
          </button>
          <button 
            onClick={() => onToggleStorage(item.id, 'FREEZER')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${currentStorage === 'FREEZER' ? 'bg-indigo-900/40 text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-xs leading-none">🧊</span> {t('storage.freezer')}
          </button>
        </div>
      </div>
    </div>
  );
}
