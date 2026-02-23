"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calculator, Plus, Trash2, ChevronRight, CheckCircle, XCircle, AlertCircle, Loader2, Wallet } from 'lucide-react';

interface FeedIngredient {
    id: string;
    name: string;
    dryMatter: number;
    crudeProtein: number;
    crudeFiber: number;
    crudeFat: number;
    ash: number;
    calcium: number;
    phosphorus: number;
    metabolizableEnergy: number;
    pricePerKg: number;
}

interface NrcStandard {
    id: string;
    species: string;
    stage: string;
    weightRange: string;
    reqDryMatter: number;
    reqCrudeProtein: number;
    reqEnergy: number;
    reqCalcium: number;
    reqPhosphorus: number;
}

interface RationItem {
    ingredientId: string;
    name: string;
    percentage: number;
}

interface CalculationResult {
    rationDetails: any[];
    actualNutrients: {
        dryMatter: number;
        crudeProtein: number;
        crudeFat: number;
        crudeFiber: number;
        calcium: number;
        phosphorus: number;
        metabolizableEnergy: number;
    };
    lcr: { costPerKgRation: number; costPer100kg: number };
    nrcComparison: any | null;
}

export default function NutritionCalculatorPage() {
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState<FeedIngredient[]>([]);
    const [nrcStandards, setNrcStandards] = useState<NrcStandard[]>([]);
    const [ration, setRation] = useState<RationItem[]>([]);
    const [selectedNrcId, setSelectedNrcId] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [resIngredients, resNrc] = await Promise.all([
                    api.get('/api/internal/nutrition/ingredients'),
                    api.get('/api/internal/nutrition/nrc-standards'),
                ]);
                setIngredients(resIngredients.data || []);
                setNrcStandards(resNrc.data || []);
            } catch {
                console.error('Failed to fetch nutrition data');
            } finally {
                setLoading(false);
            }
        };
        fetchMasterData();
    }, []);

    const totalPercentage = ration.reduce((s, i) => s + i.percentage, 0);

    function addIngredient(ing: FeedIngredient) {
        if (ration.find(r => r.ingredientId === ing.id)) return;
        setRation(prev => [...prev, { ingredientId: ing.id, name: ing.name, percentage: 0 }]);
        setResult(null);
    }

    function updatePercentage(id: string, value: number) {
        setRation(prev => prev.map(r => r.ingredientId === id ? { ...r, percentage: value } : r));
        setResult(null);
    }

    function removeItem(id: string) {
        setRation(prev => prev.filter(r => r.ingredientId !== id));
        setResult(null);
    }

    async function handleCalculate() {
        setError('');
        if (ration.length === 0) { setError('Tambahkan minimal satu bahan pakan.'); return; }
        if (Math.abs(totalPercentage - 100) > 0.01) { setError(`Total persentase harus 100%. Saat ini: ${totalPercentage.toFixed(1)}%`); return; }

        setCalculating(true);
        try {
            const res = await api.post('/api/internal/nutrition/calculate-ration', {
                items: ration.map(r => ({ ingredientId: r.ingredientId, percentage: r.percentage })),
                targetNrcId: selectedNrcId || undefined,
            });
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kalkulasi gagal. Coba lagi.');
        } finally {
            setCalculating(false);
        }
    }

    const nutrientRows = result ? [
        { label: 'Bahan Kering (BK)', key: 'dryMatter', unit: '%', nrcKey: 'dryMatter' },
        { label: 'Protein Kasar (PK)', key: 'crudeProtein', unit: '%', nrcKey: 'crudeProtein' },
        { label: 'Energi Metabolis (ME)', key: 'metabolizableEnergy', unit: 'Kcal/kg', nrcKey: 'metabolizableEnergy' },
        { label: 'Lemak Kasar (LK)', key: 'crudeFat', unit: '%', nrcKey: null },
        { label: 'Serat Kasar (SK)', key: 'crudeFiber', unit: '%', nrcKey: null },
        { label: 'Kalsium (Ca)', key: 'calcium', unit: '%', nrcKey: 'calcium' },
        { label: 'Fosfor (P)', key: 'phosphorus', unit: '%', nrcKey: 'phosphorus' },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-[#00bfa5]" />
                        Kalkulator Formulasi Ransum
                    </h1>
                    <p className="text-gray-500 mt-1">Formulasikan ransum berbasis persentase dan bandingkan dengan standar NRC.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daftar Bahan Baku */}
                <div className="lg:col-span-1 neu-flat rounded-3xl p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Bahan Baku Tersedia</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                            {ingredients.map(ing => (
                                <button
                                    key={ing.id}
                                    onClick={() => addIngredient(ing)}
                                    disabled={!!ration.find(r => r.ingredientId === ing.id)}
                                    className="w-full text-left neu-pressed rounded-2xl p-3 hover:bg-teal-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{ing.name}</p>
                                            <div className="flex gap-2 mt-0.5 text-xs text-gray-500">
                                                <span>PK: {ing.crudeProtein}%</span>
                                                <span>ME: {ing.metabolizableEnergy}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-teal-500 shrink-0" />
                                    </div>
                                </button>
                            ))}
                            {ingredients.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    Belum ada bahan baku. Tambahkan lewat menu Seeder.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Workspace */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Ration Composer */}
                    <div className="neu-flat rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Komposisi Ransum</h2>
                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(totalPercentage - 100) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                Total: {totalPercentage.toFixed(1)}%
                            </div>
                        </div>

                        {ration.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                                <Plus className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Klik bahan di kiri untuk menambahkannya ke ransum.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ration.map(item => (
                                    <div key={item.ingredientId} className="neu-pressed rounded-2xl p-4 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                step={0.1}
                                                value={item.percentage}
                                                onChange={e => updatePercentage(item.ingredientId, parseFloat(e.target.value) || 0)}
                                                className="w-20 text-center bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-sm font-bold text-gray-800 outline-none focus:border-teal-400"
                                            />
                                            <span className="text-gray-500 text-sm font-medium">%</span>
                                            <button onClick={() => removeItem(item.ingredientId)} className="text-rose-400 hover:text-rose-600 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* NRC Target Selector */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <select
                                value={selectedNrcId}
                                onChange={e => setSelectedNrcId(e.target.value)}
                                className="flex-1 neu-pressed rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none cursor-pointer text-gray-700 font-medium"
                            >
                                <option value="">-- Pilih Standar NRC (opsional) --</option>
                                {nrcStandards.map(std => (
                                    <option key={std.id} value={std.id}>
                                        {std.species} — {std.stage} ({std.weightRange} kg)
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleCalculate}
                                disabled={calculating || ration.length === 0}
                                className="neu-button px-6 py-2.5 rounded-xl font-bold text-white bg-[#00bfa5] hover:bg-teal-600 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                            >
                                {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                                Hitung Ransum
                            </button>
                        </div>

                        {error && <p className="mt-3 text-sm text-rose-600 font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</p>}
                    </div>

                    {/* Hasil Kalkulasi */}
                    {result && (
                        <>
                            {/* Panel Nutrisi Aktual */}
                            <div className="neu-flat rounded-3xl p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Kandungan Nutrisi Ransum</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {nutrientRows.map(row => {
                                        const actual = (result.actualNutrients as any)[row.key];
                                        const nrcData = row.nrcKey && result.nrcComparison?.analysis?.[row.nrcKey];
                                        const met = nrcData ? nrcData.met : null;

                                        return (
                                            <div key={row.key} className={`neu-pressed rounded-2xl p-4 ${met === true ? 'border border-green-300 bg-green-50/40' : met === false ? 'border border-rose-300 bg-rose-50/40' : ''}`}>
                                                <p className="text-xs text-gray-500 font-medium mb-1">{row.label}</p>
                                                <p className="text-xl font-bold text-gray-800">{actual}<span className="text-xs text-gray-400 ml-1">{row.unit}</span></p>
                                                {nrcData && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {met ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                                                        <span className={`text-xs font-semibold ${met ? 'text-green-600' : 'text-rose-500'}`}>
                                                            {met ? '+' : ''}{nrcData.gap} dari {nrcData.required}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Panel LCR + Status NRC */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* LCR */}
                                <div className="neu-flat rounded-3xl p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-teal-500" />
                                        Biaya Ransum (LCR)
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="neu-pressed rounded-2xl p-4">
                                            <p className="text-sm text-gray-500">Biaya per kg Ransum</p>
                                            <p className="text-2xl font-bold text-gray-800">Rp {result.lcr.costPerKgRation.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="neu-pressed rounded-2xl p-4">
                                            <p className="text-sm text-gray-500">Biaya per 100 kg Ransum</p>
                                            <p className="text-2xl font-bold text-[#00bfa5]">Rp {result.lcr.costPer100kg.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Kontribusi Biaya per Bahan</p>
                                        {result.rationDetails.map((r: any) => (
                                            <div key={r.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{r.name} ({r.percentage}%)</span>
                                                <span className="font-semibold text-gray-800">Rp {r.costContribution.toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status NRC */}
                                {result.nrcComparison ? (
                                    <div className="neu-flat rounded-3xl p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">Analisis Standar NRC</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {result.nrcComparison.standard.species} — {result.nrcComparison.standard.stage} ({result.nrcComparison.standard.weightRange} kg)
                                        </p>
                                        <div className={`rounded-2xl p-4 mb-4 font-bold text-center text-sm ${result.nrcComparison.overallStatus?.includes('BELUM') ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
                                            {result.nrcComparison.overallStatus}
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(result.nrcComparison.analysis).map(([key, val]: [string, any]) => (
                                                <div key={key} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-gray-800">{val.actual}</span>
                                                        <span className="text-gray-400">/ {val.required}</span>
                                                        {val.met ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="neu-flat rounded-3xl p-6 flex flex-col items-center justify-center text-center text-gray-400">
                                        <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                                        <p className="text-sm">Pilih standar NRC di atas untuk melihat analisis kesesuaian nutrisi.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
