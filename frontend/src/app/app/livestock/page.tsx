'use client';

import React, { useState, useEffect } from 'react';
import { NeuCard } from '@/components/ui/NeuCard';
import { api } from '@/lib/api';
import { PawPrint } from 'lucide-react';
import { NeuDataTable } from '@/components/ui/NeuDataTable';

export default function LivestockPage() {
    const [livestockList, setLivestockList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLivestock = async () => {
            try {
                // Future optimization: Add Authorization Header or rely on Cookies
                const response = await api.get('/api/internal/livestock');
                setLivestockList(response.data);
            } catch (err: any) {
                console.error("Failed to load livestock data:", err);
                setError('Failed to load data. Please check your connection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLivestock();
    }, []);

    const columns = [
        { key: 'name', header: 'Name/Tag' },
        { key: 'species', header: 'Species' },
        { key: 'breed', header: 'Breed' },
        { key: 'currentWeight', header: 'Weight (kg)' },
        {
            key: 'status', header: 'Health Status', render: (row: any) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <PawPrint className="text-[#00bfa5] w-8 h-8" />
                        Livestock Management
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your animals, health records, and groupings.</p>
                </div>
                <button className="neu-button px-6 py-3 rounded-xl font-bold text-[#00bfa5] hover:text-[#00cca8]">
                    + Add Animal
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading ? (
                <NeuCard className="mt-8 flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5]"></div>
                </NeuCard>
            ) : (
                <NeuDataTable
                    data={livestockList}
                    columns={columns}
                    keyExtractor={(item: any) => item.id}
                    emptyMessage="No livestock registered yet."
                />
            )}
        </div>
    );
}
