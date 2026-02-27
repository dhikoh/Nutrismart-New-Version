"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFarmMode } from '../providers/FarmModeProvider';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Tractor,
    PawPrint,
    Wallet,
    Leaf,
    ThermometerSun,
    Sprout,
    Calculator,
    FileText,
    ActivitySquare,
    Package,
    ShieldAlert
} from 'lucide-react';

const SHARED_MENU = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/app' },
    { name: 'Inventory Hub', icon: Package, href: '/app/inventory' },
    { name: 'Billing & Invoice', icon: FileText, href: '/app/billing' },
    { name: 'Finance', icon: Wallet, href: '/app/finance' },
    { name: 'Audit Logs', icon: ShieldAlert, href: '/app/logs' },
    { name: 'Staff', icon: Users, href: '/app/staff' },
    { name: 'Settings', icon: Settings, href: '/app/settings' },
];

const LIVESTOCK_MENU = [
    { name: 'Livestock', icon: PawPrint, href: '/app/livestock' },
    { name: 'Enclosures', icon: ThermometerSun, href: '/app/enclosures' },
    { name: 'Nutrition Engine', icon: Calculator, href: '/app/nutrition' },
    { name: 'Medical Vault', icon: ActivitySquare, href: '/app/medical' },
];

const AGRICULTURE_MENU = [
    { name: 'Land Parcels', icon: Sprout, href: '/app/agriculture' },
    { name: 'Crop Phases', icon: Leaf, href: '/app/crops' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { mode } = useFarmMode();

    const activeMenu = mode === 'LIVESTOCK'
        ? [SHARED_MENU[0], ...LIVESTOCK_MENU, ...SHARED_MENU.slice(1)]
        : [SHARED_MENU[0], ...AGRICULTURE_MENU, ...SHARED_MENU.slice(1)];

    return (
        <aside className="w-[280px] flex-shrink-0 h-screen bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex z-20 shadow-sm">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* LOGO AREA */}
                <div className="flex items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-50">
                        <span className="text-2xl font-bold text-white tracking-wider font-outfit">PV</span>
                    </div>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="space-y-6">
                    <div>
                        <p className="px-4 text-[10px] font-bold text-slate-400/80 uppercase tracking-widest mb-3">
                            {mode === 'LIVESTOCK' ? 'Livestock Operations' : 'Agriculture Tracking'}
                        </p>
                        <div className="space-y-1">
                            {activeMenu.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-blue-50 text-blue-700 font-semibold"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                        )}
                                    >
                                        {isActive && <div className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-blue-600 rounded-r-full" />}
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </nav>
            </div>

            {/* LOGOUT BUTTON */}
            <div className="border-t border-slate-100 pt-6 mt-4">
                <button className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100/80 text-red-600 transition-colors px-4 py-3.5 rounded-2xl font-semibold">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
