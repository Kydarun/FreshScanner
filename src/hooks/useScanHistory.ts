import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScanRecord } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { ScanRepository } from "@/services/ScanRepository";

export function useScanHistory() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['scanHistory', user?.uid],
    queryFn: async () => {
      if (user) {
        try {
          // Automatically sync any offline records first
          await ScanRepository.syncLocalToCloud(user.uid);
        } catch (error) {
          console.error("Failed to sync offline records. Check Firestore rules.", error);
        }
        
        try {
          // Load unified data from Firestore
          return await ScanRepository.getCloudScans(user.uid);
        } catch (error) {
          console.error("Failed to load cloud scans. Check Firestore rules.", error);
          return ScanRepository.getLocalScans();
        }
      } else {
        // Load from localStorage for Guests
        return ScanRepository.getLocalScans();
      }
    },
    enabled: !authLoading, // Only run once auth state is resolved
  });

  const addScanMutation = useMutation({
    mutationFn: async (record: Omit<ScanRecord, "id" | "userId">) => {
      if (user) {
        try {
          return await ScanRepository.addCloudScan(user.uid, record);
        } catch (error) {
          console.error("Failed to add cloud scan. Falling back to local.", error);
          const currentHistory = historyQuery.data || [];
          return ScanRepository.addLocalScan(record, currentHistory);
        }
      } else {
        const currentHistory = historyQuery.data || [];
        return ScanRepository.addLocalScan(record, currentHistory);
      }
    },
    onSuccess: () => {
      // Invalidate the cache to instantly update all components using this hook!
      queryClient.invalidateQueries({ queryKey: ['scanHistory', user?.uid] });
    }
  });

  const updateScanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<ScanRecord> }) => {
      if (user) {
        try {
          await ScanRepository.updateCloudScan(id, updates);
        } catch (error) {
          console.error("Failed to update cloud scan.", error);
          const currentHistory = historyQuery.data || [];
          ScanRepository.updateLocalScan(id, updates, currentHistory);
        }
      } else {
        const currentHistory = historyQuery.data || [];
        ScanRepository.updateLocalScan(id, updates, currentHistory);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanHistory', user?.uid] });
    }
  });

  return { 
    history: historyQuery.data || [], 
    loading: historyQuery.isLoading || authLoading, 
    addScan: addScanMutation.mutateAsync,
    updateScan: updateScanMutation.mutate
  };
}
