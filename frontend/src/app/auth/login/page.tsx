"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { NeuButton } from '@/components/ui/NeuButton';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login API call
        setTimeout(() => {
            setLoading(false);
            router.push('/app');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#ecf0f3] p-4 font-sans text-gray-700">
            <NeuCard className="w-full max-w-md" size="lg">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto neu-button rounded-full flex items-center justify-center mb-6">
                        <span className="text-3xl font-black text-[#00bfa5] tracking-widest">PV</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-800">Welcome to PediaVet</h1>
                    <p className="text-sm text-gray-500 mt-2">Enter your credentials to access your farm dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <NeuInput
                        label="Email Address"
                        type="email"
                        required
                        icon={Mail}
                        placeholder="admin@pediavet.com"
                    />

                    <NeuInput
                        label="Password"
                        type="password"
                        required
                        icon={Lock}
                        placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between px-2 pt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded text-[#00bfa5] neu-pressed" />
                            <span className="text-sm text-gray-500">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-[#00bfa5] font-semibold hover:underline">Forgot Password?</a>
                    </div>

                    <NeuButton
                        type="submit"
                        disabled={loading}
                        variant="primary"
                        className="w-full mt-4 bg-[#ecf0f3]"
                        size="lg"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </NeuButton>
                </form>
            </NeuCard>
        </div>
    );
}
