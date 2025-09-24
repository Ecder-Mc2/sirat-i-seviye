'use client';

import Link from 'next/link';
import React, { useState, useEffect, ReactElement } from 'react';
import { ArrowLeft, BookOpen, Info } from 'lucide-react'; 

export default function SssPage() { 
    const [pageInfo, setPageInfo] = useState<{ title: string; icon: ReactElement }>({
        title: "Yükleniyor...",
        icon: <Info className="mr-3 text-cyan-400" />
    });

    useEffect(() => {
        setPageInfo({ title: 'Sıkça Sorulan Sorular', icon: <BookOpen className="mr-3 text-cyan-400" /> });
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
            <div className="w-full max-w-2xl">
                <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center">
                        {pageInfo.icon}
                        {pageInfo.title}
                    </h1>
                    <Link href="/research" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
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