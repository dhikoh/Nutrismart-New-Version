"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
    Calculator, Plus, Trash2, ChevronRight, CheckCircle, XCircle,
    AlertCircle, Loader2, Wallet, Database, Edit3, X, Save
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedIngredient {
    id: string;
    name: string;
    tenantId: string | null;
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

interface RationItem { ingredientId: string; name: string; percentage: number; }

interface CalcResult {
    rationDetails: any[];
    actualNutrients: { dryMatter: number; crudeProtein: number; crudeFat: number; crudeFiber: number; calcium: number; phosphorus: number; metabolizableEnergy: number; };
    lcr: { costPerKgRation: number; costPer100kg: number };
    nrcComparison: any | null;
}

const EMPTY_FEED = { name: '', dryMatter: 0, crudeProtein: 0, metabolizableEnergy: 0, crudeFiber: 0, crudeFat: 0, ash: 0, calcium: 0, phosphorus: 0, pricePerKg: 0 };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NutritionPage() {
    const [tab, setTab] = useState<'calc' | 'manage'>('calc');
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState<FeedIngredient[]>([]);
    const [nrcStandards, setNrcStandards] = useState<NrcStandard[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [r1, r2] = await Promise.all([
                api.get('/api/internal/nutrition/ingredients'),
                api.get('/api/internal/nutrition/nrc-standards'),
            ]);
            setIngredients(r1.data || []);
            setNrcStandards(r2.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-[#00bfa5]" />
                        Kalkulator Gizi & Formulasi Ransum
                    </h1>
                    <p className="text-gray-500 mt-1">Formulasikan ransum berbasis persentase dan bandingkan dengan standar NRC.</p>
                </div>
                {/* Tab Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 shrink-0">
                    <button onClick={() => setTab('calc')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'calc' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Calculator className="w-4 h-4 inline mr-1.5" /> Kalkulator
                    </button>
                    <button onClick={() => setTab('manage')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'manage' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Database className="w-4 h-4 inline mr-1.5" /> Kelola Bahan
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
            ) : tab === 'calc' ? (
                <CalculatorTab ingredients={ingredients} nrcStandards={nrcStandards} />
            ) : (
                <ManageTab ingredients={ingredients} onRefresh={fetchData} />
            )}
        </div>
    );
}

// ─── Calculator Tab ───────────────────────────────────────────────────────────
function CalculatorTab({ ingredients, nrcStandards }: { ingredients: FeedIngredient[]; nrcStandards: NrcStandard[] }) {
    const [ration, setRation] = useState<RationItem[]>([]);
    const [selectedNrcId, setSelectedNrcId] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<CalcResult | null>(null);
    const [error, setError] = useState('');

    const totalPct = ration.reduce((s, i) => s + i.percentage, 0);

    function addIngredient(ing: FeedIngredient) {
        if (ration.find(r => r.ingredientId === ing.id)) return;
        setRation(prev => [...prev, { ingredientId: ing.id, name: ing.name, percentage: 0 }]);
        setResult(null);
    }

    function updatePct(id: string, v: number) {
        setRation(prev => prev.map(r => r.ingredientId === id ? { ...r, percentage: v } : r));
        setResult(null);
    }

    function removeItem(id: string) { setRation(prev => prev.filter(r => r.ingredientId !== id)); setResult(null); }

    async function handleCalc() {
        setError('');
        if (!ration.length) { setError('Tambahkan minimal satu bahan.'); return; }
        if (Math.abs(totalPct - 100) > 0.01) { setError(`Total harus 100% (saat ini: ${totalPct.toFixed(1)}%)`); return; }
        setCalculating(true);
        try {
            const res = await api.post('/api/internal/nutrition/calculate-ration', {
                items: ration.map(r => ({ ingredientId: r.ingredientId, percentage: r.percentage })),
                targetNrcId: selectedNrcId || undefined,
            });
            setResult(res.data);
        } catch (e: any) { setError(e.response?.data?.message || 'Kalkulasi gagal.'); }
        finally { setCalculating(false); }
    }

    const nutrientRows = [
        { label: 'Bahan Kering (BK)', key: 'dryMatter', unit: '%', nrcKey: 'dryMatter' },
        { label: 'Protein Kasar (PK)', key: 'crudeProtein', unit: '%', nrcKey: 'crudeProtein' },
        { label: 'Energi Metabolis', key: 'metabolizableEnergy', unit: 'Kcal/kg', nrcKey: 'metabolizableEnergy' },
        { label: 'Lemak Kasar (LK)', key: 'crudeFat', unit: '%', nrcKey: null },
        { label: 'Serat Kasar (SK)', key: 'crudeFiber', unit: '%', nrcKey: null },
        { label: 'Kalsium (Ca)', key: 'calcium', unit: '%', nrcKey: 'calcium' },
        { label: 'Fosfor (P)', key: 'phosphorus', unit: '%', nrcKey: 'phosphorus' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bahan Baku */}
            <div className="lg:col-span-1 neu-flat rounded-3xl p-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">Daftar Bahan Baku</h2>
                <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                    {ingredients.map(ing => (
                        <button key={ing.id} onClick={() => addIngredient(ing)}
                            disabled={!!ration.find(r => r.ingredientId === ing.id)}
                            className="w-full text-left neu-pressed rounded-2xl p-3 hover:bg-teal-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm leading-tight">{ing.name}</p>
                                    <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                                        <span>PK: {ing.crudeProtein}%</span>
                                        <span>ME: {ing.metabolizableEnergy}</span>
                                        <span>Rp{Number(ing.pricePerKg).toLocaleString('id')}/kg</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
                            </div>
                        </button>
                    ))}
                    {!ingredients.length && (
                        <p className="text-center py-8 text-sm text-gray-400">Belum ada bahan baku. Jalankan Seeder di Backend.</p>
                    )}
                </div>
            </div>

            {/* Workspace */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="neu-flat rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold text-gray-800">Komposisi Ransum</h2>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(totalPct - 100) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            Total: {totalPct.toFixed(1)}%
                        </span>
                    </div>

                    {!ration.length ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                            <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Klik bahan di kiri untuk menambahkan.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {ration.map(item => (
                                <div key={item.ingredientId} className="neu-pressed rounded-2xl p-4 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                    </div>
                                    <input type="number" min={0} max={100} step={0.1} value={item.percentage}
                                        onChange={e => updatePct(item.ingredientId, parseFloat(e.target.value) || 0)}
                                        className="w-20 text-center bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-sm font-bold outline-none focus:border-teal-400" />
                                    <span className="text-gray-400 text-sm">%</span>
                                    <button onClick={() => removeItem(item.ingredientId)} className="text-rose-400 hover:text-rose-600 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <select value={selectedNrcId} onChange={e => setSelectedNrcId(e.target.value)}
                            className="flex-1 neu-pressed rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none text-gray-700">
                            <option value="">-- Pilih Standar NRC (opsional) --</option>
                            {nrcStandards.map(s => <option key={s.id} value={s.id}>{s.species} — {s.stage} ({s.weightRange}kg)</option>)}
                        </select>
                        <button onClick={handleCalc} disabled={calculating || !ration.length}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#00bfa5] hover:bg-teal-600 transition-colors flex items-center gap-2 disabled:opacity-60 shrink-0">
                            {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                            Hitung Ransum
                        </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-rose-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                </div>

                {/* Hasil */}
                {result && (
                    <>
                        <div className="neu-flat rounded-3xl p-6">
                            <h3 className="text-base font-bold text-gray-800 mb-4">Kandungan Nutrisi Ransum</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {nutrientRows.map(row => {
                                    const actual = (result.actualNutrients as any)[row.key];
                                    const nrcData = row.nrcKey && result.nrcComparison?.analysis?.[row.nrcKey];
                                    const met = nrcData ? nrcData.met : null;
                                    return (
                                        <div key={row.key} className={`neu-pressed rounded-2xl p-4 ${met === true ? 'border border-green-300' : met === false ? 'border border-rose-300' : ''}`}>
                                            <p className="text-xs text-gray-400 font-medium mb-1 leading-tight">{row.label}</p>
                                            <p className="text-xl font-bold text-gray-800">{actual}<span className="text-xs text-gray-400 ml-1">{row.unit}</span></p>
                                            {nrcData && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    {met ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                                                    <span className={`text-xs font-semibold ${met ? 'text-green-600' : 'text-rose-500'}`}>{nrcData.gap >= 0 ? '+' : ''}{nrcData.gap}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="neu-flat rounded-3xl p-6">
                                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-teal-500" />Biaya LCR</h3>
                                <div className="space-y-3">
                                    <div className="neu-pressed rounded-2xl p-3">
                                        <p className="text-xs text-gray-400">Per kg Ransum</p>
                                        <p className="text-xl font-bold text-gray-800">Rp {result.lcr.costPerKgRation.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="neu-pressed rounded-2xl p-3">
                                        <p className="text-xs text-gray-400">Per 100 kg Ransum</p>
                                        <p className="text-xl font-bold text-[#00bfa5]">Rp {result.lcr.costPer100kg.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1.5">
                                    {result.rationDetails.map((r: any) => (
                                        <div key={r.id} className="flex justify-between text-xs">
                                            <span className="text-gray-500">{r.name} ({r.percentage}%)</span>
                                            <span className="font-semibold">Rp {r.costContribution.toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {result.nrcComparison ? (
                                <div className="neu-flat rounded-3xl p-6">
                                    <h3 className="text-base font-bold text-gray-800 mb-1">Analisis NRC</h3>
                                    <p className="text-xs text-gray-400 mb-3">{result.nrcComparison.standard.species} — {result.nrcComparison.standard.stage} ({result.nrcComparison.standard.weightRange}kg)</p>
                                    <div className={`rounded-xl p-3 mb-3 text-center text-sm font-bold ${result.nrcComparison.overallStatus?.includes('BELUM') ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
                                        {result.nrcComparison.overallStatus}
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(result.nrcComparison.analysis).map(([key, val]: [string, any]) => (
                                            <div key={key} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 capitalize text-xs">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-xs">{val.actual}</span>
                                                    <span className="text-gray-300 text-xs">/ {val.required}</span>
                                                    {val.met ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="neu-flat rounded-3xl p-6 flex flex-col items-center justify-center text-center text-gray-400 text-sm">
                                    <AlertCircle className="w-8 h-8 mb-2 opacity-30" />
                                    <p>Pilih standar NRC untuk melihat analisis kesesuaian.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Manage Tab ───────────────────────────────────────────────────────────────
function ManageTab({ ingredients, onRefresh }: { ingredients: FeedIngredient[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FEED });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    function startEdit(ing: FeedIngredient) {
        setEditId(ing.id);
        setForm({ name: ing.name, dryMatter: ing.dryMatter, crudeProtein: ing.crudeProtein, metabolizableEnergy: ing.metabolizableEnergy, crudeFiber: ing.crudeFiber, crudeFat: ing.crudeFat, ash: ing.ash, calcium: ing.calcium, phosphorus: ing.phosphorus, pricePerKg: ing.pricePerKg });
        setShowForm(true);
    }

    function startNew() { setEditId(null); setForm({ ...EMPTY_FEED }); setShowForm(true); }

    async function handleSave() {
        setError(''); setSaving(true);
        try {
            if (editId) {
                await api.patch(`/api/internal/nutrition/ingredients/${editId}`, form);
            } else {
                await api.post('/api/internal/nutrition/ingredients', form);
            }
            setShowForm(false); onRefresh();
        } catch (e: any) { setError(e.response?.data?.message || 'Gagal menyimpan.'); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Hapus bahan "${name}"? Data master global tidak bisa dihapus.`)) return;
        try { await api.delete(`/api/internal/nutrition/ingredients/${id}`); onRefresh(); }
        catch (e: any) { alert(e.response?.data?.message || 'Gagal menghapus.'); }
    }

    const numFields = [
        { key: 'dryMatter', label: 'Bahan Kering (%)', step: 0.1 },
        { key: 'crudeProtein', label: 'Protein Kasar PK (%)', step: 0.1 },
        { key: 'metabolizableEnergy', label: 'Energi ME (Kcal/kg)', step: 1 },
        { key: 'crudeFiber', label: 'Serat Kasar SK (%)', step: 0.1 },
        { key: 'crudeFat', label: 'Lemak Kasar LK (%)', step: 0.1 },
        { key: 'ash', label: 'Abu (%)', step: 0.1 },
        { key: 'calcium', label: 'Kalsium Ca (%)', step: 0.001 },
        { key: 'phosphorus', label: 'Fosfor P (%)', step: 0.001 },
        { key: 'pricePerKg', label: 'Harga/kg (Rp)', step: 100 },
    ];

    return (
        <div className="space-y-6">
            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Bahan Pakan' : 'Tambah Bahan Pakan Baru'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Bahan</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" placeholder="Contoh: Jagung Kuning Lokal" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {numFields.map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                                        <input type="number" step={f.step} min={0}
                                            value={(form as any)[f.key]}
                                            onChange={e => setForm(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-[#00bfa5] text-white text-sm font-bold hover:bg-teal-600 flex items-center justify-center gap-2 disabled:opacity-60">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Simpan Perubahan' : 'Tambah Bahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Database Bahan Pakan</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Total {ingredients.length} bahan. Data Master Global tidak bisa dihapus.</p>
                </div>
                <button onClick={startNew} className="px-5 py-2.5 rounded-xl bg-[#00bfa5] text-white font-bold text-sm flex items-center gap-2 hover:bg-teal-600">
                    <Plus className="w-4 h-4" /> Tambah Bahan
                </button>
            </div>

            {/* Table */}
            <div className="neu-flat rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 font-semibold text-gray-500">Nama Bahan</th>
                                <th className="text-center px-4 py-4 font-semibold text-gray-500">BK%</th>
                                <th className="text-center px-4 py-4 font-semibold text-gray-500">PK%</th>
                                <th className="text-center px-4 py-4 font-semibold text-gray-500">ME</th>
                                <th className="text-center px-4 py-4 font-semibold text-gray-500">Ca%</th>
                                <th className="text-center px-4 py-4 font-semibold text-gray-500">P%</th>
                                <th className="text-right px-4 py-4 font-semibold text-gray-500">Rp/kg</th>
                                <th className="text-center px-4 py-4 font-semibold text-gray-500">Sumber</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((ing, i) => (
                                <tr key={ing.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/20'}`}>
                                    <td className="px-6 py-3 font-medium text-gray-800">{ing.name}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{ing.dryMatter}</td>
                                    <td className="px-4 py-3 text-center font-bold text-teal-700">{ing.crudeProtein}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{ing.metabolizableEnergy}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{ing.calcium}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{ing.phosphorus}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-700">Rp {Number(ing.pricePerKg).toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ing.tenantId ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {ing.tenantId ? 'Milik Saya' : 'Master'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-end">
                                            {ing.tenantId && (
                                                <>
                                                    <button onClick={() => startEdit(ing)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-teal-600 transition-colors">
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(ing.id, ing.name)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
