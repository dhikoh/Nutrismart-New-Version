"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type FarmMode = 'LIVESTOCK' | 'AGRICULTURE';

interface FarmModeContextType {
    mode: FarmMode;
    toggleMode: () => void;
    setMode: (mode: FarmMode | ((prev: FarmMode) => FarmMode)) => void;
}

const FarmModeContext = createContext<FarmModeContextType | undefined>(undefined);

export function FarmModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<FarmMode>('LIVESTOCK');

    // Initialize from localStorage on client mount
    useEffect(() => {
        const savedMode = localStorage.getItem('pediavet_mode') as FarmMode;
        if (savedMode === 'LIVESTOCK' || savedMode === 'AGRICULTURE') {
            setModeState(savedMode);
        }
    }, []);

    const setMode = (newMode: FarmMode | ((prev: FarmMode) => FarmMode)) => {
        if (typeof newMode === 'function') {
            setModeState((prev) => {
                const updated = newMode(prev);
                localStorage.setItem('pediavet_mode', updated);
                return updated;
            });
        } else {
            setModeState(newMode);
            localStorage.setItem('pediavet_mode', newMode);
        }
    };

    const toggleMode = () => {
        setMode((prev) => (prev === 'LIVESTOCK' ? 'AGRICULTURE' : 'LIVESTOCK'));
    };

    return (
        <FarmModeContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </FarmModeContext.Provider>
    );
}

export function useFarmMode() {
    const context = useContext(FarmModeContext);
    if (context === undefined) {
        throw new Error('useFarmMode must be used within a FarmModeProvider');
    }
    return context;
}
