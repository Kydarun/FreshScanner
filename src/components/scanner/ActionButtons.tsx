import { RefreshCw, Sparkles } from "lucide-react";

interface ActionButtonsProps {
  hasResult: boolean;
  isScanning: boolean;
  onRetake: () => void;
  onAnalyze: () => void;
  t: (key: string) => string;
}

export default function ActionButtons({ hasResult, isScanning, onRetake, onAnalyze, t }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 px-4">
      {!hasResult ? (
        <>
          <button
            onClick={onRetake}
            disabled={isScanning}
            className="flex-1 glass py-4 rounded-2xl font-medium text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5" />
            {t('retake')}
          </button>
          <button
            onClick={onAnalyze}
            disabled={isScanning}
            className="flex-[2] bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {t('analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t('checkFreshness')}
              </>
            )}
          </button>
        </>
      ) : (
        <button
          onClick={onRetake}
          className="w-full glass py-4 rounded-2xl font-medium text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          {t('retake')}
        </button>
      )}
    </div>
  );
}
