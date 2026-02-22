"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ActivitySquare, Plus, CheckSquare, Stethoscope, Clock } from 'lucide-react';

interface MedicalRecord {
    id: string;
    livestockId: string;
    recordType: string;
    date: string;
    diagnosis: string | null;
    treatment: string | null;
    cost: number;
    veterinarian: string | null;
    livestock: {
        name: string;
        species: string;
    };
}

export default function MedicalVaultPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await api.get(`/api/internal/medical-records`);
                if (res.data) {
                    setRecords(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch medical data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <ActivitySquare className="w-8 h-8 text-[#00bfa5]" />
                        Medical Vault
                    </h1>
                    <p className="text-gray-500 mt-2">Log vaccinations, treatments, and general health checkups.</p>
                </div>
                <div className="flex gap-4">
                    <button className="neu-button px-6 py-2.5 rounded-xl font-medium text-[#00bfa5] flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Log Record
                    </button>
                </div>
            </div>

            <div className="neu-flat rounded-3xl p-6 min-h-[500px]">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-gray-500" />
                        Recent Treatments & Vaccinations
                    </h2>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded-2xl w-full"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-xl font-medium text-gray-500">All Livestock Healthy</p>
                                <p className="text-sm mt-2 max-w-sm mx-auto">There are currently no recent medical logs or upcoming vaccinations scheduled. Use "Log Record" to add new historical data.</p>
                            </div>
                        ) : (
                            records.map((record) => (
                                <div key={record.id} className="neu-pressed rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${record.recordType === 'VACCINATION' ? 'bg-blue-100 text-blue-600' :
                                            record.recordType === 'CHECKUP' ? 'bg-green-100 text-green-600' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            <ActivitySquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-gray-800 text-lg">{record.livestock?.name || 'Unknown Animal'}</p>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${record.recordType === 'VACCINATION' ? 'bg-blue-50 text-blue-600' :
                                                    record.recordType === 'CHECKUP' ? 'bg-green-50 text-green-600' :
                                                        'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {record.recordType}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Diagnosis: {record.diagnosis || 'N/A'} • Vet: {record.veterinarian || 'Internal'}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{new Date(record.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-0">
                                        <p className="text-xs text-gray-400 mb-1">Medical Cost</p>
                                        <p className="font-bold text-[#00bfa5] text-lg">Rp {Number(record.cost).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
