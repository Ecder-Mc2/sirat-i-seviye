// Bu dosya: src/app/kitaplik/[kitapId]/page.tsx
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, BookOpen } from 'lucide-react';

const firebaseConfig = { apiKey: "AIzaSyAMyZGfqkKiHgdDrWPRkp40b6UvDLgodGY", authDomain: "sirat-i-seviye.firebaseapp.com", projectId: "sirat-i-seviye", storageBucket: "sirat-i-seviye.firebasestorage.app", messagingSenderId: "683762330129", appId: "1:683762330129:web:30167dac8ab73e2747dfb0", measurementId: "G-JSGPFTQ8Z0" };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function KitapDetailPage({ params }: { params: { kitapId: string } }) {
    const [kitap, setKitap] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchKitap = async () => {
            if (params.kitapId) {
                try {
                    const kitapRef = doc(db, 'kitaplik', params.kitapId);
                    const docSnap = await getDoc(kitapRef);
                    if (docSnap.exists()) {
                        setKitap(docSnap.data());
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Kitap verisi çekilirken hata:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchKitap();
    }, [params.kitapId]);

    if (isLoading) {
        return ( <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white"><p>Kitap yükleniyor...</p></main> );
    }

    if (!kitap) {
        return ( <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white"><h1 className="text-3xl font-bold">Kitap Bulunamadı</h1><Link href="/research" className="mt-8 inline-flex bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg items-center transition-colors"><ArrowLeft size={20} className="mr-2" />Araştırma Sayfasına Dön</Link></main> );
    }

    const totalPages = kitap.content?.length || 1;

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-900 text-white">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center my-4">
                    <h1 className="text-3xl font-bold">{kitap.title}</h1>
                    <Link href="/research" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Geri
                    </Link>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400 flex items-center"><BookOpen size={24} className="mr-3" />Bölüm</h2>
                        <span className="text-sm text-gray-400">Sayfa {currentPage}/{totalPages}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-md min-h-[30vh] mb-4">
                        <p className="text-base leading-relaxed">{kitap.content[currentPage - 1]}</p>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <span className="text-sm font-semibold">Sayfa</span>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-md transition-colors font-semibold ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}