'use client';

import React from 'react';
import useSWR from 'swr';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuDataTable } from '@/components/ui/NeuDataTable';
import { Plus, Leaf, Map } from 'lucide-react';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export default function AgriculturePage() {
    const { data: parcels, error: parcelsError, isLoading: parcelsLoading } = useSWR('/api/internal/land-parcels', fetcher);
    const { data: crops, error: cropsError, isLoading: cropsLoading } = useSWR('/api/internal/crops', fetcher);

    // Columns for Land Parcels
    const parcelColumns = [
        { header: 'Parcel Name', key: 'name' },
        { header: 'Area Size', key: 'areaSize' },
        { header: 'Soil Type', key: 'soilType' },
        { header: 'Status', key: 'status' }
    ];

    // Columns for Crop Phases
    const cropColumns = [
        { header: 'Phase Name', key: 'name' },
        { header: 'Current Phase', key: 'phase' },
        { header: 'Expected Yield', key: 'expectedYield' },
        { header: 'Status', key: 'status' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-green-500" />
                        Agriculture & Crops
                    </h1>
                    <p className="text-gray-500 mt-2">Monitor planting phases, harvests, and field status.</p>
                </div>
                <div className="flex gap-4">
                    <button className="neu-button px-4 py-2 rounded-xl font-bold text-green-600 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> New Parcel
                    </button>
                    <button className="neu-button px-4 py-2 rounded-xl font-bold text-orange-600 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> New Crop Phase
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Land Parcels Table */}
                <NeuCard className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <Map className="w-6 h-6 text-gray-600" />
                        <h2 className="text-xl font-bold text-gray-800">Land Parcels</h2>
                    </div>
                    {parcelsError ? (
                        <div className="text-red-500 font-medium">Failed to load Land Parcels.</div>
                    ) : parcelsLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                    ) : (
                        <NeuDataTable
                            columns={parcelColumns}
                            data={parcels || []}
                            keyExtractor={(item: any) => item.id}
                        />
                    )}
                </NeuCard>

                {/* Crop Phases Table */}
                <NeuCard className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <Leaf className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-800">Crop Phases</h2>
                    </div>
                    {cropsError ? (
                        <div className="text-red-500 font-medium">Failed to load Crop Phases.</div>
                    ) : cropsLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                    ) : (
                        <NeuDataTable
                            columns={cropColumns}
                            data={crops || []}
                            keyExtractor={(item: any) => item.id}
                        />
                    )}
                </NeuCard>
            </div>
        </div>
    );
}
