'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, BookOpen, Search, Newspaper, Info, HelpCircle, Mail } from 'lucide-react';

// Yeniden kullanılabilir, akıllı kart bileşenimiz
const ResearchCard = ({ title, icon, description, link, cardKey, openCard, setOpenCard }: { title: string, icon: React.ReactNode, description: string, link: string, cardKey: string, openCard: string | null, setOpenCard: (key: string | null) => void }) => {
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

export default function ResearchPage() {
    const [openCard, setOpenCard] = useState<string | null>(null);

    const researchItems = [
        { key: 'kuran', title: "Kur'an-ı Kerim", icon: <BookOpen />, description: "Kur'an-ı Kerim'i okuyun, arama yapın ve dinleyin.", link: '/research/kuran' },
        { key: 'hadis', title: "Hadis Külliyatı", icon: <Search />, description: "Güvenilir hadis kaynaklarında araştırma yapın.", link: '/research/hadis' },
        { key: 'tefsir', title: "Tefsir Kütüphanesi", icon: <Newspaper />, description: "Ayetlerin derinlemesine açıklamalarına ulaşın.", link: '/research/tefsir' },
        { key: 'ilmihal', title: "İlmihal Bilgileri", icon: <Info />, description: "Temel dini bilgilere ve pratiklere buradan ulaşın.", link: '/research/ilmihal' },
        { key: 'calisma', title: "Çalışma Sayfam", icon: <BookOpen />, description: "Kişisel notlarınızı ve tefekkürlerinizi kaydedin.", link: '/research/calisma-sayfam' },
        { key: 'kitaplik', title: "Kitaplık", icon: <BookOpen />, description: "Özel olarak hazırlanmış eserleri okuyun.", link: '/research/kitaplik' },
        { key: 'sss', title: "Sıkça Sorulan Sorular", icon: <HelpCircle />, description: "Uygulama ile ilgili sıkça sorulan sorular ve cevapları.", link: '/research/sss' },
        { key: 'sorusor', title: "Soru Sor", icon: <Mail />, description: "Merak ettiklerinizi bize sorun.", link: '/research/soru-sor' }
    ];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 p-3 rounded-lg shadow-md my-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Araştırma Merkezi</h1>
            <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Ana Ekran
            </Link>
        </div>
        
        <div className="space-y-4">
            {researchItems.map((item) => (
                <ResearchCard 
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