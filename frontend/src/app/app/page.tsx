'use client';

import React, { useState, useEffect } from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoStatCard } from '@/components/ui/BentoStatCard';
import { PawPrint, Tractor, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { AiAssistant } from '@/components/ui/AiAssistant';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalLivestock: 0,
        activeCrops: 0,
        farmStaff: 0,
        monthlyRevenue: 0,
        trends: {
            livestock: { value: 0, isPositive: true },
            revenue: { value: 0, isPositive: true }
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await api.get('/api/internal/dashboard/stats');
                setStats(response.data);
            } catch (err) {
                const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
                setError(errorObj.response?.data?.message || errorObj.message || 'Failed to fetch dashboard stats');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-outfit font-bold text-slate-800 tracking-tight">Overview</h1>
                <p className="text-slate-500 mt-2 font-medium">Welcome back to PediaVet! Here is your farm summary.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium animate-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Bento Grid layout for stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <BentoStatCard
                    title="Total Livestock"
                    value={stats.totalLivestock.toString()}
                    icon={PawPrint}
                    iconColorClass="text-blue-500"
                    trend={{ value: stats.trends.livestock.value, label: "vs last month", isPositive: stats.trends.livestock.isPositive }}
                />

                <BentoStatCard
                    title="Active Crops Phase"
                    value={stats.activeCrops.toString()}
                    icon={Tractor}
                    iconColorClass="text-orange-500"
                />

                <BentoStatCard
                    title="Farm Staff"
                    value={stats.farmStaff.toString()}
                    icon={Users}
                    iconColorClass="text-purple-500"
                />

                <BentoStatCard
                    title="Monthly Revenue"
                    value={`Rp ${stats.monthlyRevenue.toLocaleString('id-ID')}`}
                    icon={TrendingUp}
                    iconColorClass="text-emerald-500"
                    trend={{ value: stats.trends.revenue.value, label: "vs last month", isPositive: stats.trends.revenue.isPositive }}
                />
            </div>

            {/* Main Content Area in Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BentoCard className="lg:col-span-2 flex flex-col h-full min-h-[400px]">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Financial Overview</h3>
                    <div className="flex-1 w-full flex items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl group transition-colors hover:bg-slate-50">
                        <span className="text-slate-400 font-medium group-hover:text-slate-500 transition-colors">Chart Placeholder</span>
                    </div>
                </BentoCard>

                <BentoCard className="flex flex-col h-full">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                        Recent Activities
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Live</span>
                    </h3>
                    <div className="space-y-4 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold group-hover:bg-blue-200 transition-colors">
                                    {i}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Livestock Sold</p>
                                    <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </BentoCard>
            </div>

            {/* AI Assistant Module (Auto handles its own grid spanning depending on container) */}
            <div className="w-full">
                <AiAssistant />
            </div>
        </div>
    );
}
