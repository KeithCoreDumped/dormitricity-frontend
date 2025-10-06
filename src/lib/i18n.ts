
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
// import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .use(
    resourcesToBackend((lng: string, ns: string) =>
      import(`@/locales/${lng}/${ns}.json`)
    )
  )
  // .use(LanguageDetector)
  .init({
    supportedLngs: ["en", "zh", "ja"],
    // debug: true, // 开发模式下启用调试
    defaultNS: "translation",
    fallbackLng: "zh",
    lng: "zh", // 默认使用中文
    // detection: {
    //   order: ["localStorage", "navigator"],
    //   caches: ["localStorage"],
    // },
    detection: {
      order: ["cookie", "localStorage", "navigator"],
      caches: ["cookie"],            // write user's choice to cookie
      cookieMinutes: 365 * 24 * 60,  // ~1 year
      cookieDomain: undefined,       // set if you need a parent domain
      // cookieSecure: true,            // true if your site is HTTPS (recommended)
      lookupCookie: "i18next",       // default cookie name used by the detector
    },
    // backend: {
    //   loadPath: "/locales/{{lng}}/{{ns}}.json",
    // },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
