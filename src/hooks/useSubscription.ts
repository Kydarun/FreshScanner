import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserRepository } from "@/services/UserRepository";
import { remoteConfig, db } from "@/config/firebase";
import { getNumber } from "firebase/remote-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useScanHistory } from "@/hooks/useScanHistory";

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const { history } = useScanHistory();
  const queryClient = useQueryClient();

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
    loading: quotaQuery.isLoading || authLoading
  };
}
