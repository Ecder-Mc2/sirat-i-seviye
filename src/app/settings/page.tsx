'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'; 
import { getFirestore, doc, setDoc, onSnapshot, DocumentData } from 'firebase/firestore';
import { ArrowLeft, Globe, ChevronDown, Book, Settings as SettingsIcon, UserPlus, MessageSquare, HelpCircle, Film, Sunrise, Moon, Edit, Bug, Lightbulb, SlidersHorizontal } from 'lucide-react'; 

// === PROTOTİPTEN GELEN SABİT VERİLER ===
const CITY_PRAYER_TIMES: { [key: string]: { gunesDogus: string; ogleVakti: string; gunesBatis: string; ayDogus: string; ayBatis: string; } } = { 
    'ankara': { gunesDogus: '06:15', ogleVakti: '12:52', gunesBatis: '19:30', ayDogus: '18:30', ayBatis: '05:45' }, 
    'istanbul': { gunesDogus: '06:25', ogleVakti: '13:05', gunesBatis: '19:45', ayDogus: '18:45', ayBatis: '06:00' }, 
};

// === GÜVENLİ TİP TANIMLARI ===
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

// === FIREBASE YAPILANDIRMASI ===
const firebaseConfig = { apiKey: "AIzaSyAMyZGfqkKiHgdDrWPRkp40b6UvDLgodGY", authDomain: "sirat-i-seviye.firebaseapp.com", projectId: "sirat-i-seviye", storageBucket: "sirat-i-seviye.firebasestorage.app", messagingSenderId: "683762330129", appId: "1:683762330129:web:30167dac8ab73e2747dfb0", measurementId: "G-JSGPFTQ8Z0" };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// === YARDIMCI BİLEŞENLER ===
const CustomTimePicker = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => {
    return (
        <div className="text-center">
            <label className="text-xs font-medium text-gray-400">{label}</label>
            <input 
                type="time" 
                className="w-full mt-1 p-1 border rounded-md bg-gray-700 text-gray-100 border-gray-600" 
                value={value || "00:00"} 
                onChange={(e) => onChange(e.target.value)} 
            />
        </div>
    );
};

const SettingsCard = ({ title, icon, cardKey, openCard, setOpenCard, children }: { title: string, icon:ReactNode, cardKey: string, openCard: string | null, setOpenCard: (key: string | null) => void, children: ReactNode }) => {
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
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] overflow-hidden' : 'max-h-0 overflow-hidden'}`}>
                <div className="p-4 border-t border-gray-700">
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

