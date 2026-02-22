import React from 'react';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuDataTable } from '@/components/ui/NeuDataTable';
import { NeuButton } from '@/components/ui/NeuButton';
import { ShieldCheck, Building2, Users, Activity } from 'lucide-react';

export default function SuperadminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-500" />
                    <span>Superadmin Control Panel</span>
                </h1>
                <p className="text-gray-500 mt-2">Manage all tenants, system settings, and monitor global metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NeuCard className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center mb-4 text-[#00bfa5]">
                        <Building2 size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-gray-700">12</h2>
                    <p className="text-gray-500 font-medium">Active Tenants</p>
                </NeuCard>

                <NeuCard className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center mb-4 text-blue-500">
                        <Users size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-gray-700">145</h2>
                    <p className="text-gray-500 font-medium">Total Users</p>
                </NeuCard>

                <NeuCard className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center mb-4 text-purple-500">
                        <Activity size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-gray-700">99.9%</h2>
                    <p className="text-gray-500 font-medium">System Uptime</p>
                </NeuCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <NeuCard>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-700">Tenant Directory</h3>
                        <button className="text-sm font-semibold text-indigo-500 hover:underline">View All</button>
                    </div>

                    <NeuDataTable
                        data={[
                            { id: 1, name: 'Nusantara Farm', status: 'Active', plan: 'Pro' },
                            { id: 2, name: 'Sukamaju Agro', status: 'Active', plan: 'Basic' },
                            { id: 3, name: 'EcoLivestock', status: 'Suspended', plan: 'Trial' },
                        ]}
                        columns={[
                            { key: 'name', header: 'Tenant' },
                            { key: 'plan', header: 'Plan' },
                            {
                                key: 'status', header: 'Status', render: (row: any) => (
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {row.status}
                                    </span>
                                )
                            },
                            {
                                key: 'actions', header: '', render: () => (
                                    <NeuButton size="sm" variant="default" className="text-indigo-500">Manage</NeuButton>
                                )
                            }
                        ]}
                        keyExtractor={(item) => item.id}
                    />
                </NeuCard>

                <NeuCard>
                    <h3 className="text-xl font-bold text-gray-700 mb-6">System Alerts</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-orange-100 border border-orange-200">
                            <p className="font-semibold text-orange-800 text-sm">High Load on DB Replica</p>
                            <p className="text-xs text-orange-600 mt-1">CPU usage spiked to 85% in the last 10 minutes.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
                            <p className="font-semibold text-gray-800 text-sm">System Backup Completed</p>
                            <p className="text-xs text-gray-600 mt-1">Daily snapshot generated at 02:00 AM.</p>
                        </div>
                    </div>
                </NeuCard>
            </div>
        </div>
    );
}
