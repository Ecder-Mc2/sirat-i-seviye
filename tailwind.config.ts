import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // YENİ YAKLAŞIM: Hem özel 'sm' ayarımızı hem de standart diğer ayarları net bir şekilde tanımlıyoruz.
    screens: {
      'sm': '320px',   // Bizim özel mobil sınırımız. Artık 'sm' 320px'den başlar.
      'md': '768px',   // Tabletler için standart değer.
      'lg': '1024px',  // Laptoplar için standart değer.
      'xl': '1280px',  // Geniş ekranlar için standart değer.
      '2xl': '1536px', // Çok geniş ekranlar için standart değer.
    },
    extend: {},
  },
  plugins: [],
};
export default config;

