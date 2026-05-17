import { ScanLine, LogIn, LogOut, Loader2, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onOpenHistory?: () => void;
}

export default function Header({ onOpenHistory }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { user, loading, loginWithGoogle, logout } = useAuth();

  return (
    <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
      <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
        <ScanLine className="text-emerald-500" />
        {t('appTitle')}
      </h1>
      
      <div className="flex items-center gap-4">
        <select 
          className="bg-black/50 text-white text-sm border border-white/20 rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">🇺🇸 {t('en')}</option>
          <option value="zh-CN">🇨🇳 {t('zh-CN')}</option>
          <option value="zh-TW">🇹🇼 {t('zh-TW')}</option>
        </select>

        {onOpenHistory && (
          <button onClick={onOpenHistory} className="text-white hover:text-emerald-400 transition-colors" title={t('history')}>
            <Clock className="w-5 h-5" />
          </button>
        )}

        {loading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : user ? (
          <button onClick={logout} className="text-white hover:text-red-400 transition-colors" title={t('logout')}>
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={loginWithGoogle} className="text-white hover:text-emerald-400 transition-colors" title={t('login')}>
            <LogIn className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
