import { FreshnessStatus } from '@/config/status';

export type StorageEnvironment = 'PANTRY' | 'FRIDGE' | 'FREEZER' | 'N/A';

export interface ShelfLifeEstimates {
  PANTRY: number;
  FRIDGE: number;
  FREEZER: number;
}

export interface AnalysisResult {
  identified_item: string;
  specific_cut_or_part: string;
  freshness_status: FreshnessStatus;
  confidence_score: number;
  analysis: string;
  visual_cues_detected: string[];
  recommended_storage: StorageEnvironment;
  estimated_shelf_life_days: ShelfLifeEstimates;
}

export interface ScanRecord extends AnalysisResult {
  id: string;
  timestamp: number;
  userId?: string;
  image_url?: string;
  in_virtual_fridge?: boolean;
  current_storage?: StorageEnvironment;
}
