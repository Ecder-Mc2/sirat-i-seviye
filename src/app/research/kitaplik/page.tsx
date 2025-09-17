'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Search, Newspaper, Info, HelpCircle, Mail } from 'lucide-react';

export default function ResearchDetailPageTemplate() {
  const router = useRouter();
  const [pageInfo, setPageInfo] = useState({title: "Yükleniyor...", icon: <Info className="mr-3 text-cyan-400" />});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const pageSlug = pathParts[pathParts.length - 1];
      
      const titleMap: { [key: string]: {title: string, icon: React.ReactNode} } = {
        'kuran': {title: 'Kur\'an-ı Kerim', icon: <BookOpen className="mr-3 text-cyan-400" />},
        'hadis': {title: 'Hadis Külliyatı', icon: <Search className="mr-3 text-cyan-400" />},
        'tefsir': {title: 'Tefsir Kütüphanesi', icon: <Newspaper className="mr-3 text-cyan-400" />},
        'ilmihal': {title: 'İlmihal Bilgileri', icon: <Info className="mr-3 text-cyan-400" />},
        'calisma-sayfam': {title: 'Çalışma Sayfam', icon: <BookOpen className="mr-3 text-cyan-400" />},
        'kitaplik': {title: 'Kitaplık', icon: <BookOpen className="mr-3 text-cyan-400" />},
        'sss': {title: 'Sıkça Sorulan Sorular', icon: <HelpCircle className="mr-3 text-cyan-400" />},
        'soru-sor': {title: 'Soru Sor', icon: <Mail className="mr-3 text-cyan-400" />},
      };

      setPageInfo(titleMap[pageSlug] || {title: "Detay Sayfası", icon: <Info className="mr-3 text-cyan-400" />});
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
                {pageInfo.icon}
                {pageInfo.title}
            </h1>
            <button 
                onClick={() => router.push('/research')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Geri
            </button>
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