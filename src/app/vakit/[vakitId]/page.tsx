// Bu dosya: src/app/vakit/[vakitId]/page.tsx
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useVakitler } from '../../../context/VakitContext';
import { ArrowLeft, Moon, Sunrise, Sunset, Sun, Wind, Star, Clock } from 'lucide-react';

// İkon fonksiyonu
const getVakitIcon = (vakit: any) => { if (!vakit || !vakit.name) return <Clock size={24} className="text-gray-400" />; const name = vakit.name.toLowerCase(); if (name.includes('güneşin doğuşu')) return <Sunrise size={24} className="text-yellow-500" />; if (name.includes('güneşin batışı')) return <Sunset size={24} className="text-orange-500" />; if (name.includes('leyl')) return <Moon size={24} className="text-blue-400" />; if (name.includes('zeval')) return <Sun size={24} className="text-red-500" />; if (name.includes('nefeslenmesi')) return <Wind size={24} className="text-teal-400" />; if (name.includes('fecr')) return <Star size={24} className="text-purple-400" />; return <Clock size={24} className="text-gray-400" />; };

export default function VakitDetailPage({ params }: { params: { vakitId: string } }) {
    const { allVakitlerList } = useVakitler();
    const [vakitDetay, setVakitDetay] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1); // YENİ: Sayfa numarasını tutmak için
    const totalPages = 4; // Örnek sayfa sayısı

    useEffect(() => {
        if (allVakitlerList.length > 0) {
            const decodedVakitId = decodeURIComponent(params.vakitId);
            const bulunanVakit = allVakitlerList.find((v: any) => v.id === decodedVakitId);
            setVakitDetay(bulunanVakit);
        }
    }, [params.vakitId, allVakitlerList]);

    if (!vakitDetay) {
        return ( <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white"> <p>Yükleniyor...</p> </main> );
    }

    // YENİ: Kitap içeriği artık hem gerçek veriyi hem de örnek sayfaları içeriyor
    const bookContent = [
        vakitDetay.detail || "Bu vakit için henüz detaylı bir açıklama eklenmemiş.",
        "Burası Sayfa 2... Bu vakitte tefekkür etmek, insanın iç dünyasına bir pencere açar.",
        "Sayfa 3'e hoş geldiniz... Zamanın döngüsel doğası üzerine düşünelim.",
        "Ve son olarak Sayfa 4... Her bitiş, yeni bir başlangıcın habercisidir."
    ];

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-900 text-white">
            <div className="w-full max-w-2xl">
                <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="mr-3">{getVakitIcon(vakitDetay)}</div>
                        <div className="flex flex-col">
                           <span className="font-bold text-xl">{vakitDetay.name}</span>
                           <span className="text-sm text-gray-400">{vakitDetay.activity}</span>
                        </div>
                    </div>
                    <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Geri
                    </Link>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400">{vakitDetay.name} Kitabı</h2>
                        <span className="text-sm text-gray-400">Sayfa {currentPage}/{totalPages}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-md min-h-[30vh] mb-4">
                        <p className="text-base leading-relaxed">{bookContent[currentPage - 1]}</p>
                    </div>
                    {/* YENİ: Sayfa numaralandırma butonları */}
                    <div className="flex justify-center items-center space-x-2">
                        <span className="text-sm font-semibold">Sayfa</span>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-md transition-colors font-semibold ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}