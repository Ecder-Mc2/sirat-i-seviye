// Bu dosya: src/app/layout.tsx
'use client'; // Bu dosyanın tarayıcıda çalışması gerektiğini belirtiyoruz
import "./globals.css";
import { VakitProvider } from "../context/VakitContext";

// Metadata'yı bu dosyadan çıkarıp, onu kullanacak sayfalara taşıyacağız.
// Şimdilik bu basit haliyle kullanıyoruz.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      {/* VakitProvider tüm sayfaları sarmalamalı */}
      <VakitProvider>
        <body>
          {children}
        </body>
      </VakitProvider>
    </html>
  );
}