import React from 'react';
import { BentoCard } from './BentoCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoStatCardProps {
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

export function BentoStatCard({ title, value, icon: Icon, iconColorClass = "text-blue-500", trend }: BentoStatCardProps) {
    return (
        <BentoCard variant="interactive" className="flex flex-col relative overflow-hidden group">
            {/* Soft background glow based on icon color */}
            <div className={cn("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.04] blur-2xl group-hover:opacity-[0.08] transition-opacity duration-500", iconColorClass.replace('text-', 'bg-'))} />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm", iconColorClass)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold flex items-center shadow-sm border",
                        trend.isPositive ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"
                    )}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            <div className="relative z-10 space-y-1">
                <h2 className="text-3xl font-outfit font-bold text-slate-800 tracking-tight">{value}</h2>
                <p className="text-slate-500 font-medium text-sm">{title}</p>
            </div>

            {trend && (
                <p className="text-xs text-slate-400 mt-4 relative z-10">{trend.label}</p>
            )}
        </BentoCard>
    );
}
