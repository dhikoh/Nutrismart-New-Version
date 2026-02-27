'use client';

import React from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { FarmModeProvider } from '../providers/FarmModeProvider';

export default function AppLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FarmModeProvider>
            <div className="flex min-h-screen font-sans bg-slate-50 text-slate-800">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </FarmModeProvider>
    );
}
