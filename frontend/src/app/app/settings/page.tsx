import React from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { Settings, User, Key } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-outfit tracking-tight">
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200">
                        <Settings className="w-6 h-6" />
                    </div>
                    Tenant Settings
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Configure your farm profile and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <BentoCard padding="lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight font-outfit">Farm Profile</h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Update your farm's public information and contact details.</p>
                        <div className="h-40 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-50">
                            <span className="text-slate-400 text-sm font-semibold tracking-wide">Form Placeholder</span>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard padding="lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Key className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight font-outfit">Integrations & API</h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Manage your Webhooks, API Keys, and 3rd party integrations.</p>
                        <div className="h-40 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-50">
                            <span className="text-slate-400 text-sm font-semibold tracking-wide">Config Placeholder</span>
                        </div>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
}
