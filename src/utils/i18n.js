import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../languageConfig/en.json"
import vi from '../languageConfig/vi.json';

// Tạo các tệp ngôn ngữ
const resources = {
  en: { translation: en },
  vi: { translation: vi }
};

i18n
  .use(LanguageDetector) // Phát hiện ngôn ngữ của trình duyệt
  .use(initReactI18next) // Kết hợp với React
  .init({
    resources,
    fallbackLng: "en", // Ngôn ngữ mặc định
    interpolation: {
      escapeValue: false, // React đã xử lý việc escape
    }
  });

export default i18n;
