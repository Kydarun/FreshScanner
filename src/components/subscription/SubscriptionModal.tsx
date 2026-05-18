import { X } from "lucide-react";
import SubscriptionContent from "./SubscriptionContent";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  reason?: 'scan_limit' | 'fridge_limit' | null;
}

export default function SubscriptionModal({ isOpen, onClose, onUpgrade, reason = null }: SubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <SubscriptionContent onUpgrade={onUpgrade} reason={reason} />
      </div>
    </div>
  );
}
