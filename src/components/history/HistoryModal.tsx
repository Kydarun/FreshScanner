import { useState } from "react";
import { X, Clock, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScanHistory } from "@/hooks/useScanHistory";
import { ScanRecord } from "@/types";
import HistoryList from "./HistoryList";
import HistoryDetail from "./HistoryDetail";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { t } = useTranslation();
  const { history, loading } = useScanHistory();
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedRecord(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2">
            {selectedRecord ? (
              <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-emerald-500" />
              </button>
            ) : (
              <Clock className="w-5 h-5 text-emerald-500" />
            )}
            <h2 className="text-xl font-bold text-white">
              {selectedRecord ? t('historyDetails') : t('history')}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {selectedRecord ? (
            <HistoryDetail
              record={history.find((r) => r.id === selectedRecord.id) || selectedRecord}
            />
          ) : (
            <HistoryList history={history} loading={loading} onSelectRecord={setSelectedRecord} />
          )}
        </div>
      </div>
    </div>
  );
}
