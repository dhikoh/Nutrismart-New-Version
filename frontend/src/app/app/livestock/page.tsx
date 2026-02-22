'use client';

import React, { useState, useEffect } from 'react';
import { NeuCard } from '@/components/ui/NeuCard';
import { api } from '@/lib/api';
import { PawPrint, DownloadCloud, X } from 'lucide-react';
import { NeuDataTable } from '@/components/ui/NeuDataTable';
import { NeuFileUpload } from '@/components/ui/NeuFileUpload';

export default function LivestockPage() {
    const [livestockList, setLivestockList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add Animal Form State
    const [formData, setFormData] = useState({
        name: '', species: '', breed: '', imageUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleExportCsv = async () => {
        try {
            const response = await api.get('/api/internal/livestock/export/csv', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PediaVet_Livestock_Export_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error("Failed to export CSV", err);
            setError("Failed to download CSV export.");
        }
    };

    const handleAddAnimalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/api/internal/livestock', formData);
            setIsAddModalOpen(false);
            setFormData({ name: '', species: '', breed: '', imageUrl: '' });
            // Refresh list
            const response = await api.get('/api/internal/livestock');
            setLivestockList(response.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add animal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'imageUrl', header: 'Photo', render: (row: any) => (
                row.imageUrl ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.imageUrl}`} alt="pet" className="w-10 h-10 rounded-full object-cover" />
                    : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">No Img</div>
            )
        },
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
                <div className="flex gap-4">
                    <button onClick={handleExportCsv} className="neu-flat px-4 py-3 rounded-xl font-bold text-gray-600 hover:text-gray-800 flex items-center gap-2">
                        <DownloadCloud className="w-5 h-5" />
                        Export
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="neu-button px-6 py-3 rounded-xl font-bold text-[#00bfa5] hover:text-[#00cca8]">
                        + Add Animal
                    </button>
                </div>
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

            {/* Overlay Modal For Adding Animal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <NeuCard className="w-full max-w-md p-6 relative">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register Livestock</h2>

                        <form onSubmit={handleAddAnimalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Name / Tag ID</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="neu-input w-full px-4 py-3 rounded-xl" placeholder="E.g., B-012" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Species</label>
                                    <input required type="text" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} className="neu-input w-full px-4 py-3 rounded-xl" placeholder="Cattle, Goat" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Breed</label>
                                    <input type="text" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="neu-input w-full px-4 py-3 rounded-xl" placeholder="Angus" />
                                </div>
                            </div>

                            {/* MEDIA FILE UPLOAD INJECTION */}
                            <NeuFileUpload
                                label="Upload Profile Photo"
                                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                            />

                            <button type="submit" disabled={isSubmitting} className="w-full neu-button py-3 pt-4 rounded-xl font-bold text-[#00bfa5] disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Save Record'}
                            </button>
                        </form>
                    </NeuCard>
                </div>
            )}

        </div>
    );
}
