import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, EyeOff } from 'lucide-react';

export const STATUS_CONFIG = {
  FRESH: {
    colorClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    Icon: CheckCircle2,
  },
  EXPIRING_SOON: {
    colorClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/50',
    Icon: AlertTriangle,
  },
  SPOILED: {
    colorClass: 'bg-red-500/20 text-red-400 border border-red-500/50',
    Icon: XCircle,
  },
  NOT_FOOD: {
    colorClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/50',
    Icon: HelpCircle,
  },
  UNCLEAR: {
    colorClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50',
    Icon: EyeOff,
  },
} as const;

export type FreshnessStatus = keyof typeof STATUS_CONFIG;
