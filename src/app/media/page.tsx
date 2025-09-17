'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, BookOpen, Video, Mic, Newspaper, Share, Info, Download } from 'lucide-react';

// Kart bileşeni aynı kalıyor
const MediaCard = ({ title, icon, description, link, cardKey, openCard, setOpenCard }: { title: string, icon: React.ReactNode, description: string, link: string, cardKey: string, openCard: string | null, setOpenCard: (key: string | null) => void }) => {
    const isOpen = openCard === cardKey;
    return (
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button 
                onClick={() => setOpenCard(isOpen ? null : cardKey)}
                className="w-full p-4 flex justify-between items-center font-semibold text-left"
            >
                <span className="flex items-center">
                    {icon}
                    <span className="ml-3">{title}</span>
                </span>
                <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="px-4 pb-4 border-t border-gray-700">
                    <div className="pt-4 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">{description}</p>
                        <Link href={link} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex-shrink-0 ml-4">
                            Sayfaya Git →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MediaPage() {
    const [openCard, setOpenCard] = useState<string | null>(null);

    const mediaItems = [
        { key: 'sesli', title: 'Sesli Kitaplar', icon: <BookOpen />, description: 'Manevi ve kültürel eserleri dinleyerek yolculuğunuza derinlik katın.', link: '/media/sesli-kitaplar' },
        { key: 'video', title: 'Videolar', icon: <Video />, description: 'İlham verici sohbetler, belgeseller ve görsel içeriklerle tefekkür edin.', link: '/media/videolar' },
        { key: 'podcast', title: 'Podcast\'ler', icon: <Mic />, description: 'Alanında uzman isimlerden manevi sohbetler ve dersler dinleyin.', link: '/media/podcastler' },
        { key: 'indir', title: 'İndirilebilir İçerikler', icon: <Download />, description: 'Çevrimdışı erişim için PDF, resim ve diğer materyallere ulaşın.', link: '/media/indirilebilir' },
        { key: 'haberler', title: 'Bizden Haberler', icon: <Newspaper />, description: 'Sırat-ı Seviye ile ilgili son güncellemeler, duyurular ve makaleler.', link: '/media/haberler' },
        { key: 'paylas', title: 'Uygulamayı Paylaş', icon: <Share />, description: 'Bu yolculuğu sevdiklerinizle paylaşarak projemizin büyümesine destek olabilirsiniz.', link: '/media/paylas' },
        { key: 'hakkinda', title: 'Hakkında', icon: <Info />, description: 'Projenin misyonu, vizyonu ve gelecek hedefleri hakkında daha fazla bilgi edinin.', link: '/media/hakkinda' },
    ];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl">
        {/* DÜZELTME: Başlık ve Geri Butonu artık şık bir kart içinde */}
        <div className="bg-gray-800 p-3 rounded-lg shadow-md my-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Medya Kütüphanesi</h1>
            <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Ana Ekran
            </Link>
        </div>
        
        <div className="space-y-4">
            {mediaItems.map((item) => (
                <MediaCard 
                    key={item.key} 
                    title={item.title} 
                    icon={item.icon} 
                    description={item.description} 
                    link={item.link}
                    cardKey={item.key}
                    openCard={openCard}
                    setOpenCard={setOpenCard}
                />
            ))}
        </div>
      </div>
    </main>
  );
}