'use client';
import Link from 'next/link';
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function DetailPageTemplate() {
  // Bu bölüm, sayfa başlığını URL'den otomatik olarak alır.
  // Bu sayede her sayfa için kodu değiştirmen gerekmez.
  const [title, setTitle] = React.useState("Yükleniyor...");

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const pageSlug = pathParts[pathParts.length - 1];
      const titleMap: { [key: string]: string } = {
        'gunes': 'Güneş Ayarları',
        'ay': 'Ay Ayarları',
        'location': 'Konum Ayarları',
        'display': 'Bildirim, Tema & Dil',
        'research': 'Araştırma Ayarları',
        'media': 'Medya Ayarları',
        'register': 'Kayıt Olun',
        'feedback': 'Görüş Bildir',
        'guide': 'Uygulama Kılavuzu',
      };
      setTitle(titleMap[pageSlug] || "Ayar Detayı");
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
        <div className="w-full max-w-2xl">
            <div className="bg-gray-800 p-3 rounded-lg shadow-md my-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{title}</h1>
                <Link href="/settings" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Ayarlar Menüsüne Dön
                </Link>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full mt-4 text-center">
                <p className="text-gray-300">
                    Bu bölüm yakında zengin içeriklerle dolacak.
                </p>
            </div>
        </div>
    </main>
  );
}