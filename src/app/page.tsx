"use client";

import { useRef, useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useCamera } from "@/hooks/useCamera";
import { useScanHistory } from "@/hooks/useScanHistory";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import HistoryModal from "@/components/history/HistoryModal";
import VirtualFridgeModal from "@/components/fridge/VirtualFridgeModal";
import SubscriptionContent from "@/components/subscription/SubscriptionContent";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import CameraView from "@/components/scanner/CameraView";
import AnalysisResultCard from "@/components/scanner/AnalysisResultCard";
import ActionButtons from "@/components/scanner/ActionButtons";
import { useMutation } from "@tanstack/react-query";
import { AnalysisResult } from "@/types";
import { useSubscription } from "@/hooks/useSubscription";

export default function Home() {
  const { t, i18n } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();

  const { stream, cameraError, capturedImage, capturePhoto, retakePhoto } = useCamera();
  const { addScan } = useScanHistory();
  const { isPro, canScan, scansRemaining, trackScan, canAddToFridge, loading: subscriptionLoading } = useSubscription();
  const { updateScan } = useScanHistory();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFridgeOpen, setIsFridgeOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

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
    onSuccess: async (data) => {
      setAnalysisResult(data);
      const newRecord = await addScan({
        ...data,
        timestamp: Date.now(),
        image_url: capturedImage || undefined,
      });
      setCurrentScanId(newRecord?.id || null);
      trackScan(data.freshness_status === 'NOT_FOOD');
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
    setCurrentScanId(null);
    analyzeMutation.reset();
    retakePhoto();
  };

  const handleAddToFridge = () => {
    if (!currentScanId) return;
    if (!canAddToFridge) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    updateScan({ id: currentScanId, updates: { in_virtual_fridge: true, current_storage: analysisResult?.recommended_storage || 'FRIDGE' } });
    setIsFridgeOpen(true); // Automatically open fridge to show it was added!
  };

  const handleUpgrade = async () => {
    if (!user) {
      alert(t('loginRequired', 'Please log in to upgrade to Pro.'));
      return;
    }

    try {
      const checkoutRef = collection(db, 'users', user.uid, 'checkout_sessions');
      const docRef = await addDoc(checkoutRef, {
        price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_placeholder',
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

      // Listen for the extension to populate the URL
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          const data = snap.data();
          if (data?.url) {
            unsubscribe();
            window.location.assign(data.url);
          }
          if (data?.error) {
            unsubscribe();
            alert(`Checkout Error: ${data.error.message}`);
          }
        },
        (error) => {
          unsubscribe();
          console.error("Checkout Snapshot Error:", error);
          alert(t('checkoutListenerError', 'Failed to load checkout portal. Please check your network or try again.'));
        }
      );
    } catch (err) {
      console.error(err);
      alert(t('checkoutInitiationError', 'Failed to initiate checkout'));
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsManagingSubscription(true);

    try {
      const portalRef = collection(db, 'users', user.uid, 'portal_sessions');
      const docRef = await addDoc(portalRef, {
        returnUrl: window.location.origin,
      });

      // Listen for the extension to populate the URL
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          const data = snap.data();
          if (data?.url) {
            unsubscribe();
            window.location.assign(data.url);
          }
          if (data?.error) {
            unsubscribe();
            setIsManagingSubscription(false);
            alert(`Portal Error: ${data.error.message}`);
          }
        },
        (error) => {
          unsubscribe();
          setIsManagingSubscription(false);
          console.error("Portal Snapshot Error:", error);
          alert(t('portalListenerError', 'Failed to load billing portal. Please check your network or try again.'));
        }
      );
    } catch (err) {
      console.error(err);
      setIsManagingSubscription(false);
      alert(t('portalInitiationError', 'Failed to initiate billing portal session'));
    }
  };

  const isScanning = analyzeMutation.isPending;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
      <Header 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        onOpenFridge={() => setIsFridgeOpen(true)} 
        isPro={isPro}
        onManageSubscription={handleManageSubscription}
        isManagingSubscription={isManagingSubscription}
      />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <VirtualFridgeModal isOpen={isFridgeOpen} onClose={() => setIsFridgeOpen(false)} />
      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} onUpgrade={handleUpgrade} reason="fridge_limit" />

      <div className="w-full max-w-md relative flex flex-col items-center mt-20 mb-8">

        {/* Error State View */}
        {cameraError && (
          <div className="glass-card flex flex-col items-center gap-4 text-center p-8 w-full">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-slate-200">{t(cameraError)}</p>
          </div>
        )}

        {/* Live Camera View or Paywall */}
        {!capturedImage && !cameraError && (
          canScan ? (
            <CameraView videoRef={videoRef} canvasRef={canvasRef} capturePhoto={capturePhoto} t={t} />
          ) : (
            <SubscriptionContent onUpgrade={handleUpgrade} reason="scan_limit" />
          )
        )}

        {/* Captured Result View */}
        {capturedImage && (
          <div className="relative w-full flex flex-col gap-6 pb-10">
            <div className="relative w-full h-[65vh] min-h-[450px] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 shrink-0">
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
              <AnalysisResultCard
                analysisResult={analysisResult}
                onAddToFridge={handleAddToFridge}
                t={t}
              />
            )}

            {/* Action Buttons */}
            <ActionButtons
              hasResult={!!analysisResult}
              isScanning={isScanning}
              onRetake={handleRetake}
              onAnalyze={analyzeFood}
              t={t}
            />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Legal Footer for Google OAuth Compliance */}
      <div className="hidden md:block w-full text-center py-2">
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 px-4 leading-relaxed" suppressHydrationWarning>
          <strong>{t('appSubtitle', 'AI Food Quality Analyzer')}</strong><br />
          {t('appDescription', 'Point your camera at raw food or groceries to instantly evaluate freshness and shelf-life using AI.')}
        </p>
        <p className="text-xs text-slate-500" suppressHydrationWarning>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
            {t('privacyPolicy', 'Privacy Policy')}
          </a>
          {" • "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
            {t('termsOfService', 'Terms of Service')}
          </a>
        </p>
      </div>
    </main>
  );
}
