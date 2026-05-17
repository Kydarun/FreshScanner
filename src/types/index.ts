import { FreshnessStatus } from '@/config/status';

export interface AnalysisResult {
  identified_item: string;
  specific_cut_or_part: string;
  freshness_status: FreshnessStatus;
  confidence_score: number;
  analysis: string;
  visual_cues_detected: string[];
}

export interface ScanRecord extends AnalysisResult {
  id: string;
  timestamp: number;
  userId?: string;
  image_url?: string;
}
