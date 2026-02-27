'use client';

import React, { useState, useEffect } from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { api } from '@/lib/api';
import { Wallet, Plus } from 'lucide-react';
import { BentoDataTable } from '@/components/ui/BentoDataTable';
import { useFarmMode } from '@/components/providers/FarmModeProvider';

export default function FinancePage() {
    const { mode } = useFarmMode();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get(`/api/internal/transactions?mode=${mode}`);
                setTransactions(res.data);
            } catch (err) {
                const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
                setError(errorObj.response?.data?.message || 'Failed to load transactions');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [mode]);

    type FinanceRow = {
        id: string | number;
        createdAt: string | Date;
        type: string;
        amount: string | number;
        [key: string]: unknown;
    };

    const columns = [
        { key: 'createdAt', header: 'Date', render: (row: { createdAt: string | Date }) => new Date(row.createdAt).toLocaleDateString(), className: "text-slate-500" },
        {
            key: 'type', header: 'Type', render: (row: { type: string }) => (
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${row.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {row.type}
                </span>
            )
        },
        { key: 'category', header: 'Category', className: "font-medium text-slate-700" },
        { key: 'amount', header: 'Amount', render: (row: FinanceRow) => <span className="font-semibold text-slate-800">Rp {Number(row.amount).toLocaleString()}</span> },
        { key: 'status', header: 'Status' },
        { key: 'notes', header: 'Notes', className: "text-slate-500 max-w-[200px] truncate" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-outfit tracking-tight">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <Wallet className="w-6 h-6" />
                        </div>
                        Financial Ledger
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Track income, expenses, and overall profitability.</p>
                </div>
                <button className="bento-button-primary px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Record Transaction
                </button>
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
                        <span className="text-sm font-medium text-slate-500">Loading financial records...</span>
                    </div>
                </BentoCard>
            ) : (
                <div className="mt-8 relative">
                    <BentoDataTable
                        data={transactions}
                        columns={columns}
                        keyExtractor={(item: FinanceRow) => item.id}
                        emptyMessage="No financial records found."
                    />
                </div>
            )}
        </div>
    );
}
