'use client';

import React, { useState, useEffect } from 'react';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuStatCard } from '@/components/ui/NeuStatCard';
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

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await api.get('/api/internal/dashboard/stats');
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
                <p className="text-gray-500 mt-2">Welcome back to PediaVet! Here is your farm summary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <NeuStatCard
                    title="Total Livestock"
                    value={stats.totalLivestock.toString()}
                    icon={PawPrint}
                    iconColorClass="text-[#00bfa5]"
                    trend={{ value: stats.trends.livestock.value, label: "vs last month", isPositive: stats.trends.livestock.isPositive }}
                />

                <NeuStatCard
                    title="Active Crops Phase"
                    value={stats.activeCrops.toString()}
                    icon={Tractor}
                    iconColorClass="text-orange-500"
                />

                <NeuStatCard
                    title="Farm Staff"
                    value={stats.farmStaff.toString()}
                    icon={Users}
                    iconColorClass="text-blue-500"
                />

                <NeuStatCard
                    title="Monthly Revenue"
                    value={`Rp ${stats.monthlyRevenue.toLocaleString('id-ID')}`}
                    icon={TrendingUp}
                    iconColorClass="text-green-500"
                    trend={{ value: stats.trends.revenue.value, label: "vs last month", isPositive: stats.trends.revenue.isPositive }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <NeuCard className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-700 mb-6">Financial Overview</h3>
                    <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
                        <span className="text-gray-400">Chart Placeholder</span>
                    </div>
                </NeuCard>
                <NeuCard>
                    <h3 className="text-xl font-bold text-gray-700 mb-6">Recent Activities</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start space-x-4 p-4 neu-pressed rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600 font-bold">
                                    {i}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Livestock Sold</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </NeuCard>
            </div>

            {/* AI Assistant Module */}
            <AiAssistant />
        </div>
    );
}
