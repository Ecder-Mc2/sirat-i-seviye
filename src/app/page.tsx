'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useVakitler } from '../context/VakitContext';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, onSnapshot, DocumentData } from 'firebase/firestore';
import { Sun, Moon, Clock, Sunrise, Sunset, Star, Wind, Settings, Search, Download, ChevronDown, BellRing, BellOff, ArrowUp } from 'lucide-react';

// === GÜVENLİ TİP TANIMLARI ===
interface Vakit {
    id: string;
    name: string;
    duration: number;
    start: string; // ISO string
    end: string;   // ISO string
    activity?: string;
    detail?: string;
    progress?: number;
}

interface VakitTanim {
    name: string;
    duration: number;
}

interface VakitDefinition extends DocumentData {
    id: string;
    referans: 'gunesBatis' | 'gunesDogus' | 'ogleVakti';
    tanimlar: VakitTanim[];
}

interface UserSettings {
    gunesDogus: string;
    ogleVakti: string;
    gunesBatis: string;
    alarms: { [key: string]: boolean };
}


// === FIREBASE YAPILANDIRMASI ===
const firebaseConfig = { apiKey: "AIzaSyAMyZGfqkKiHgdDrWPRkp40b6UvDLgodGY", authDomain: "sirat-i-seviye.firebaseapp.com", projectId: "sirat-i-seviye", storageBucket: "sirat-i-seviye.firebasestorage.app", messagingSenderId: "683762330129", appId: "1:683762330129:web:30167dac8ab73e2747dfb0", measurementId: "G-JSGPFTQ8Z0" };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// === YARDIMCI FONKSİYONLAR ===
const formatTime = (isoString: string | null): string => { if (!isoString) return '..:..'; return new Date(isoString).toTimeString().slice(0, 5); };
const formatTimeWithSeconds = (date: Date | null): string => { if (!date) return '..:..:..'; return date.toTimeString().slice(0, 8); };
const parseTime = (timeString: string | undefined): Date | null => { if (!timeString) return null; const [hours, minutes] = timeString.split(':').map(Number); const now = new Date(); now.setHours(hours, minutes, 0, 0); return now; };
const addMinutes = (date: Date | null, minutes: number): Date | null => { if (!date) return null; const newDate = new Date(date.getTime()); newDate.setMinutes(newDate.getMinutes() + minutes); return newDate; };
const formatDuration = (totalMinutes: number) => { if (typeof totalMinutes !== 'number' || totalMinutes < 0) return '00:00'; const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; };
const getVakitIcon = (vakit: Partial<Vakit>) => { if (!vakit || !vakit.name) return <Clock size={18} className="text-gray-400" />; const name = vakit.name.toLowerCase(); if (name.includes('güneşin doğuşu')) return <Sunrise size={18} className="text-yellow-500" />; if (name.includes('güneşin batışı')) return <Sunset size={18} className="text-orange-500" />; if (name.includes('leyl')) return <Moon size={18} className="text-blue-400" />; if (name.includes('zeval')) return <Sun size={18} className="text-red-500" />; if (name.includes('nefeslenmesi')) return <Wind size={18} className="text-teal-400" />; if (name.includes('fecr')) return <Star size={18} className="text-purple-400" />; return <Clock size={18} className="text-gray-400" />; };
const getHijriDate = (date: Date): string => { try { const options: Intl.DateTimeFormatOptions = { calendar: 'islamic-umalqura', day: 'numeric', month: 'long', year: 'numeric' }; return new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umalqura', options).format(date); } catch (e) { console.error(e); return "Hicri takvim alınamadı."; } };

export default function Home() {
    const { setAllVakitlerList } = useVakitler();
    const [gunesBatis, setGunesBatis] = useState('');
    const [gunesDogus, setGunesDogus] = useState('');
    const [ogleVakti, setOgleVakti] = useState('');
    const [currentVakitDetail, setCurrentVakitDetail] = useState<Vakit | null>(null);
    const [allVakitlerInternal, setAllVakitlerInternal] = useState<Vakit[]>([]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [user, setUser] = useState<User | null>(null);
    const [vakitDefinitions, setVakitDefinitions] = useState<VakitDefinition[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [expandedVakitId, setExpandedVakitId] = useState<string | null>(null);
    const [alarms, setAlarms] = useState<{ [key: string]: boolean }>({});
    const [nextVakitDetail, setNextVakitDetail] = useState<Vakit | null>(null);
    const [nextVakitCountdown, setNextVakitCountdown] = useState('');
    const activeVakitRef = useRef<HTMLDivElement>(null);
    const [activeVakitId, setActiveVakitId] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userSettingsRef = doc(db, 'users', currentUser.uid);
                const unsubSnapshot = onSnapshot(userSettingsRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const settings = docSnap.data() as UserSettings;
                        setGunesDogus(settings.gunesDogus || '06:20');
                        setOgleVakti(settings.ogleVakti || '12:55');
                        setGunesBatis(settings.gunesBatis || '19:10');
                        setAlarms(settings.alarms || {});
                    } else {
                        const defaultSettings: UserSettings = { gunesDogus: '06:20', ogleVakti: '12:55', gunesBatis: '19:10', alarms: {} };
                        setDoc(userSettingsRef, defaultSettings);
                    }
                });
                return () => unsubSnapshot();
            } else {
                signInAnonymously(auth).catch(error => console.error("Anonim giriş hatası:", error));
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchVakitTanimlari = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "vakit_tanimlari"));
                const definitions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VakitDefinition));
                setVakitDefinitions(definitions);
            } catch (error) { console.error("Ana veri çekme hatası: ", error); }
        };
        fetchVakitTanimlari();
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (vakitDefinitions.length === 0 || !gunesBatis || !gunesDogus || !ogleVakti) return;

        const referenceTimes: { [key: string]: Date | null } = { gunesBatis: parseTime(gunesBatis), gunesDogus: parseTime(gunesDogus), ogleVakti: parseTime(ogleVakti) };
        if (!referenceTimes.gunesBatis || !referenceTimes.gunesDogus || !referenceTimes.ogleVakti) return;
        
        const allCalculatedVakits: Vakit[] = [];
        vakitDefinitions.forEach(doc => {
            const refTime = referenceTimes[doc.referans];
            if (!refTime) return;

            if (doc.id.includes('_oncesi')) {
                let currentTime = new Date(refTime);
                [...doc.tanimlar].reverse().forEach((vakit: VakitTanim) => {
                    const endTime = new Date(currentTime);
                    currentTime = addMinutes(currentTime, -vakit.duration) as Date;
                    allCalculatedVakits.push({ ...vakit, id: `${doc.id}_${vakit.name}`, start: currentTime.toISOString(), end: endTime.toISOString() });
                });
            } else {
                let baslangicZamani = new Date(refTime);
                if (doc.id === 'ogle_vakti') {
                    const zevalVaktiTanimi = doc.tanimlar.find((t: VakitTanim) => t.name.includes("Zeval Vakti"));
                    const ilkSecdeTanimi = doc.tanimlar.find((t: VakitTanim) => t.name.includes("1. Secde"));
                    const ikinciSecdeTanimi = doc.tanimlar.find((t: VakitTanim) => t.name.includes("2. Secde"));
                    if (zevalVaktiTanimi) allCalculatedVakits.push({ ...zevalVaktiTanimi, id: `${doc.id}_${zevalVaktiTanimi.name}`, start: baslangicZamani.toISOString(), end: addMinutes(baslangicZamani, zevalVaktiTanimi.duration)?.toISOString() ?? '' });
                    if (ilkSecdeTanimi) allCalculatedVakits.push({ ...ilkSecdeTanimi, id: `${doc.id}_${ilkSecdeTanimi.name}`, start: addMinutes(baslangicZamani, -40)?.toISOString() ?? '', end: addMinutes(baslangicZamani, -30)?.toISOString() ?? '' });
                    if (ikinciSecdeTanimi) allCalculatedVakits.push({ ...ikinciSecdeTanimi, id: `${doc.id}_${ikinciSecdeTanimi.name}`, start: addMinutes(baslangicZamani, 5)?.toISOString() ?? '', end: addMinutes(baslangicZamani, 15)?.toISOString() ?? '' });
                } else {
                    doc.tanimlar.forEach((vakit: VakitTanim) => {
                        const startTime = new Date(baslangicZamani);
                        baslangicZamani = addMinutes(baslangicZamani, vakit.duration) as Date;
                        allCalculatedVakits.push({ ...vakit, id: `${doc.id}_${vakit.name}`, start: startTime.toISOString(), end: baslangicZamani.toISOString() });
                    });
                }
            }
        });

        const sortedVakitler = allCalculatedVakits.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setAllVakitlerInternal(sortedVakitler);
        setAllVakitlerList(sortedVakitler);

        const now = currentDateTime;
        const currentVakit = sortedVakitler.find(v => now >= new Date(v.start) && now < new Date(v.end));
        
        if (currentVakit) {
            const progress = (now.getTime() - new Date(currentVakit.start).getTime()) / (new Date(currentVakit.end).getTime() - new Date(currentVakit.start).getTime()) * 100;
            if (activeVakitId !== currentVakit.id) {
                setExpandedVakitId(null);
                setActiveVakitId(currentVakit.id);
            }
            setCurrentVakitDetail({ ...currentVakit, progress });
        } else {
            if (activeVakitId !== 'bos_vakit') {
                setActiveVakitId('bos_vakit');
            }
            const nextDefined = sortedVakitler.find(v => new Date(v.start) > now) || sortedVakitler[0];
            let prevDefinedIndex = sortedVakitler.findIndex(v => v.id === nextDefined.id) - 1;
            prevDefinedIndex = prevDefinedIndex < 0 ? sortedVakitler.length - 1 : prevDefinedIndex;
            const prevDefined = sortedVakitler[prevDefinedIndex];
            setCurrentVakitDetail({ name: "Boş Vakit", activity: "Tanımlı vakit bekleniyor...", progress: 100, id: 'bos_vakit', start: prevDefined?.end, end: nextDefined?.start, duration: 0 });
        }

        let nextVakit = sortedVakitler.find(v => new Date(v.start) > now);
        if (!nextVakit && sortedVakitler.length > 0) {
            const nextDayStart = new Date(sortedVakitler[0].start);
            nextDayStart.setDate(nextDayStart.getDate() + 1);
            nextVakit = { ...sortedVakitler[0], start: nextDayStart.toISOString() };
        }
        setNextVakitDetail(nextVakit || null);

        if (nextVakit) {
            let diffMs = new Date(nextVakit.start).getTime() - now.getTime();
            if (diffMs < 0) diffMs = 0;
            const diffHours = Math.floor(diffMs / 3600000);
            const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
            const diffSeconds = Math.floor((diffMs % 60000) / 1000);
            setNextVakitCountdown(`${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`);
        }
    }, [currentDateTime, vakitDefinitions, gunesBatis, gunesDogus, ogleVakti, setAllVakitlerList, activeVakitId]);
    
    useEffect(() => {
        if (activeVakitRef.current) {
            activeVakitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeVakitId]);

    const displayedVakitler = useMemo(() => {
        if (allVakitlerInternal.length === 0) return [];
        const now = currentDateTime;
        let startIndex = allVakitlerInternal.findIndex(v => new Date(v.start) > now);
        if (startIndex === -1) startIndex = 0; // Eğer tüm vakitler geçmişse, listenin başından başla
        return [...allVakitlerInternal.slice(startIndex), ...allVakitlerInternal.slice(0, startIndex)];
    }, [allVakitlerInternal, currentDateTime]);
    
    const toggleAlarm = async (vakitId: string) => {
        if (!user) return;
        const newAlarms = { ...alarms, [vakitId]: !alarms[vakitId] };
        setAlarms(newAlarms);
        const userSettingsRef = doc(db, 'users', user.uid);
        await setDoc(userSettingsRef, { alarms: newAlarms }, { merge: true });
    };
    
    return (
        <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-4 font-sans">
            <div className="text-center w-full max-w-2xl mt-8">
                <div className="bg-gray-800 p-4 rounded-2xl shadow-lg">
                    <h1 className="text-4xl font-bold">Sırat-ı Seviye</h1>
                    <p className="text-6xl font-mono my-3">{isClient ? formatTimeWithSeconds(currentDateTime) : '00:00:00'}</p>
                    <h2 className="text-3xl font-semibold text-cyan-400">{currentVakitDetail?.name}</h2>
                    <p className="text-lg text-gray-400 my-2">{formatTime(currentVakitDetail?.start ?? null)} - {formatTime(currentVakitDetail?.end ?? null)}</p>
                    <div className="relative w-full my-3">
                        <div className="w-full bg-black bg-opacity-20 rounded-full h-5">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-5 rounded-full" style={{ width: `${currentVakitDetail?.progress || 0}%` }}></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                            {currentVakitDetail ? `${Math.round(currentVakitDetail.progress ?? 0)}%` : '0%'}
                        </div>
                    </div>
                    <p className="text-lg">{currentVakitDetail?.activity}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 text-sm">
                        <p className="font-semibold">{currentDateTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p className="opacity-80 mt-1">{isClient ? getHijriDate(currentDateTime) : "..."}</p>
                    </div>
                </div>

                <div className="bg-gray-800 p-3 mt-4 rounded-2xl shadow-lg w-full">
                    {nextVakitDetail ? (
                        <p className="text-lg font-medium text-gray-400 text-center">
                            <ArrowUp size={20} className="inline-block mr-2 text-green-500" />
                            Sonraki: <span className="font-semibold text-white">{nextVakitDetail.name}</span>
                            <span className="ml-3 font-mono text-xl text-red-500">{nextVakitCountdown}</span>
                        </p>
                    ) : (
                        <p className="text-lg font-medium text-gray-500 text-center">Sonraki vakit hesaplanıyor...</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 my-8 w-full max-w-2xl">
                <Link href="/settings" className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-700 transition-colors"> <Settings size={28} /> <span className="text-sm font-semibold">Ayarlar</span> </Link>
                <Link href="/research" className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-700 transition-colors"> <Search size={28} /> <span className="text-sm font-semibold">Araştırma</span> </Link>
                <Link href="/media" className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-700 transition-colors"> <Download size={28} /> <span className="text-sm font-semibold">Medya</span> </Link>
            </div>
            
            <div className="w-full max-w-2xl mt-4 mb-8">
                <h3 className="text-2xl font-bold text-center mb-4">Günün Vakitleri</h3>
                <div className="space-y-2">
                    {displayedVakitler.map((vakit) => {
                        const isActive = currentVakitDetail?.id === vakit.id;
                        return (
                             <div 
                                 ref={isActive ? activeVakitRef : null}
                                 key={vakit.id} 
                                 className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isActive ? 'bg-cyan-900/50 ring-2 ring-cyan-500' : 'bg-gray-800'}`}
                             >
                                 <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setExpandedVakitId(prevId => (prevId === vakit.id ? null : vakit.id))}>
                                     <div className="flex items-center truncate flex-grow">
                                         <div className="mr-3 flex-shrink-0">{getVakitIcon(vakit)}</div>
                                         <div className="flex flex-col truncate">
                                             <span className="font-bold text-sm sm-text-base truncate">{vakit.name}</span>
                                             <span className="text-xs text-gray-400">{formatTime(vakit.start)} - {formatTime(vakit.end)} ({formatDuration(vakit.duration)})</span>
                                         </div>
                                     </div>
                                     <div className="flex items-center flex-shrink-0 pl-2">
                                         <button onClick={(e) => { e.stopPropagation(); toggleAlarm(vakit.id); }} className="p-2 rounded-full hover:bg-gray-500/20">
                                             {alarms[vakit.id] ? <BellRing size={20} className="text-green-500" /> : <BellOff size={20} className="text-gray-500" />}
                                         </button>
                                         <ChevronDown className={`transition-transform duration-300 ml-2 ${expandedVakitId === vakit.id ? 'rotate-180' : ''}`} />
                                     </div>
                                 </div>
                                 <div className={`transition-all duration-500 ease-in-out ${expandedVakitId === vakit.id ? 'max-h-[500px]' : 'max-h-0'}`}>
                                     <div className="px-4 pb-3 border-t border-gray-700 text-sm">
                                         <p className="mt-2 font-semibold">Aktivite: <span className="font-normal">{vakit.activity}</span></p>
                                         <p className="mt-1 font-semibold">Detay: <span className="font-normal text-gray-300">{vakit.detail || 'Detay bulunmuyor.'}</span></p>
                                         <div className="flex justify-end mt-3">
                                             <Link href={`/vakit/${encodeURIComponent(vakit.id)}`} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                                                 Sayfaya Git →
                                             </Link>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}