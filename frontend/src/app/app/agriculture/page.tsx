'use client';

import React from 'react';
import useSWR from 'swr';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoDataTable } from '@/components/ui/BentoDataTable';
import { Plus, Leaf, Map } from 'lucide-react';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export default function AgriculturePage() {
    const { data: parcels, error: parcelsError, isLoading: parcelsLoading } = useSWR('/api/internal/land-parcels', fetcher);
    const { data: crops, error: cropsError, isLoading: cropsLoading } = useSWR('/api/internal/crops', fetcher);

    type AgricultureRow = {
        id: string | number;
        status: string;
        [key: string]: unknown;
    };

    // Columns for Land Parcels
    const parcelColumns = [
        { header: 'Parcel Name', key: 'name', className: "font-semibold text-slate-800" },
        { header: 'Area Size', key: 'areaSize' },
        { header: 'Soil Type', key: 'soilType', className: "text-slate-500" },
        { header: 'Status', key: 'status', render: (row: AgricultureRow) => <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">{row.status}</span> }
    ];

    // Columns for Crop Phases
    const cropColumns = [
        { header: 'Phase Name', key: 'name', className: "font-semibold text-slate-800" },
        { header: 'Current Phase', key: 'phase', className: "text-slate-500" },
        { header: 'Expected Yield', key: 'expectedYield' },
        { header: 'Status', key: 'status', render: (row: AgricultureRow) => <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-200">{row.status}</span> }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-outfit tracking-tight">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                            <Leaf className="w-6 h-6" />
                        </div>
                        Agriculture & Crops
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Monitor planting phases, harvests, and field status.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="bento-button px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm">
                        <Plus className="w-4 h-4" /> New Parcel
                    </button>
                    <button className="bento-button-primary px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm bg-orange-600 hover:bg-orange-700 hover:shadow-orange-500/20 shadow-orange-500/10">
                        <Plus className="w-4 h-4" /> New Crop Phase
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                {/* Land Parcels Table */}
                <BentoCard padding="md">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                            <Map className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-outfit">Land Parcels</h2>
                    </div>
                    {parcelsError ? (
                        <div className="text-red-500 font-medium p-4 bg-red-50 rounded-xl border border-red-100 text-sm">Failed to load Land Parcels.</div>
                    ) : parcelsLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                        </div>
                    ) : (
                        <div className="relative border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                            <BentoDataTable
                                columns={parcelColumns}
                                data={parcels || []}
                                keyExtractor={(item: AgricultureRow) => item.id}
                            />
                        </div>
                    )}
                </BentoCard>

                {/* Crop Phases Table */}
                <BentoCard padding="md">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-outfit">Crop Phases</h2>
                    </div>
                    {cropsError ? (
                        <div className="text-red-500 font-medium p-4 bg-red-50 rounded-xl border border-red-100 text-sm">Failed to load Crop Phases.</div>
                    ) : cropsLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="relative border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                            <BentoDataTable
                                columns={cropColumns}
                                data={crops || []}
                                keyExtractor={(item: AgricultureRow) => item.id}
                            />
                        </div>
                    )}
                </BentoCard>
            </div>
        </div>
    );
}