// === ANA AYARLAR SAYFASI BİLEŞENİ ===
export default function SettingsPage() {
    const [gunesBatis, setGunesBatis] = useState('');
    const [gunesDogus, setGunesDogus] = useState('');
    const [ogleVakti, setOgleVakti] = useState('');
    const [ayDogus, setAyDogus] = useState('');
    const [ayBatis, setAyBatis] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [openCard, setOpenCard] = useState<string | null>(null);

    const [theme, setTheme] = useState('auto');
    const [language, setLanguage] = useState('TR');
    const [selectedCity, setSelectedCity] = useState('ankara');
    const [message, setMessage] = useState('');

    const ayTepe = useMemo(() => {
        if (!ayDogus || !ayBatis) return '--:--';
        try {
            const [riseH, riseM] = ayDogus.split(':').map(Number);
            const [setH, setM] = ayBatis.split(':').map(Number);
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
                        const settings = docSnap.data() as UserSettings;
                        setGunesDogus(settings.gunesDogus || '06:20');
                        setOgleVakti(settings.ogleVakti || '12:55');
                        setGunesBatis(settings.gunesBatis || '19:10');
                        setAyDogus(settings.ayDogus || '18:30');
                        setAyBatis(settings.ayBatis || '05:45');
                        setTheme(settings.theme || 'auto');
                        setLanguage(settings.language || 'TR');
                        setSelectedCity(settings.selectedCity || 'ankara');
                    } else {
                        const defaultSettings = { gunesDogus: '06:20', ogleVakti: '12:55', gunesBatis: '19:10', ayDogus: '18:30', ayBatis: '05:45', theme: 'auto', language: 'TR', selectedCity: 'ankara' };
                        setDoc(userSettingsRef, defaultSettings);
                    }
                });
            }
        });
        return () => unsubscribe();
    }, []);
    
    const handleSettingSave = async (settingsToUpdate: Partial<UserSettings>) => {
        if (!user) {
            setMessage("Ayarları kaydetmek için kullanıcı girişi gereklidir.");
            return;
        }
        const userSettingsRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userSettingsRef, settingsToUpdate, { merge: true });
            setMessage("Ayarlar başarıyla kaydedildi!");
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Ayar kaydetme hatası:", error);
            setMessage("Ayarlar kaydedilirken bir hata oluştu.");
        }
    };
    
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value;
        const times = CITY_PRAYER_TIMES[city];
        if (times) {
            const newSettings = { ...times, selectedCity: city };
            setGunesDogus(times.gunesDogus);
            setGunesBatis(times.gunesBatis);
            setOgleVakti(times.ogleVakti);
            setAyDogus(times.ayDogus);
            setAyBatis(times.ayBatis);
            setSelectedCity(city);
            handleSettingSave(newSettings);
        }
    };

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
        
        {message && (
            <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-2 rounded-lg relative mb-4 text-center" role="alert">
                <span className="block sm:inline">{message}</span>
            </div>
        )}

        <div className="space-y-2">
            <SettingsCard title="Ana Ekran Ayarları" icon={<SettingsIcon />} cardKey="mainScreen" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Ekran Kartı Görünümü</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Detaylı</option>
                            <option>Minimalist</option>
                            <option>Grafiksel</option>
                        </select>
                    </div>
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Vakit Kartı Stili</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Genişletilmiş</option>
                            <option>Kompakt</option>
                        </select>
                    </div>
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Sonraki Vakit Sayacı</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Göster</option>
                            <option>Gizle</option>
                        </select>
                    </div>
                </div>
                <PlaceholderCardContent text="Ana ekrandaki görsel ve fonksiyonel tercihleri yönetin." link="/settings/main-screen" />
            </SettingsCard>
             <SettingsCard title="Vakit Kartları Ayarları" icon={<SlidersHorizontal />} cardKey="vakitCards" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Varsayılan Görünüm</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Kapalı</option>
                            <option>Açık</option>
                        </select>
                    </div>
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Gösterilecek Bilgi</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Aktivite + Detay</option>
                            <option>Sadece Aktivite</option>
                        </select>
                    </div>
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Alarm Sesi</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Varsayılan</option>
                            <option>Sessiz</option>
                        </select>
                    </div>
                </div>
                <PlaceholderCardContent text="Ana ekrandaki vakit listesi kartlarının davranışını ve içeriğini kişiselleştirin." link="/settings/vakit-cards" />
            </SettingsCard>
            <SettingsCard title="Güneş Referans Saatleri" icon={<Sunrise />} cardKey="sun" openCard={openCard} setOpenCard={setOpenCard}>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <CustomTimePicker label="Güneş Batışı" value={gunesBatis} onChange={(val) => { setGunesBatis(val); handleSettingSave({ gunesBatis: val, selectedCity: '' }) }} />
                     <CustomTimePicker label="Güneş Doğuşu" value={gunesDogus} onChange={(val) => { setGunesDogus(val); handleSettingSave({ gunesDogus: val, selectedCity: '' }) }} />
                     <CustomTimePicker label="Öğle Vakti" value={ogleVakti} onChange={(val) => { setOgleVakti(val); handleSettingSave({ ogleVakti: val, selectedCity: '' }) }} />
                </div>
                <PlaceholderCardContent text="Güneş saatlerinin detaylı açıklamaları." link="/settings/gunes" />
            </SettingsCard>
            <SettingsCard title="Ay Referans Saatleri" icon={<Moon />} cardKey="moon" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <CustomTimePicker label="Ay Batışı" value={ayBatis} onChange={(val) => { setAyBatis(val); handleSettingSave({ ayBatis: val, selectedCity: '' }) }} />
                     <CustomTimePicker label="Ay Doğuşu" value={ayDogus} onChange={(val) => { setAyDogus(val); handleSettingSave({ ayDogus: val, selectedCity: '' }) }} />
                     <div className="text-center">
                        <label className="text-xs font-medium text-gray-400">Ay Tepe</label>
                        <input type="time" className="w-full mt-1 p-1 border rounded-md bg-gray-800 text-gray-400 border-gray-600" value={ayTepe} readOnly />
                     </div>
                </div>
                <PlaceholderCardContent text="Ay saatlerinin detaylı açıklamaları." link="/settings/ay" />
            </SettingsCard>
            <SettingsCard title="Konum Ayarları" icon={<Globe />} cardKey="location" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div>
                        <label className="text-xs font-medium text-gray-400">Konum</label>
                        <select defaultValue="auto" className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600" onChange={(e) => { if (e.target.value === 'auto') setMessage('Otomatik konum bulma özelliği yakında eklenecektir.'); }}>
                            <option value="" disabled>Seçenekler</option>
                            <option value="auto">Otomatik Bul</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400">Şehir/İlçe Ara</label>
                        <select defaultValue="" className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option value="" disabled>Şehir Ara...</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400">Listeden Seç</label>
                        <select value={selectedCity} onChange={handleCityChange} className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            {Object.keys(CITY_PRAYER_TIMES).map(city => (<option key={city} value={city}>{city.charAt(0).toUpperCase() + city.slice(1)}</option>))}
                        </select>
                    </div>
                </div>
                <PlaceholderCardContent text="Saatleri, seçtiğiniz şehre göre anlık olarak güncelleyin." link="/settings/location" />
            </SettingsCard>
            <SettingsCard title="Bildirim, Tema & Dil" icon={<SettingsIcon />} cardKey="display" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Vakit Bildirim</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option value="true">Aç</option>
                            <option value="false">Kapa</option>
                        </select>
                    </div>
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Tema Seç</label>
                        <select value={theme} onChange={(e) => { setTheme(e.target.value); handleSettingSave({ theme: e.target.value }) }} className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option value="auto">Oto</option>
                            <option value="light">Açık</option>
                            <option value="dark">Koyu</option>
                        </select>
                    </div>
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Dil Seç</label>
                        <select value={language} onChange={(e) => { setLanguage(e.target.value); handleSettingSave({ language: e.target.value }) }} className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option value="TR">TR</option>
                            <option value="EN">EN</option>
                        </select>
                    </div>
                </div>
                <PlaceholderCardContent text="Uygulama görünümünü ve dilini özelleştirin." link="/settings/display" />
            </SettingsCard>
            <SettingsCard title="Araştırma Ayarları" icon={<Book />} cardKey="research" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Varsayılan Kaynak</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Kur'an</option>
                            <option>Hadis</option>
                        </select>
                    </div>
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Yazı Tipi Boyutu</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Küçük</option>
                            <option>Normal</option>
                            <option>Büyük</option>
                        </select>
                    </div>
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Arama Geçmişi</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Açık</option>
                            <option>Kapalı</option>
                        </select>
                    </div>
                </div>
                <PlaceholderCardContent text="Araştırma merkezi için varsayılanları ayarlayın." link="/settings/research" />
            </SettingsCard>
            <SettingsCard title="Medya Ayarları" icon={<Film />} cardKey="media" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Video Kalitesi</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Otomatik</option>
                            <option>720p</option>
                            <option>1080p</option>
                        </select>
                    </div>
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">Otomatik Oynatma</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Açık</option>
                            <option>Kapalı</option>
                        </select>
                    </div>
                     <div className="inline-block">
                        <label className="text-xs font-medium text-gray-400">İndirme Konumu</label>
                        <select className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-white border-gray-600">
                            <option>Dahili</option>
                            <option>SD Kart</option>
                        </select>
                    </div>
                </div>
                <PlaceholderCardContent text="Medya kütüphanesi için tercihlerinizi belirleyin." link="/settings/media" />
            </SettingsCard>
            <SettingsCard title="Hesap Yönetimi" icon={<UserPlus />} cardKey="account" openCard={openCard} setOpenCard={setOpenCard}>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600">Giriş Yap</button>
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600">Kayıt Ol</button>
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600">Profilim</button>
                </div>
                <PlaceholderCardContent text="Uygulamaya üye olmak veya giriş yapmak için kullanılır." link="/settings/register" />
            </SettingsCard>
            <SettingsCard title="Görüş Bildir" icon={<MessageSquare />} cardKey="feedback" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600 flex items-center justify-center"><Lightbulb size={14} className="mr-1"/> Öneri Sun</button>
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600 flex items-center justify-center"><Bug size={14} className="mr-1"/> Hata Bildir</button>
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600 flex items-center justify-center"><Edit size={14} className="mr-1"/> Genel Görüş</button>
                </div>
                <PlaceholderCardContent text="Uygulamanın gelişimine katkıda bulunmak için kullanılır." link="/settings/feedback" />
            </SettingsCard>
            <SettingsCard title="Uygulama Kılavuzu" icon={<HelpCircle />} cardKey="guide" openCard={openCard} setOpenCard={setOpenCard}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600">Ana Ekran</button>
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600">Ayarlar</button>
                    <button className="p-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600">Diğer</button>
                </div>
                <PlaceholderCardContent text="Uygulamanın tüm özelliklerini ve kartların kullanımını öğrenin." link="/settings/guide" />
            </SettingsCard>
        </div>
      </div>
    </main>
 );
}

