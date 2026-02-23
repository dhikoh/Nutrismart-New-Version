"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import {
    Calculator, Plus, Trash2, ChevronRight, CheckCircle, XCircle,
    AlertCircle, Loader2, Wallet, Database, Edit3, X, Save,
    Upload, Download, Settings2, RefreshCw
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedIngredient {
    id: string; name: string; tenantId: string | null;
    dryMatter: number; crudeProtein: number; crudeFiber: number; crudeFat: number;
    ash: number; calcium: number; phosphorus: number; metabolizableEnergy: number;
    tdn: number; ndf: number; stock: number; category: string; pricePerKg: number;
}
interface NrcStandard {
    id: string; species: string; stage: string; weightRange: string;
    reqDryMatter: number; reqCrudeProtein: number; reqEnergy: number; reqCalcium: number; reqPhosphorus: number;
}
interface ScoopConfig { ringanKgPerScoop: number; sedangKgPerScoop: number; beratKgPerScoop: number; }
interface RationItem { ingredientId: string; name: string; percentage: number; }
interface CalcResult {
    rationDetails: any[];
    actualNutrients: { dryMatter: number; crudeProtein: number; crudeFat: number; crudeFiber: number; calcium: number; phosphorus: number; metabolizableEnergy: number; };
    lcr: { costPerKgRation: number; costPer100kg: number };
    nrcComparison: any | null;
}

const CATEGORY_COLORS: Record<string, string> = {
    RINGAN: 'bg-blue-100 text-blue-700',
    SEDANG: 'bg-yellow-100 text-yellow-700',
    BERAT: 'bg-purple-100 text-purple-700',
};

