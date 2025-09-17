'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, Mic, Newspaper, Share, Info, Download } from 'lucide-react';

export default function MediaDetailPageTemplate() {
  const [pageInfo, setPageInfo] = useState({title: "Yükleniyor...", icon: <Info className="mr-3 text-cyan-400" />});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const pageSlug = pathParts[pathParts.length - 1];
      
      const titleMap: { [key: string]: {title: string, icon: React.ReactNode} } = {
        'sesli-kitaplar': {title: 'Sesli Kitaplar', icon: <BookOpen className="mr-3 text-cyan-400" />},
        'videolar': {title: 'Videolar', icon: <Video className="mr-3 text-cyan-400" />},
        'podcastler': {title: 'Podcast\'ler', icon: <Mic className="mr-3 text-cyan-400" />},
        'indirilebilir': {title: 'İndirilebilir İçerikler', icon: <Download className="mr-3 text-cyan-400" />},
        'haberler': {title: 'Bizden Haberler', icon: <Newspaper className="mr-3 text-cyan-400" />},
        'paylas': {title: 'Uygulamayı Paylaş', icon: <Share className="mr-3 text-cyan-400" />},
        'hakkinda': {title: 'Hakkında', icon: <Info className="mr-3 text-cyan-400" />},
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
            <Link href="/media" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Geri
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