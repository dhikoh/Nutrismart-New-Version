"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { NeuButton } from '@/components/ui/NeuButton';
import { Building2, MapPin, Phone } from 'lucide-react';

export default function SetupTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSetup = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate tenant creation API call
        setTimeout(() => {
            setLoading(false);
            router.push('/app');
        }, 1200);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#ecf0f3] p-4 font-sans text-gray-700">
            <NeuCard className="w-full max-w-xl" size="lg">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto neu-flat rounded-full flex items-center justify-center mb-4 text-[#00bfa5]">
                        <Building2 size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-800">Setup Your Farm</h1>
                    <p className="text-sm text-gray-500 mt-2">Complete your tenant profile to get started with PediaVet.</p>
                </div>

                <form onSubmit={handleSetup} className="space-y-6">
                    <NeuInput
                        label="Farm/Company Name"
                        type="text"
                        required
                        icon={Building2}
                        placeholder="e.g. Nusantara Farm"
                    />

                    <NeuInput
                        label="Address"
                        type="text"
                        required
                        icon={MapPin}
                        placeholder="Primary location of operation"
                    />

                    <NeuInput
                        label="Contact Phone"
                        type="tel"
                        required
                        icon={Phone}
                        placeholder="+62 8..."
                    />

                    <div className="pt-4">
                        <NeuButton
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            className="w-full bg-[#ecf0f3]"
                            size="lg"
                        >
                            {loading ? "Creating Tenant..." : "Complete Setup"}
                        </NeuButton>
                    </div>
                </form>
            </NeuCard>
        </div>
    );
}
