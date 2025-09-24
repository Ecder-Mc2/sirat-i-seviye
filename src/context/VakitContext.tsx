// Bu dosya: src/context/VakitContext.tsx
'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Vakit nesnesinin yapısını burada da tanımlayarak tutarlılığı sağlıyoruz.
interface Vakit {
    id: string;
    name: string;
    duration: number;
    start: string;
    end: string;
    activity?: string;
    detail?: string;
    progress?: number;
}

// Context'in içinde `any[]` yerine artık `Vakit[]` kullanıyoruz.
interface VakitContextType {
    allVakitlerList: Vakit[];
    setAllVakitlerList: React.Dispatch<React.SetStateAction<Vakit[]>>;
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
}

const VakitContext = createContext<VakitContextType | undefined>(undefined);

export const VakitProvider = ({ children }: { children: ReactNode }) => {
    // useState içinde de `any[]` yerine `Vakit[]` kullanıyoruz.
    const [allVakitlerList, setAllVakitlerList] = useState<Vakit[]>([]);
    const [theme, setTheme] = useState('auto'); 

    return (
        <VakitContext.Provider value={{ allVakitlerList, setAllVakitlerList, theme, setTheme }}>
            {children}
        </VakitContext.Provider>
    );
};

export const useVakitler = () => {
    const context = useContext(VakitContext);
    if (context === undefined) {
        throw new Error('useVakitler must be used within a VakitProvider');
    }
    return context;
};