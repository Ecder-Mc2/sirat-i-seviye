import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    // YENİ EKLENEN KURAL BÖLÜMÜ
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 'any' tipinin kullanılmasına şimdilik izin ver.
      "prefer-const": "off", // 'let' yerine 'const' kullan uyarısını kapat.
      "@typescript-eslint/no-unused-vars": "warn" // Kullanılmayan değişkenleri hata değil, uyarı olarak göster.
    }
  }
];