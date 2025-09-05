'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Sun, Moon, Clock, Sunrise, Sunset, Star, Wind, Settings, ChevronDown } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAMyZGfqkKiHgdDrWPRkp40b6UvDLgodGY",
  authDomain: "sirat-i-seviye.firebaseapp.com",
  projectId: "sirat-i-seviye",
  storageBucket: "sirat-i-seviye.firebasestorage.app",
  messagingSenderId: "683762330129",
  appId: "1:683762330129:web:30167dac8ab73e2747dfb0",
  measurementId: "G-JSGPFTQ8Z0"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const formatTime = (date: Date | null): string => { if (!date) return '..:..'; return date.toTimeString().slice(0,5); };
const formatTimeWithSeconds = (date: Date | null): string => { if (!date) return '..:..:..'; return date.toTimeString().slice(0,8);};
const parseTime = (timeString: string | undefined): Date | null => { if (!timeString) return null; const [hours, minutes] = timeString.split(':').map(Number); const now = new Date(); now.setHours(hours, minutes, 0, 0); return now; };
const addMinutes = (date: Date | null, minutes: number): Date | null => { if (!date) return null; const newDate = new Date(date.getTime()); newDate.setMinutes(newDate.getMinutes() + minutes); return newDate; };
const getVakitIcon = (vakit: any) => { if (!vakit || !vakit.name) return <Clock size={18} className="text-gray-400" />; const name = vakit.name.toLowerCase(); if (name.includes('güneşin doğuşu')) return <Sunrise size={18} className="text-yellow-500" />; if (name.includes('güneşin batışı')) return <Sunset size={18} className="text-orange-500" />; if (name.includes('leyl')) return <Moon size={18} className="text-blue-400" />; if (name.includes('zeval')) return <Sun size={18} className="text-red-500" />; if (name.includes('nefeslenmesi')) return <Wind size={18} className="text-teal-400" />; if (name.includes('fecr')) return <Star size={18} className="text-purple-400" />; return <Clock size={18} className="text-gray-400" />; };