const EMPTY_FEED = {
    name: '', dryMatter: 0, crudeProtein: 0, metabolizableEnergy: 0, tdn: 0,
    crudeFiber: 0, crudeFat: 0, ash: 0, calcium: 0, phosphorus: 0, ndf: 0,
    stock: 0, category: 'SEDANG', pricePerKg: 0,
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NutritionPage() {
    const [tab, setTab] = useState<'calc' | 'manage'>('manage');
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
        } catch { /* silent */ } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-[#00bfa5]" />
                        Gudang & Database Pakan
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola database nutrisi pakan dan formulasikan ransum ternak.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 shrink-0">
                    <button onClick={() => setTab('manage')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'manage' ? 'bg-white shadow text-teal-600' : 'text-gray-500'}`}>
                        <Database className="w-4 h-4 inline mr-1.5" /> Data Pakan
                    </button>
                    <button onClick={() => setTab('calc')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'calc' ? 'bg-white shadow text-teal-600' : 'text-gray-500'}`}>
                        <Calculator className="w-4 h-4 inline mr-1.5" /> Kalkulator
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
            ) : tab === 'manage' ? (
                <ManageTab ingredients={ingredients} onRefresh={fetchData} />
            ) : (
                <CalculatorTab ingredients={ingredients} nrcStandards={nrcStandards} />
            )}
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
    const [scoop, setScoop] = useState<ScoopConfig>({ ringanKgPerScoop: 0.275, sedangKgPerScoop: 0.600, beratKgPerScoop: 0.615 });
    const [editScoop, setEditScoop] = useState(false);
    const [savingScoop, setSavingScoop] = useState(false);
    const [importMsg, setImportMsg] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.get('/api/internal/nutrition/scoop-config').then(r => setScoop(r.data)).catch(() => { });
    }, []);

    function startEdit(ing: FeedIngredient) {
        setEditId(ing.id);
        setForm({ name: ing.name, dryMatter: ing.dryMatter, crudeProtein: ing.crudeProtein, metabolizableEnergy: ing.metabolizableEnergy, tdn: ing.tdn, crudeFiber: ing.crudeFiber, crudeFat: ing.crudeFat, ash: ing.ash, calcium: ing.calcium, phosphorus: ing.phosphorus, ndf: ing.ndf, stock: ing.stock, category: ing.category, pricePerKg: ing.pricePerKg });
        setShowForm(true);
    }

    function startNew() { setEditId(null); setForm({ ...EMPTY_FEED }); setShowForm(true); }

    async function handleSave() {
        setError(''); setSaving(true);
        try {
            if (editId) { await api.patch(`/api/internal/nutrition/ingredients/${editId}`, form); }
            else { await api.post('/api/internal/nutrition/ingredients', form); }
            setShowForm(false); onRefresh();
        } catch (e: any) { setError(e.response?.data?.message || 'Gagal menyimpan.'); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Hapus "${name}"?`)) return;
        try { await api.delete(`/api/internal/nutrition/ingredients/${id}`); onRefresh(); }
        catch (e: any) { alert(e.response?.data?.message || 'Gagal menghapus.'); }
    }

    async function handleExport() {
        try {
            const res = await api.get('/api/internal/nutrition/ingredients/export');
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'database-pakan.json'; a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Gagal export.'); }
    }

    async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.data || [];
            const res = await api.post('/api/internal/nutrition/ingredients/import', { items });
            setImportMsg(res.data.message); onRefresh();
            setTimeout(() => setImportMsg(''), 5000);
        } catch { alert('File JSON tidak valid.'); }
        if (fileRef.current) fileRef.current.value = '';
    }

    async function handleGenerateMaster() {
        if (!confirm('Salin semua data master global ke database pakan Anda? Data yang sudah ada tidak akan diduplikat.')) return;
        const masterItems = ingredients.filter(i => !i.tenantId);
        try {
            const res = await api.post('/api/internal/nutrition/ingredients/import', {
                items: masterItems.map(i => ({
                    name: i.name, dryMatter: i.dryMatter, crudeProtein: i.crudeProtein,
                    crudeFiber: i.crudeFiber, crudeFat: i.crudeFat, ash: i.ash,
                    calcium: i.calcium, phosphorus: i.phosphorus, metabolizableEnergy: i.metabolizableEnergy,
                    tdn: i.tdn, ndf: i.ndf, stock: 0, category: i.category || 'SEDANG', pricePerKg: Number(i.pricePerKg),
                }))
            });
            setImportMsg(res.data.message); onRefresh();
            setTimeout(() => setImportMsg(''), 5000);
        } catch { alert('Gagal generate dari master.'); }
    }

    async function handleSaveScoop() {
        setSavingScoop(true);
        try { await api.patch('/api/internal/nutrition/scoop-config', scoop); setEditScoop(false); }
        catch { alert('Gagal menyimpan konfigurasi scoop.'); }
        finally { setSavingScoop(false); }
    }

    const numFields = [
        { key: 'dryMatter', label: 'BK (%)' }, { key: 'crudeProtein', label: 'PK (%)' },
        { key: 'metabolizableEnergy', label: 'ME (Kcal/kg)' }, { key: 'tdn', label: 'TDN (%)' },
        { key: 'crudeFiber', label: 'SK (%)' }, { key: 'crudeFat', label: 'Lemak (%)' },
        { key: 'ash', label: 'Abu (%)' }, { key: 'calcium', label: 'Ca (%)' },
        { key: 'phosphorus', label: 'P (%)' }, { key: 'ndf', label: 'NDF (%)' },
        { key: 'stock', label: 'Stok (kg)' }, { key: 'pricePerKg', label: 'Harga/kg (Rp)' },
    ];

    const tenantFeeds = ingredients.filter(i => i.tenantId);
    const masterFeeds = ingredients.filter(i => !i.tenantId);

    return (
        <div className="flex gap-6">
            {/* Main Table Area */}
            <div className="flex-1 min-w-0">
                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold">{editId ? 'Edit Bahan Pakan' : 'Tambah Bahan Pakan'}</h3>
                                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Bahan *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                                    <div className="flex gap-2">
                                        {['RINGAN', 'SEDANG', 'BERAT'].map(c => (
                                            <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                                                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${form.category === c ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {numFields.map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                                            <input type="number" step="any" min={0} value={(form as any)[f.key]}
                                                onChange={e => setForm(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Batal</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-[#00bfa5] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editId ? 'Simpan' : 'Tambah'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 neu-button rounded-xl text-sm font-semibold text-gray-600 hover:text-teal-600">
                        <Upload className="w-4 h-4" /> Import JSON
                    </button>
                    <button onClick={handleGenerateMaster} className="flex items-center gap-1.5 px-4 py-2 neu-button rounded-xl text-sm font-semibold text-gray-600 hover:text-purple-600">
                        <RefreshCw className="w-4 h-4" /> Generate Pakan Umum
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 neu-button rounded-xl text-sm font-semibold text-gray-600 hover:text-teal-600">
                        <Download className="w-4 h-4" /> Export JSON
                    </button>
                    <div className="flex-1" />
                    <button onClick={startNew} className="flex items-center gap-2 px-5 py-2 bg-[#00bfa5] text-white rounded-xl text-sm font-bold hover:bg-teal-600">
                        <Plus className="w-4 h-4" /> Tambah Pakan
                    </button>
                </div>

                {importMsg && (
                    <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />{importMsg}
                    </div>
                )}

                {/* Database Saya */}
                <div className="neu-flat rounded-3xl overflow-hidden mb-4">
                    <div className="px-6 py-3 bg-teal-50 border-b border-teal-100">
                        <h3 className="font-bold text-teal-800 text-sm">Database Pakan Saya ({tenantFeeds.length} bahan)</h3>
                        <p className="text-xs text-teal-600 mt-0.5">Data khusus milik akun Anda — bisa diedit, dihapus, diimport/export.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left font-semibold w-8">No</th>
                                    <th className="px-4 py-3 text-left font-semibold min-w-[160px]">Nama Pakan</th>
                                    <th className="px-4 py-3 text-right font-semibold">Harga</th>
                                    <th className="px-4 py-3 text-right font-semibold">Stok</th>
                                    <th className="px-4 py-3 text-center font-semibold">Kategori</th>
                                    <th className="px-4 py-3 text-center font-semibold">BK%</th>
                                    <th className="px-4 py-3 text-center font-semibold">PK%</th>
                                    <th className="px-4 py-3 text-center font-semibold">TON%</th>
                                    <th className="px-4 py-3 text-center font-semibold">Lemak%</th>
                                    <th className="px-4 py-3 text-center font-semibold">Ca%</th>
                                    <th className="px-4 py-3 text-center font-semibold">P%</th>
                                    <th className="px-4 py-3 text-center font-semibold">NDF%</th>
                                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenantFeeds.length === 0 ? (
                                    <tr><td colSpan={13} className="text-center py-8 text-gray-400">
                                        Belum ada data. Klik "Tambah Pakan" atau "Generate Pakan Umum".
                                    </td></tr>
                                ) : tenantFeeds.map((ing, i) => (
                                    <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                                        <td className="px-4 py-2.5 font-semibold text-gray-800">{ing.name}</td>
                                        <td className="px-4 py-2.5 text-right text-teal-700 font-bold">Rp {Number(ing.pricePerKg).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-2.5 text-right text-gray-600">{+ing.stock.toFixed(1)} kg</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full font-bold ${CATEGORY_COLORS[ing.category] || 'bg-gray-100 text-gray-600'}`}>
                                                {ing.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{ing.dryMatter}%</td>
                                        <td className="px-4 py-2.5 text-center font-bold text-teal-700">{ing.crudeProtein}%</td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{ing.tdn}%</td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{ing.crudeFat}%</td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{ing.calcium}%</td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{ing.phosphorus}%</td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{ing.ndf}%</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <button onClick={() => startEdit(ing)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(ing.id, ing.name)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Master Presets (Read-only) */}
                {masterFeeds.length > 0 && (
                    <div className="neu-flat rounded-3xl overflow-hidden opacity-80">
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-bold text-gray-600 text-sm">Database Master Global ({masterFeeds.length} bahan)</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Data referensi bawaan sistem — hanya baca. Gunakan "Generate Pakan Umum" untuk menyalinnya ke database Anda.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase tracking-wide">
                                        <th className="px-4 py-3 text-left font-semibold w-8">No</th>
                                        <th className="px-4 py-3 text-left font-semibold">Nama Pakan</th>
                                        <th className="px-4 py-3 text-right font-semibold">Harga</th>
                                        <th className="px-4 py-3 text-center font-semibold">BK%</th>
                                        <th className="px-4 py-3 text-center font-semibold">PK%</th>
                                        <th className="px-4 py-3 text-center font-semibold">Ca%</th>
                                        <th className="px-4 py-3 text-center font-semibold">P%</th>
                                        <th className="px-4 py-3 text-center font-semibold">Sumber</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {masterFeeds.map((ing, i) => (
                                        <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                                            <td className="px-4 py-2.5 text-gray-300">{i + 1}</td>
                                            <td className="px-4 py-2.5 text-gray-600">{ing.name}</td>
                                            <td className="px-4 py-2.5 text-right text-gray-500">Rp {Number(ing.pricePerKg).toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-2.5 text-center text-gray-500">{ing.dryMatter}%</td>
                                            <td className="px-4 py-2.5 text-center text-gray-600 font-semibold">{ing.crudeProtein}%</td>
                                            <td className="px-4 py-2.5 text-center text-gray-500">{ing.calcium}%</td>
                                            <td className="px-4 py-2.5 text-center text-gray-500">{ing.phosphorus}%</td>
                                            <td className="px-4 py-2.5 text-center"><span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-semibold">Master</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Scoop Config Sidebar */}
            <div className="w-72 shrink-0">
                <div className="neu-flat rounded-3xl p-5 sticky top-4">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-teal-500" /> Konfigurasi Scoop (Gayung)
                        </h3>
                        {!editScoop && (
                            <button onClick={() => setEditScoop(true)} className="text-xs text-teal-600 font-semibold hover:underline">Edit Konfigurasi</button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Nilai konversi digunakan untuk menghitung jumlah scoop berdasarkan kebutuhan pakan ternak.</p>

                    <div className="space-y-3">
                        {[
                            { key: 'ringanKgPerScoop', label: 'Kategori Ringan', color: 'text-blue-600 bg-blue-50' },
                            { key: 'sedangKgPerScoop', label: 'Kategori Sedang', color: 'text-yellow-600 bg-yellow-50' },
                            { key: 'beratKgPerScoop', label: 'Kategori Berat', color: 'text-purple-600 bg-purple-50' },
                        ].map(({ key, label, color }) => (
                            <div key={key} className={`rounded-2xl p-3 ${color}`}>
                                <p className="text-xs font-semibold mb-1">{label}</p>
                                {editScoop ? (
                                    <div className="flex items-center gap-1">
                                        <input type="number" step="0.001" min="0"
                                            value={(scoop as any)[key]}
                                            onChange={e => setScoop(s => ({ ...s, [key]: parseFloat(e.target.value) || 0 }))}
                                            className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold outline-none" />
                                        <span className="text-xs font-semibold">kg/scoop</span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold">{(scoop as any)[key]} <span className="text-xs font-semibold opacity-70">kg/scoop</span></p>
                                )}
                            </div>
                        ))}
                    </div>

                    {editScoop && (
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setEditScoop(false)} className="flex-1 py-2 text-xs rounded-xl border border-gray-200 text-gray-500 font-semibold">Batal</button>
                            <button onClick={handleSaveScoop} disabled={savingScoop}
                                className="flex-1 py-2 text-xs rounded-xl bg-teal-500 text-white font-bold flex items-center justify-center gap-1">
                                {savingScoop ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Simpan
                            </button>
                        </div>
                    )}
                </div>
            </div>
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
    function updatePct(id: string, v: number) { setRation(prev => prev.map(r => r.ingredientId === id ? { ...r, percentage: v } : r)); setResult(null); }
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
        { label: 'Lemak Kasar', key: 'crudeFat', unit: '%', nrcKey: null },
        { label: 'Serat Kasar', key: 'crudeFiber', unit: '%', nrcKey: null },
        { label: 'Kalsium (Ca)', key: 'calcium', unit: '%', nrcKey: 'calcium' },
        { label: 'Fosfor (P)', key: 'phosphorus', unit: '%', nrcKey: 'phosphorus' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 neu-flat rounded-3xl p-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">Pilih Bahan Baku</h2>
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
                                        <span className={`px-1.5 rounded-full font-bold ${CATEGORY_COLORS[ing.category] || 'bg-gray-100 text-gray-500'}`}>{ing.category || 'SEDANG'}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-teal-400" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="neu-flat rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold">Komposisi Ransum</h2>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(totalPct - 100) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>Total: {totalPct.toFixed(1)}%</span>
                    </div>
                    {!ration.length ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                            <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Klik bahan di kiri untuk mulai merangkai ransum.</p>
                        </div>
                    ) : ration.map(item => (
                        <div key={item.ingredientId} className="neu-pressed rounded-2xl p-4 flex items-center gap-3 mb-2">
                            <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{item.name}</p></div>
                            <input type="number" min={0} max={100} step={0.1} value={item.percentage}
                                onChange={e => updatePct(item.ingredientId, parseFloat(e.target.value) || 0)}
                                className="w-20 text-center bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-sm font-bold outline-none focus:border-teal-400" />
                            <span className="text-gray-400 text-sm">%</span>
                            <button onClick={() => removeItem(item.ingredientId)} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <div className="mt-4 flex gap-3">
                        <select value={selectedNrcId} onChange={e => setSelectedNrcId(e.target.value)} className="flex-1 neu-pressed rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none text-gray-700">
                            <option value="">-- Pilih Standar NRC (opsional) --</option>
                            {nrcStandards.map(s => <option key={s.id} value={s.id}>{s.species} — {s.stage} ({s.weightRange}kg)</option>)}
                        </select>
                        <button onClick={handleCalc} disabled={calculating || !ration.length}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#00bfa5] hover:bg-teal-600 flex items-center gap-2 disabled:opacity-60 shrink-0">
                            {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Hitung
                        </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-rose-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                </div>

                {result && (
                    <>
                        <div className="neu-flat rounded-3xl p-6">
                            <h3 className="text-base font-bold mb-4">Kandungan Nutrisi Ransum</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {nutrientRows.map(row => {
                                    const actual = (result.actualNutrients as any)[row.key];
                                    const nrcData = row.nrcKey && result.nrcComparison?.analysis?.[row.nrcKey];
                                    const met = nrcData ? nrcData.met : null;
                                    return (
                                        <div key={row.key} className={`neu-pressed rounded-2xl p-4 ${met === true ? 'border border-green-300' : met === false ? 'border border-rose-300' : ''}`}>
                                            <p className="text-xs text-gray-400 mb-1 leading-tight">{row.label}</p>
                                            <p className="text-xl font-bold">{actual}<span className="text-xs text-gray-400 ml-1">{row.unit}</span></p>
                                            {nrcData && <div className="flex items-center gap-1 mt-1">
                                                {met ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                                                <span className={`text-xs font-semibold ${met ? 'text-green-600' : 'text-rose-500'}`}>{nrcData.gap >= 0 ? '+' : ''}{nrcData.gap}</span>
                                            </div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="neu-flat rounded-3xl p-6">
                                <h3 className="text-base font-bold mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-teal-500" />Biaya LCR</h3>
                                <div className="neu-pressed rounded-2xl p-3 mb-2"><p className="text-xs text-gray-400">Per kg</p><p className="text-xl font-bold">Rp {result.lcr.costPerKgRation.toLocaleString('id-ID')}</p></div>
                                <div className="neu-pressed rounded-2xl p-3"><p className="text-xs text-gray-400">Per 100 kg</p><p className="text-xl font-bold text-[#00bfa5]">Rp {result.lcr.costPer100kg.toLocaleString('id-ID')}</p></div>
                            </div>
                            {result.nrcComparison ? (
                                <div className="neu-flat rounded-3xl p-6">
                                    <h3 className="text-base font-bold mb-2">Analisis NRC</h3>
                                    <div className={`rounded-xl p-2.5 mb-3 text-center text-sm font-bold ${result.nrcComparison.overallStatus?.includes('BELUM') ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>{result.nrcComparison.overallStatus}</div>
                                    {Object.entries(result.nrcComparison.analysis).map(([key, val]: [string, any]) => (
                                        <div key={key} className="flex justify-between items-center text-xs mb-1.5">
                                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold">{val.actual}</span><span className="text-gray-300">/ {val.required}</span>
                                                {val.met ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="neu-flat rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 text-sm text-center">
                                    <AlertCircle className="w-8 h-8 mb-2 opacity-30" /><p>Pilih standar NRC untuk analisis kesesuaian.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
