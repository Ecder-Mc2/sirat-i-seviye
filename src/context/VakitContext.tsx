// Bu dosya: src/context/VakitContext.tsx
'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Context'in içinde artık tema bilgisi de var
interface VakitContextType {
    allVakitlerList: any[];
    setAllVakitlerList: React.Dispatch<React.SetStateAction<any[]>>;
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
}

const VakitContext = createContext<VakitContextType | undefined>(undefined);

export const VakitProvider = ({ children }: { children: ReactNode }) => {
    const [allVakitlerList, setAllVakitlerList] = useState<any[]>([]);
    const [theme, setTheme] = useState('auto'); // Tema state'i burada yaşayacak

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