import React from 'react';
import { NeuCard } from './NeuCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeuStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColorClass?: string;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
}

export function NeuStatCard({ title, value, icon: Icon, iconColorClass = "text-[#00bfa5]", trend }: NeuStatCardProps) {
    return (
        <NeuCard className="flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
            {/* Decorative background circle */}
            <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl", iconColorClass.replace('text-', 'bg-'))} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-14 h-14 rounded-full neu-pressed flex items-center justify-center">
                    <Icon className={cn("w-6 h-6", iconColorClass)} />
                </div>
                {trend && (
                    <div className={cn(
                        "px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-[2px_2px_4px_#cbced1,-2px_-2px_4px_#ffffff]",
                        trend.isPositive ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"
                    )}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h2 className="text-4xl font-outfit font-black text-gray-700">{value}</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">{title}</p>
            </div>

            {trend && (
                <p className="text-xs text-gray-400 mt-4 relative z-10">{trend.label}</p>
            )}
        </NeuCard>
    );
}
