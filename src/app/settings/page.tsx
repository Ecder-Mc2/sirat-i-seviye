'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'; // signInAnonymously kaldırıldı (kullanılmıyordu)
import { getFirestore, doc, setDoc, onSnapshot, DocumentData } from 'firebase/firestore';
import { ArrowLeft, Globe, ChevronDown, Book, Settings as SettingsIcon, UserPlus, MessageSquare, HelpCircle, Film, Sunrise, Moon } from 'lucide-react'; // Kullanılmayan iconlar kaldırıldı

// DÜZELTME: Firestore'dan gelen kullanıcı ayarları için bir tip tanımı oluşturuldu.
interface UserSettings extends DocumentData {
    gunesDogus?: string;
    ogleVakti?: string;
    gunesBatis?: string;
    ayDogus?: string;
    ayBatis?: string;
    theme?: string;
    language?: string;
    selectedCity?: string;
}

const firebaseConfig = { apiKey: "AIzaSyAMyZGfqkKiHgdDrWPRkp40b6UvDLgodGY", authDomain: "sirat-i-seviye.firebaseapp.com", projectId: "sirat-i-seviye", storageBucket: "sirat-i-seviye.firebasestorage.app", messagingSenderId: "683762330129", appId: "1:683762330129:web:30167dac8ab73e2747dfb0", measurementId: "G-JSGPFTQ8Z0" };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// CITIES kullanılmadığı için kaldırıldı.

