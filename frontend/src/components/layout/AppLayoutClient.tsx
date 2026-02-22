import React from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';

export default function AppLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-[#ecf0f3] min-h-screen text-[#171717] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#ecf0f3] p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
