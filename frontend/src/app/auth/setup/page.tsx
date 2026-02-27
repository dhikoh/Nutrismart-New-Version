"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoInput } from '@/components/ui/BentoInput';
import { BentoButton } from '@/components/ui/BentoButton';
import { Building2, MapPin, Phone } from 'lucide-react';

export default function SetupTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSetup = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Tenant creation API mock or call goes here
        setTimeout(() => {
            setLoading(false);
            router.push('/app');
        }, 1200);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />

            <BentoCard padding="lg" className="w-full max-w-xl relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-emerald-50 border border-emerald-100 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                        <Building2 size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-outfit">Setup Your Farm</h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Complete your tenant profile to get started with PediaVet.</p>
                </div>

                <form onSubmit={handleSetup} className="space-y-6">
                    <BentoInput
                        label="Farm/Company Name"
                        type="text"
                        required
                        icon={Building2}
                        placeholder="e.g. Nusantara Farm"
                    />

                    <BentoInput
                        label="Address"
                        type="text"
                        required
                        icon={MapPin}
                        placeholder="Primary location of operation"
                    />

                    <BentoInput
                        label="Contact Phone"
                        type="tel"
                        required
                        icon={Phone}
                        placeholder="+62 8..."
                    />

                    <div className="pt-4">
                        <BentoButton
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            className="w-full"
                            size="lg"
                        >
                            {loading ? "Creating Tenant..." : "Complete Setup"}
                        </BentoButton>
                    </div>
                </form>
            </BentoCard>
        </div>
    );
}
