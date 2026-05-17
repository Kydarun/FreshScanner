"use client";

import { useRef, useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCamera } from "@/hooks/useCamera";
import { useScanHistory } from "@/hooks/useScanHistory";
import Header from "@/components/layout/Header";
import HistoryModal from "@/components/history/HistoryModal";
import { useMutation } from "@tanstack/react-query";
import { AnalysisResult } from "@/types";
import { STATUS_CONFIG } from "@/config/status";

export default function Home() {
  const { t, i18n } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { stream, cameraError, capturedImage, capturePhoto, retakePhoto } = useCamera();
  const { addScan } = useScanHistory();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Bind the media stream to the video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const analyzeMutation = useMutation({
    mutationFn: async (payload: { imageBase64: string, language: string }) => {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }
      return res.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      addScan({
        ...data,
        timestamp: Date.now(),
        image_url: capturedImage || undefined,
      });
    },
    onError: (err) => {
      console.error(err);
      alert(t('analyzeError'));
    }
  });

  const analyzeFood = () => {
    if (capturedImage) {
      analyzeMutation.mutate({ imageBase64: capturedImage, language: i18n.language });
    }
  };

  const handleRetake = () => {
    setAnalysisResult(null);
    analyzeMutation.reset();
    retakePhoto();
  };

  const isScanning = analyzeMutation.isPending;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <div className="w-full max-w-md relative flex flex-col items-center mt-16">

        {/* Error State View */}
        {cameraError && (
          <div className="glass-card flex flex-col items-center gap-4 text-center p-8 w-full">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-slate-200">{t(cameraError)}</p>
          </div>
        )}

        {/* Live Camera View */}
        {!capturedImage && !cameraError && (
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 border-[2px] border-white/20 m-8 rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -m-[2px]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -m-[2px]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -m-[2px]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -m-[2px]" />
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center pb-safe">
              <button
                onClick={() => capturePhoto(videoRef, canvasRef)}
                className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center p-1 active:scale-95 transition-transform"
                aria-label={t('takePhoto')}
              >
                <div className="w-full h-full bg-white rounded-full" />
              </button>
            </div>
          </div>
        )}

        {/* Captured Result View */}
        {capturedImage && (
          <div className="relative w-full flex flex-col gap-6 pb-10">
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt={t('capturedFood')} className="w-full h-full object-cover" />

              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none">
                  <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[scanline_3s_linear_infinite]" />
                </div>
              )}
            </div>

            {/* AI Analysis Result Card */}
            {analysisResult && (
              <div className="glass-card flex flex-col gap-4 mt-[-4rem] relative z-10 mx-4 shadow-xl border-t border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white">{analysisResult.identified_item}</h2>
                    {analysisResult.specific_cut_or_part && analysisResult.specific_cut_or_part !== 'N/A' && (
                      <p className="text-emerald-400 text-sm font-medium mt-1">{analysisResult.specific_cut_or_part}</p>
                    )}
                  </div>

                  {(() => {
                    const statusConfig = STATUS_CONFIG[analysisResult.freshness_status] || STATUS_CONFIG['SPOILED'];
                    const StatusIcon = statusConfig.Icon;
                    return (
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusConfig.colorClass}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {t(`status.${analysisResult.freshness_status}`)}
                      </div>
                    );
                  })()}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.analysis}</p>

                {analysisResult.visual_cues_detected && analysisResult.visual_cues_detected.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    {analysisResult.visual_cues_detected.map((cue, i) => (
                      <span key={i} className="bg-white/10 px-2.5 py-1 rounded-md text-xs text-slate-300 border border-white/5">{cue}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 px-4">
              {!analysisResult ? (
                <>
                  <button
                    onClick={handleRetake}
                    disabled={isScanning}
                    className="flex-1 glass py-4 rounded-2xl font-medium text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-5 h-5" />
                    {t('retake')}
                  </button>
                  <button
                    onClick={analyzeFood}
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
                  onClick={handleRetake}
                  className="w-full glass py-4 rounded-2xl font-medium text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  {t('retake')}
                </button>
              )}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