const SettingsCard = ({ title, icon, cardKey, openCard, setOpenCard, children }: { title: string, icon:React.ReactNode, cardKey: string, openCard: string | null, setOpenCard: (key: string | null) => void, children: React.ReactNode }) => {
    const isOpen = openCard === cardKey;
    return (
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button
                onClick={() => setOpenCard(isOpen ? null : cardKey)}
                className="w-full p-4 flex justify-between items-center font-semibold text-left"
            >
                <span className="flex items-center">{icon}<span className="ml-3">{title}</span></span>
                <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="px-4 pb-4 border-t border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PlaceholderCardContent = ({ text, link }: { text: string, link: string }) => (
    <div className="pt-4 flex items-center justify-between">
        <p className="text-gray-400 text-sm">{text}</p>
        <Link href={link} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex-shrink-0 ml-4">
            Sayfaya Git →
        </Link>
    </div>
);

export default function SettingsPage() {
    const [gunesBatis, setGunesBatis] = useState('');
    const [gunesDogus, setGunesDogus] = useState('');
    const [ogleVakti, setOgleVakti] = useState('');
    const [ayDogus, setAyDogus] = useState('');
    const [ayBatis, setAyBatis] = useState('');
    // const [theme, setTheme] = useState('auto'); // Bu değişkenler kullanılmadığı için uyarılara neden oluyordu, yorum satırına alındı
    // const [language, setLanguage] = useState('TR');
    const [user, setUser] = useState<User | null>(null);
    const [openCard, setOpenCard] = useState<string | null>(null);
    // const [selectedCity, setSelectedCity] = useState('');
    // const [apiMessage, setApiMessage] = useState('');

    const ayTepe = useMemo(() => {
        if (!ayDogus || !ayBatis) return '--:--';
        try {
            const [riseH, riseM] = ayDogus.split(':').map(Number);
            const [setH, setM] = ayBatis.split(':').map(Number);
            // DÜZELTME: 'let' yerine 'const' kullanıldı.
            const riseDate = new Date(); riseDate.setHours(riseH, riseM, 0, 0);
            const setDate = new Date(); setDate.setHours(setH, setM, 0, 0);
            if (setDate < riseDate) { setDate.setDate(setDate.getDate() + 1); }
            const diff = setDate.getTime() - riseDate.getTime();
            const midDate = new Date(riseDate.getTime() + diff / 2);
            return `${String(midDate.getHours()).padStart(2, '0')}:${String(midDate.getMinutes()).padStart(2, '0')}`;
        } catch (e) { return '--:--'; }
    }, [ayDogus, ayBatis]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userSettingsRef = doc(db, 'users', currentUser.uid);
                onSnapshot(userSettingsRef, (docSnap) => {
                    if (docSnap.exists()) {
                        // DÜZELTME: Gelen veriye UserSettings tipi atandı.
                        const settings: UserSettings = docSnap.data();
                        setGunesDogus(settings.gunesDogus || '06:20');
                        setOgleVakti(settings.ogleVakti || '12:55');
                        setGunesBatis(settings.gunesBatis || '19:10');
                        setAyDogus(settings.ayDogus || '18:30');
                        setAyBatis(settings.ayBatis || '05:45');
                        // setTheme(settings.theme || 'auto');
                        // setLanguage(settings.language || 'TR');
                        // setSelectedCity(settings.selectedCity || '');
                    }
                });
            }
        });
        return () => unsubscribe();
    }, []);

    // handleSettingChange fonksiyonu kullanılmadığı için uyarı veriyordu, şimdilik kaldırıldı.
    // İleride kullanılacaksa tekrar eklenebilir.
    /*
    const handleSettingChange = async (settingKey: string, value: string) => {
        if (!user) return;
        const userSettingsRef = doc(db, 'users', user.uid);
        // DÜZELTME: 'updates' objesi için daha belirli bir tip kullanıldı ve 'const' yapıldı.
        const updates: { [key: string]: string } = { [settingKey]: value };
        if (['gunesDogus', 'ogleVakti', 'gunesBatis', 'ayDogus', 'ayBatis'].includes(settingKey)) {
            updates.selectedCity = '';
        }
        await setDoc(userSettingsRef, updates, { merge: true });
    };
    */

 return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 p-3 rounded-lg shadow-md my-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Ayarlar Ekranı</h1>
            <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Ana Ekran
            </Link>
        </div>
        
        <div className="space-y-4">
            <SettingsCard title="Güneş Referans Saatleri" icon={<Sunrise />} cardKey="sun" openCard={openCard} setOpenCard={setOpenCard}>
                 <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div> <label className="text-sm font-medium text-gray-300">Doğuş</label> <input type="time" className="w-full mt-1 p-2 border rounded-md bg-gray-700" value={gunesDogus} readOnly /> </div>
                    <div> <label className="text-sm font-medium text-gray-300">Öğle</label> <input type="time" className="w-full p-2 border rounded-md bg-gray-700" value={ogleVakti} readOnly /> </div>
                    <div> <label className="text-sm font-medium text-gray-300">Batış</label> <input type="time" className="w-full p-2 border rounded-md bg-gray-700" value={gunesBatis} readOnly /> </div>
                </div>
                 <PlaceholderCardContent text="Güneş saatlerinin detaylı açıklamaları." link="/settings/gunes" />
            </SettingsCard>
            <SettingsCard title="Ay Referans Saatleri" icon={<Moon />} cardKey="moon" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div><label className="text-sm font-medium text-gray-300">Doğuş</label><input type="time" className="w-full mt-1 p-2 border rounded-md bg-gray-700" value={ayDogus} readOnly /></div>
                    <div><label className="text-sm font-medium text-gray-300">Tepe</label><input type="time" className="w-full p-2 border rounded-md bg-gray-900 text-gray-400" value={ayTepe} readOnly /></div>
                    <div><label className="text-sm font-medium text-gray-300">Batış</label><input type="time" className="w-full p-2 border rounded-md bg-gray-700" value={ayBatis} readOnly /></div>
                </div>
                <PlaceholderCardContent text="Ay saatlerinin detaylı açıklamaları." link="/settings/ay" />
            </SettingsCard>
            <SettingsCard title="Konum Ayarları" icon={<Globe />} cardKey="location" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Saatleri, seçtiğiniz şehre göre anlık olarak güncelleyin." link="/settings/location" /></SettingsCard>
            <SettingsCard title="Bildirim, Tema & Dil" icon={<SettingsIcon />} cardKey="display" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Uygulama görünümünü ve dilini özelleştirin." link="/settings/display" /></SettingsCard>
            <SettingsCard title="Araştırma Ayarları" icon={<Book />} cardKey="research" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Araştırma merkezi için varsayılanları ayarlayın." link="/settings/research" /></SettingsCard>
            <SettingsCard title="Medya Ayarları" icon={<Film />} cardKey="media" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Medya kütüphanesi için tercihlerinizi belirleyin." link="/settings/media" /></SettingsCard>
            <SettingsCard title="Kayıt Olun" icon={<UserPlus />} cardKey="register" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Ayarlarınızı birden fazla cihazda senkronize edin." link="/settings/register" /></Settings-Card>
            <SettingsCard title="Görüş Bildir" icon={<MessageSquare />} cardKey="feedback" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Uygulama hakkındaki görüşlerinizi bizimle paylaşın." link="/settings/feedback" /></SettingsCard>
            <SettingsCard title="Uygulama Kılavuzu" icon={<HelpCircle />} cardKey="guide" openCard={openCard} setOpenCard={setOpenCard}><PlaceholderCardContent text="Uygulamanın tüm özelliklerini ve kartların kullanımını öğrenin." link="/settings/guide" /></SettingsCard>
        </div>
      </div>
    </main>
 );
}