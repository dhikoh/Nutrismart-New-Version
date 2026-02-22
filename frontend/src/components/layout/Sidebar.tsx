"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Tractor,
    PawPrint,
    Wallet
} from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/app' },
    { name: 'Livestock', icon: PawPrint, href: '/app/livestock' },
    { name: 'Agriculture', icon: Tractor, href: '/app/agriculture' },
    { name: 'Finance', icon: Wallet, href: '/app/finance' },
    { name: 'Staff', icon: Users, href: '/app/staff' },
    { name: 'Settings', icon: Settings, href: '/app/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 h-screen neu-flat p-6 flex flex-col justify-between hidden md:flex rounded-r-[30px] z-20">
            <div>
                {/* LOGO AREA */}
                <div className="flex items-center justify-center mb-10">
                    <div className="w-16 h-16 neu-button rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#00bfa5] tracking-wider">PV</span>
                    </div>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="space-y-4">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "neu-pressed text-[#00bfa5] font-semibold"
                                        : "text-gray-500 hover:neu-button hover:text-gray-700"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-[#00bfa5]" : "text-gray-400 group-hover:text-gray-600")} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* LOGOUT BUTTON */}
            <div className="border-t border-gray-300/30 pt-6">
                <button className="w-full flex items-center justify-center space-x-3 neu-button px-5 py-4 rounded-xl text-red-500 hover:text-red-600 font-medium">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
