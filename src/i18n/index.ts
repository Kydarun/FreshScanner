"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";

// Initialize only once
if (!i18n.isInitialized) {
  // We can try to load the initial language from localStorage if running in browser
  let initialLng = "zh-TW";
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("app_lang");
    if (saved && ["en", "zh-CN", "zh-TW"].includes(saved)) {
      initialLng = saved;
    }
  }

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        "zh-CN": { translation: zhCN },
        "zh-TW": { translation: zhTW },
      },
      lng: initialLng,
      fallbackLng: "zh-TW",
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });

  // Listen for changes to save to localStorage
  i18n.on('languageChanged', (lng) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_lang", lng);
    }
  });
}

export default i18n;
