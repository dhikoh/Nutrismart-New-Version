'use client';

import React, { useState, useEffect } from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { api } from '@/lib/api';
import { PawPrint, DownloadCloud, X } from 'lucide-react';
import { BentoDataTable } from '@/components/ui/BentoDataTable';
import { BentoFileUpload } from '@/components/ui/BentoFileUpload';

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
            } catch (err) {
                const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
                setError(errorObj.response?.data?.message || 'Failed to load data. Please check your connection.');
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
        } catch (err) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || errorObj.message || 'Failed to add animal');
        } finally {
            setIsSubmitting(false);
        }
    };

    type LivestockRow = {
        id: string | number;
        imageUrl?: string;
        status: string;
        [key: string]: unknown;
    };

    const columns = [
        {
            key: 'imageUrl', header: 'Photo', render: (row: LivestockRow) => (
                row.imageUrl ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.imageUrl}`} alt="pet" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                    : <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">No Img</div>
            )
        },
        { key: 'name', header: 'Name/Tag', className: "font-semibold text-slate-800" },
        { key: 'species', header: 'Species' },
        { key: 'breed', header: 'Breed' },
        { key: 'currentWeight', header: 'Weight (kg)' },
        {
            key: 'status', header: 'Health Status', render: (row: LivestockRow) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${row.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-slate-800 flex items-center gap-3 tracking-tight">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <PawPrint className="w-6 h-6" />
                        </div>
                        Livestock Management
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your animals, health records, and groupings.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={handleExportCsv} className="bento-button px-5 py-2.5 rounded-xl flex-1 sm:flex-none justify-center flex items-center gap-2 text-sm">
                        <DownloadCloud className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bento-button-primary px-6 py-2.5 rounded-xl flex-1 sm:flex-none text-sm">
                        + Add Animal
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium animate-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {isLoading ? (
                <BentoCard className="mt-8 flex justify-center items-center h-64 border border-dashed border-slate-300">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium text-slate-500">Loading livestock data...</span>
                    </div>
                </BentoCard>
            ) : (
                <div className="mt-8 relative">
                    <BentoDataTable
                        data={livestockList}
                        columns={columns}
                        keyExtractor={(item: LivestockRow) => item.id}
                        emptyMessage="No livestock registered yet."
                    />
                </div>
            )}

            {/* Overlay Modal For Adding Animal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <BentoCard padding="lg" className="w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 font-outfit tracking-tight">Register Livestock</h2>

                        <form onSubmit={handleAddAnimalSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Name / Tag ID</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bento-input w-full px-4 rounded-xl" placeholder="E.g., B-012" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Species</label>
                                    <input required type="text" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} className="bento-input w-full px-4 rounded-xl" placeholder="Cattle, Goat" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Breed</label>
                                    <input type="text" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="bento-input w-full px-4 rounded-xl" placeholder="Angus" />
                                </div>
                            </div>

                            {/* MEDIA FILE UPLOAD INJECTION */}
                            <div className="pt-2">
                                <BentoFileUpload
                                    label="Upload Profile Photo"
                                    onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                                />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bento-button-primary py-3.5 rounded-xl disabled:opacity-50 mt-4 text-base shadow-md">
                                {isSubmitting ? 'Saving...' : 'Save Record'}
                            </button>
                        </form>
                    </BentoCard>
                </div>
            )}

        </div>
    );
}
