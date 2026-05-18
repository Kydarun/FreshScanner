import { Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SubscriptionContentProps {
  onUpgrade?: () => void;
  price?: string; // Fetched from Stripe
}

export default function SubscriptionContent({ onUpgrade, price = "$2.99" }: SubscriptionContentProps) {
  const { t } = useTranslation();

  const features = [
    t('featureScans', 'Unlimited AI Freshness Scans'),
    t('featureFridge', 'Unlimited Virtual Fridge Storage'),
    t('featureAlerts', 'Smart Expiration Alerts (Coming Soon)'),
    t('featurePriority', 'Priority AI Processing')
  ];

  return (
    <div className="glass-card flex flex-col items-center gap-6 text-center p-8 w-full border-emerald-500/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/20 blur-[60px] rounded-full pointer-events-none" />

      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] z-10">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      <div className="z-10">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">FreshScan<span className="text-emerald-400">+</span></h2>
        <p className="text-slate-300 text-sm">{t('paywallSubtitle', 'Unlock the ultimate smart kitchen experience.')}</p>
      </div>

      <div className="flex flex-col gap-3 w-full text-left my-2 z-10">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-slate-200">{feature}</span>
          </div>
        ))}
      </div>

      <div className="w-full z-10 mt-2">
        <button 
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 py-4 rounded-2xl font-bold text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
        >
          {t('upgradeToPro')} - {t('pricePerMonth', { price })}
        </button>
        <p className="text-xs text-slate-500 mt-4 cursor-pointer hover:text-slate-400 transition-colors">
          {t('restorePurchases', 'Restore Purchases')}
        </p>
      </div>
    </div>
  );
}
