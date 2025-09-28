'use client';

import Link from 'next/link';
import React, { useState, useEffect, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SettingsDetailPageTemplate({ params }: { params: { slug: string } }) {
    const [title, setTitle] = useState("Yükleniyor...");
    const [content, setContent] = useState<ReactNode>(null);
    
    // URL'deki 'slug' parametresini alıyoruz (örneğin 'gunes', 'ay')
    const pageSlug = params.slug;

    useEffect(() => {
        // Başlık Haritası
        const titleMap: { [key: string]: string } = {
            'gunes': 'Güneş Ayarları Detayları',
            'ay': 'Ay Ayarları Detayları',
            'location': 'Konum Ayarları Detayları',
            'display': 'Bildirim, Tema & Dil Detayları',
            'research': 'Araştırma Ayarları Detayları',
            'media': 'Medya Ayarları Detayları',
            'register': 'Hesap Yönetimi Detayları',
            'feedback': 'Görüş Bildir Detayları',
            'guide': 'Uygulama Kılavuzu Detayları',
        };

        // İçerik Haritası
        const contentMap: { [key: string]: ReactNode } = {
            'gunes': (
                <div className="space-y-4 text-left">
                    <h2 className="text-xl font-semibold text-cyan-400">Güneş Saatleri Nedir?</h2>
                    <p className="text-gray-300">Bu referans saatleri (Doğuş, Öğle, Batış), Sırat-ı Seviye metodolojisindeki tüm diğer vakitlerin hesaplanması için temel alınan üç ana direktir. Bu saatlerin doğruluğu, gün içindeki tüm diğer vakitlerin doğruluğunu doğrudan etkiler.</p>
                    <h2 className="text-xl font-semibold text-cyan-400">Nasıl Ayarlanır?</h2>
                    <p className="text-gray-300">Saatleri, bulunduğunuz konuma göre en doğru şekilde ayarlamak için güvenilir bir astronomik takvim veya yerel namaz vakitleri takvimini referans alabilirsiniz. "Konum Ayarları" kartından bir şehir seçtiğinizde, bu saatler o şehir için önceden tanımlanmış ortalama değerlerle otomatik olarak güncellenir.</p>
                </div>
            ),
            'ay': (
                 <div className="space-y-4 text-left">
                    <h2 className="text-xl font-semibold text-cyan-400">Ay Saatleri Nedir?</h2>
                    <p className="text-gray-300">Ay referans saatleri (Doğuş, Batış), özellikle gecenin derinliğini ve manevi atmosferini anlamak için kullanılan ek göstergelerdir. Ay'ın Tepe noktası ise gecenin yarısını temsil eder.</p>
                </div>
            ),
             'register': (
                <div className="space-y-3">
                    <p className="text-center text-gray-400 mb-4">Ayarlarınızı ve notlarınızı cihazlar arasında senkronize etmek için giriş yapın veya yeni bir hesap oluşturun.</p>
                    <input type="email" placeholder="E-posta adresiniz" className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600" />
                    <input type="password" placeholder="Şifreniz" className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600" />
                    <div className="flex space-x-2">
                        <button onClick={() => alert('Giriş yapma özelliği yakında eklenecektir.')} className="flex-1 px-4 py-2 rounded-md font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">Giriş Yap</button>
                        <button onClick={() => alert('Kayıt olma özelliği yakında eklenecektir.')} className="flex-1 px-4 py-2 rounded-md font-semibold bg-gray-600 text-white hover:bg-gray-500 transition-colors">Kayıt Ol</button>
                    </div>
                </div>
            ),
            // Diğer sayfalar için varsayılan içerik
            'default': <p className="text-gray-300">Bu bölüm yakında zengin içeriklerle dolacak.</p>
        };

        setTitle(titleMap[pageSlug] || "Ayar Detayı");
        setContent(contentMap[pageSlug] || contentMap['default']);
        
    }, [pageSlug]);

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
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full mt-4">
                    {content}
                </div>
            </div>
        </main>
    );
}

