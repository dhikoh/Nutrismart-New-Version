import React from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { Users, Plus } from 'lucide-react';

export default function StaffPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-outfit tracking-tight">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <Users className="w-6 h-6" />
                        </div>
                        Staff Management
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage employee access, roles, and permissions.</p>
                </div>
                <button className="bento-button-primary px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Add Staff
                </button>
            </div>

            <BentoCard padding="lg" className="mt-8 flex items-center justify-center h-80 border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-none">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <Users className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-semibold tracking-wide">Staff Management Data Table Placeholder</p>
                </div>
            </BentoCard>
        </div>
    );
}
