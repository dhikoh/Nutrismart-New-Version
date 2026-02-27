import React from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoDataTable } from '@/components/ui/BentoDataTable';
import { BentoButton } from '@/components/ui/BentoButton';
import { ShieldCheck, Building2, Users, Activity } from 'lucide-react';

export default function SuperadminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center space-x-3 font-outfit tracking-tight">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span>Superadmin Control Panel</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium pl-14">Manage all tenants, system settings, and monitor global metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BentoCard padding="lg" className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600 shadow-sm border border-emerald-100">
                        <Building2 size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 font-outfit">12</h2>
                    <p className="text-slate-500 font-semibold tracking-wide mt-1">Active Tenants</p>
                </BentoCard>

                <BentoCard padding="lg" className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center mb-4 text-blue-600 shadow-sm border border-blue-100">
                        <Users size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 font-outfit">145</h2>
                    <p className="text-slate-500 font-semibold tracking-wide mt-1">Total Users</p>
                </BentoCard>

                <BentoCard padding="lg" className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-purple-50 flex items-center justify-center mb-4 text-purple-600 shadow-sm border border-purple-100">
                        <Activity size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 font-outfit">99.9%</h2>
                    <p className="text-slate-500 font-semibold tracking-wide mt-1">System Uptime</p>
                </BentoCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoCard padding="md">
                    <div className="flex justify-between items-center mb-6 pl-2 pr-2 border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-bold text-slate-800 font-outfit tracking-tight">Tenant Directory</h3>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">View All</button>
                    </div>

                    <div className="relative border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                        <BentoDataTable
                            data={[
                                { id: 1, name: 'Nusantara Farm', status: 'Active', plan: 'Pro' },
                                { id: 2, name: 'Sukamaju Agro', status: 'Active', plan: 'Basic' },
                                { id: 3, name: 'EcoLivestock', status: 'Suspended', plan: 'Trial' },
                            ]}
                            columns={[
                                { key: 'name', header: 'Tenant', className: "font-semibold text-slate-800" },
                                { key: 'plan', header: 'Plan', className: "text-slate-500" },
                                {
                                    key: 'status', header: 'Status', render: (row: { status: string }) => (
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            {row.status}
                                        </span>
                                    )
                                },
                                {
                                    key: 'actions', header: '', render: () => (
                                        <BentoButton size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 font-bold">Manage</BentoButton>
                                    )
                                }
                            ]}
                            keyExtractor={(item) => item.id}
                        />
                    </div>
                </BentoCard>

                <BentoCard padding="lg">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 font-outfit tracking-tight pb-4 border-b border-slate-100">System Alerts</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 shadow-sm transition-all hover:shadow-md">
                            <p className="font-bold text-orange-800 text-sm">High Load on DB Replica</p>
                            <p className="text-xs text-orange-600 mt-1.5 font-medium">CPU usage spiked to 85% in the last 10 minutes.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 shadow-sm transition-all hover:shadow-md hover:bg-white">
                            <p className="font-bold text-slate-800 text-sm">System Backup Completed</p>
                            <p className="text-xs text-slate-500 mt-1.5 font-medium">Daily snapshot generated at 02:00 AM.</p>
                        </div>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
}