export default function Home() {
    const [gunesBatis, setGunesBatis] = useState(''); 
    const [gunesDogus, setGunesDogus] = useState(''); 
    const [ogleVakti, setOgleVakti] = useState('');   
    const [currentVakitDetail, setCurrentVakitDetail] = useState<any>({name: "Bağlanılıyor...", activity: "Lütfen bekleyin..."});
    const [allVakitlerList, setAllVakitlerList] = useState<any[]>([]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [vakitDefinitions, setVakitDefinitions] = useState<any[]>([]); // YENİ: Ham veriyi tutmak için
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        signInAnonymously(auth).catch(error => console.error("Anonim giriş hatası:", error));
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userSettingsRef = doc(db, 'users', currentUser.uid);
                const unsubSnapshot = onSnapshot(userSettingsRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const settings = docSnap.data();
                        setGunesDogus(settings.gunesDogus || '06:20');
                        setOgleVakti(settings.ogleVakti || '12:55');
                        setGunesBatis(settings.gunesBatis || '19:10');
                    } else {
                        const defaultSettings = { gunesDogus: '06:20', ogleVakti: '12:55', gunesBatis: '19:10' };
                        setDoc(userSettingsRef, defaultSettings);
                    }
                });
                return () => unsubSnapshot();
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleTimeChange = async (type: 'gunesDogus' | 'ogleVakti' | 'gunesBatis', value: string) => {
        if (!user) return;
        const userSettingsRef = doc(db, 'users', user.uid);
        await setDoc(userSettingsRef, { [type]: value }, { merge: true });
    };

    useEffect(() => {
        if (!user) return; // Kullanıcı olmadan veri çekme
        const fetchVakitTanimlari = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "vakit_tanimlari"));
                const definitions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setVakitDefinitions(definitions);
            } catch (error) {
                console.error("Ana veri çekme hatası: ", error);
            }
        };
        fetchVakitTanimlari();
    }, [user]); // Kullanıcı geldiğinde verileri çek

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
        if (vakitDefinitions.length === 0 || !gunesBatis || !gunesDogus || !ogleVakti) return; // Gerekli veriler olmadan hesaplama yapma

        const referenceTimes: { [key: string]: Date | null } = { gunesBatis: parseTime(gunesBatis), gunesDogus: parseTime(gunesDogus), ogleVakti: parseTime(ogleVakti) };
        if (!referenceTimes.gunesBatis || !referenceTimes.gunesDogus || !referenceTimes.ogleVakti) return;

        let allCalculatedVakits: any[] = [];
        vakitDefinitions.forEach(doc => {
            const refTime = referenceTimes[doc.referans];
            if (!refTime) return;
            if (doc.id.includes('_oncesi')) {
                let currentTime = new Date(refTime);
                [...doc.tanimlar].reverse().forEach((vakit: any) => {
                    const endTime = new Date(currentTime);
                    currentTime = addMinutes(currentTime, -vakit.duration) as Date;
                    allCalculatedVakits.push({ ...vakit, id: `${doc.id}_${vakit.name}`, start: currentTime, end: endTime });
                });
            } else {
                 let baslangicZamani = new Date(refTime);
                 if (doc.id === 'ogle_vakti') {
                    const zevalVaktiTanimi = doc.tanimlar.find((t:any) => t.name.includes("Zeval Vakti"));
                    const ilkSecdeTanimi = doc.tanimlar.find((t:any) => t.name.includes("1. Secde"));
                    const ikinciSecdeTanimi = doc.tanimlar.find((t:any) => t.name.includes("2. Secde"));
                    if(zevalVaktiTanimi) allCalculatedVakits.push({ ...zevalVaktiTanimi, id: `${doc.id}_${zevalVaktiTanimi.name}`, start: baslangicZamani, end: addMinutes(baslangicZamani, zevalVaktiTanimi.duration) });
                    if(ilkSecdeTanimi) allCalculatedVakits.push({ ...ilkSecdeTanimi, id: `${doc.id}_${ilkSecdeTanimi.name}`, start: addMinutes(baslangicZamani, -40), end: addMinutes(baslangicZamani, -30) });
                    if(ikinciSecdeTanimi) allCalculatedVakits.push({ ...ikinciSecdeTanimi, id: `${doc.id}_${ikinciSecdeTanimi.name}`, start: addMinutes(baslangicZamani, 5), end: addMinutes(baslangicZamani, 15) });
                }
                else {
                    doc.tanimlar.forEach((vakit: any) => {
                        const startTime = new Date(baslangicZamani);
                        baslangicZamani = addMinutes(baslangicZamani, vakit.duration) as Date;
                        allCalculatedVakits.push({ ...vakit, id: `${doc.id}_${vakit.name}`, start: startTime, end: baslangicZamani });
                    });
                }
            }
        });
        const sortedVakitler = allCalculatedVakits.sort((a, b) => a.start.getTime() - b.start.getTime());
        setAllVakitlerList(sortedVakitler);

        const now = currentDateTime; // Her saniye güncellenen state'i kullan
        let currentVakit = sortedVakitler.find(v => now >= v.start && now < v.end);
        if (currentVakit) { setCurrentVakitDetail(currentVakit); } 
        else { setCurrentVakitDetail({ name: "Boş Vakit", activity: "Tanımlı vakit bekleniyor..."}); }
    }, [currentDateTime, vakitDefinitions, gunesBatis, gunesDogus, ogleVakti]);

    return (
        <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-4">
            <div className="text-center w-full max-w-2xl mt-8">
                <h1 className="text-5xl font-bold mb-2">Sırat-ı Seviye</h1>
                <p className="text-2xl text-gray-400">{currentDateTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-6xl font-mono my-6">{isClient ? formatTimeWithSeconds(currentDateTime) : '00:00:00'}</p>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-semibold text-cyan-400">Şu Anki Vakit</h2>
                    <p className="text-4xl mt-2">{currentVakitDetail?.name}</p>
                    <p className="text-xl text-gray-300 mt-4">{currentVakitDetail?.activity}</p>
                </div>
            </div>
            <div className="w-full max-w-2xl mt-8"> <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden"> <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-full p-4 flex justify-between items-center font-semibold text-left"> <span className="flex items-center"><Settings className="mr-2" size={20} />Ayarlar</span> <ChevronDown className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} /> </button> <div className={`transition-all duration-500 ease-in-out ${isSettingsOpen ? 'max-h-96' : 'max-h-0'}`}> <div className="p-4 border-t border-gray-700 space-y-4"> <p className="text-sm text-gray-400">Hesaplamalar için referans saatleri manuel olarak ayarlayın.</p> <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> <div><label className="text-sm font-medium text-gray-300">Güneş Doğuşu</label><input type="time" className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-gray-100 border-gray-600" value={gunesDogus} onChange={(e) => handleTimeChange('gunesDogus', e.target.value)} /></div> <div><label className="text-sm font-medium text-gray-300">Öğle Vakti</label><input type="time" className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-gray-100 border-gray-600" value={ogleVakti} onChange={(e) => handleTimeChange('ogleVakti', e.target.value)} /></div> <div><label className="text-sm font-medium text-gray-300">Güneş Batışı</label><input type="time" className="w-full mt-1 p-2 border rounded-md bg-gray-700 text-gray-100 border-gray-600" value={gunesBatis} onChange={(e) => handleTimeChange('gunesBatis', e.target.value)} /></div> </div> </div> </div> </div> </div>
            <div className="w-full max-w-2xl mt-8 mb-8">
                <h3 className="text-2xl font-bold text-center mb-4">Günün Vakitleri</h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2"> {allVakitlerList.map((vakit) => ( <div key={vakit.id} className={`p-3 rounded-md flex items-center justify-between transition-all duration-300 ${currentVakitDetail?.id === vakit.id ? 'bg-cyan-800 ring-2 ring-cyan-400' : 'bg-gray-800'}`}> <div className="flex items-center"><div className="mr-3">{getVakitIcon(vakit)}</div><div><p className="font-semibold">{vakit.name}</p><p className="text-sm text-gray-400">{vakit.activity}</p></div></div><p className="font-mono text-lg">{formatTime(vakit.start)}</p> </div> ))} </div>
            </div>
        </main>
    );
}