import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserRepository } from "@/services/UserRepository";
import { remoteConfig, db, functions } from "@/config/firebase";
import { getNumber } from "firebase/remote-config";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useScanHistory } from "@/hooks/useScanHistory";
import { useTranslation } from "react-i18next";

export function useSubscription() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { history } = useScanHistory();
  const queryClient = useQueryClient();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  // Auto-clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Get dynamic limits from remote config, gracefully falling back to defaults if not loaded yet
  let freeDailyScans = 5;
  let freeFridgeLimit = 1;
  if (remoteConfig) {
    const remoteScans = getNumber(remoteConfig, 'free_daily_scans');
    const remoteFridge = getNumber(remoteConfig, 'free_fridge_limit');
    if (remoteScans > 0) freeDailyScans = remoteScans;
    if (remoteFridge > 0) freeFridgeLimit = remoteFridge;
  }

  // 1. Query the User's Daily Quota
  const quotaQuery = useQuery({
    queryKey: ['userQuota', user?.uid],
    queryFn: async () => {
      if (user) {
        return await UserRepository.getCloudQuota(user.uid);
      } else {
        return UserRepository.getLocalQuota();
      }
    },
    enabled: !authLoading,
  });

  // 2. Mutation to increment the quota
  const trackScanMutation = useMutation({
    mutationFn: async (isNotFood: boolean) => {
      if (isNotFood) return; // Do not deduct quota for NOT_FOOD scans

      if (user) {
        await UserRepository.incrementCloudQuota(user.uid);
      } else {
        UserRepository.incrementLocalQuota();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuota', user?.uid] });
    }
  });

  // 3. Query the User's Stripe Subscription status
  const subscriptionQuery = useQuery({
    queryKey: ['userSubscription', user?.uid],
    queryFn: async () => {
      if (!user) return false;
      const subsRef = collection(db, "users", user.uid, "subscriptions");
      const q = query(subsRef, where("status", "in", ["trialing", "active"]));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    },
    enabled: !!user && !authLoading,
  });

  const upgrade = async () => {
    if (!user) {
      setToast({ message: t('loginRequired', 'Please log in to upgrade to Pro.'), type: 'error' });
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
      let unsubscribe: () => void;
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        if (unsubscribe) unsubscribe();
        setToast({ message: t('checkoutTimeoutError', 'Checkout portal session timed out. Please check your network or try again.'), type: 'error' });
      }, 15000);

      unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (isTimedOut) return;
          const data = snap.data();
          if (data?.url) {
            clearTimeout(timeoutId);
            unsubscribe();
            window.location.assign(data.url);
          }
          if (data?.error) {
            clearTimeout(timeoutId);
            unsubscribe();
            setToast({ message: `Checkout Error: ${data.error.message}`, type: 'error' });
          }
        },
        (error) => {
          if (isTimedOut) return;
          clearTimeout(timeoutId);
          unsubscribe();
          console.error("Checkout Snapshot Error:", error);
          setToast({ message: t('checkoutListenerError', 'Failed to load checkout portal. Please check your network or try again.'), type: 'error' });
        }
      );
    } catch (err) {
      console.error(err);
      setToast({ message: t('checkoutInitiationError', 'Failed to initiate checkout'), type: 'error' });
    }
  };

  const manageSubscription = async () => {
    if (!user) return;
    setIsManagingSubscription(true);

    try {
      const createPortalLink = httpsCallable(
        functions,
        'ext-firestore-stripe-payments-createPortalLink'
      );
      
      const response = await createPortalLink({
        returnUrl: window.location.origin,
      });
      
      const data = response.data as { url: string };
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No URL returned from billing portal creation.");
      }
    } catch (err: any) {
      console.error("Billing portal initiation error:", err);
      setIsManagingSubscription(false);
      
      // Handle the "not found" error elegantly in case instance ID is different
      let errorMsg = err.message || t('portalInitiationError', 'Failed to initiate billing portal session');
      if (err.code === 'not-found') {
        errorMsg = "Billing portal function not found. Please verify your Stripe extension instance ID is correct.";
      }
      
      setToast({ 
        message: errorMsg, 
        type: 'error' 
      });
    }
  };

  const isPro = subscriptionQuery.data || false;
  const currentCount = quotaQuery.data?.scan_count || 0;
  const scansRemaining = Math.max(0, freeDailyScans - currentCount);
  const canScan = isPro || scansRemaining > 0;

  // Calculate Virtual Fridge Usage
  const fridgeItemsCount = history.filter(item => item.in_virtual_fridge).length;
  const canAddToFridge = isPro || fridgeItemsCount < freeFridgeLimit;

  return {
    isPro,
    canScan,
    scansRemaining,
    freeDailyScans,
    canAddToFridge,
    fridgeItemsCount,
    freeFridgeLimit,
    trackScan: trackScanMutation.mutate,
    loading: quotaQuery.isLoading || authLoading,
    toast,
    setToast,
    isManagingSubscription,
    upgrade,
    manageSubscription
  };
}
