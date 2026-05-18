import { ScanLine, LogIn, LogOut, Loader2, Clock, Refrigerator, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onOpenHistory?: () => void;
  onOpenFridge?: () => void;
  isPro?: boolean;
  onManageSubscription?: () => void;
  isManagingSubscription?: boolean;
}

export default function Header({ onOpenHistory, onOpenFridge, isPro = false, onManageSubscription, isManagingSubscription = false }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { user, loading, loginWithGoogle, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {onOpenFridge && (
          <button onClick={onOpenFridge} className="text-sky-400 hover:text-sky-300 transition-colors" title="Virtual Fridge">
            <Refrigerator className="w-5 h-5" />
          </button>
        )}

        {loading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="relative overflow-hidden w-8 h-8 rounded-full border-2 border-white/20 hover:border-emerald-400 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              title={t('profile', 'Profile')}
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <p className="text-sm text-white font-medium truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                
                {isPro && onManageSubscription && (
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onManageSubscription();
                    }}
                    disabled={isManagingSubscription}
                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-slate-700/50 disabled:opacity-50"
                  >
                    {isManagingSubscription ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                    )}
                    {isManagingSubscription ? t('loadingPortal') : t('manageSubscription')}
                  </button>
                )}

                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }} 
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout', 'Logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={loginWithGoogle} className="text-white hover:text-emerald-400 transition-colors" title={t('login')}>
            <LogIn className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
