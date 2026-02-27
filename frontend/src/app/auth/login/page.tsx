"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoInput } from '@/components/ui/BentoInput';
import { BentoButton } from '@/components/ui/BentoButton';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Login API mock or call goes here
        setTimeout(() => {
            setLoading(false);
            router.push('/app');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none" />

            <BentoCard padding="lg" className="w-full max-w-md relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-white border border-slate-100 shadow-sm rounded-[1.5rem] flex items-center justify-center mb-6">
                        <span className="text-3xl font-black text-blue-600 tracking-widest font-outfit">PV</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-outfit">Welcome to PediaVet</h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Enter your credentials to access your farm dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <BentoInput
                        label="Email Address"
                        type="email"
                        required
                        icon={Mail}
                        placeholder="admin@pediavet.com"
                    />

                    <BentoInput
                        label="Password"
                        type="password"
                        required
                        icon={Lock}
                        placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between px-1 pt-1">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 transition-colors" />
                            <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all">Forgot Password?</a>
                    </div>

                    <BentoButton
                        type="submit"
                        disabled={loading}
                        variant="primary"
                        className="w-full mt-4"
                        size="lg"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </BentoButton>
                </form>
            </BentoCard>
        </div>
    );
}
