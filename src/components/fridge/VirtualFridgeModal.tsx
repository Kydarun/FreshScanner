import { useState } from "react";
import { X, Search, Refrigerator, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScanHistory } from "@/hooks/useScanHistory";
import { StorageEnvironment, ScanRecord } from "@/types";
import VirtualFridgeCard from "./VirtualFridgeCard";
import HistoryDetail from "@/components/history/HistoryDetail";

interface VirtualFridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VirtualFridgeModal({ isOpen, onClose }: VirtualFridgeModalProps) {
  const { t } = useTranslation();
  const { history, updateScan } = useScanHistory();
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);

  if (!isOpen) return null;

  const fridgeItems = history.filter((item) => item.in_virtual_fridge);

  const handleToggleStorage = (id: string, storage: StorageEnvironment) => {
    updateScan({ id, updates: { current_storage: storage } });
  };

  const handleClose = () => {
    setSelectedRecord(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:w-full sm:max-w-md h-[85vh] sm:h-[80vh] bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col border border-slate-800 animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            {selectedRecord ? (
              <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors mr-1">
                <ArrowLeft className="w-5 h-5 text-sky-400" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                <Refrigerator className="w-5 h-5 text-sky-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white leading-none">
                {selectedRecord ? t('historyDetails') : t('virtualFridgeTitle')}
              </h2>
              {!selectedRecord && (
                <p className="text-xs text-slate-400 mt-1.5 leading-none">{t('itemsSaved', { count: fridgeItems.length })}</p>
              )}
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {selectedRecord ? (
            <HistoryDetail record={selectedRecord} />
          ) : fridgeItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-70">
              <Search className="w-12 h-12" />
              <p>{t('emptyFridge')}</p>
            </div>
          ) : (
            fridgeItems.map((item) => (
              <VirtualFridgeCard 
                key={item.id} 
                item={item} 
                onToggleStorage={handleToggleStorage} 
                onClick={() => setSelectedRecord(item)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
