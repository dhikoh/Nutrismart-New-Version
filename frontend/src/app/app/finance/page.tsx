'use client';

import React, { useState, useEffect } from 'react';
import { NeuCard } from '@/components/ui/NeuCard';
import { api } from '@/lib/api';
import { Wallet, Plus } from 'lucide-react';
import { NeuDataTable } from '@/components/ui/NeuDataTable';
import { useFarmMode } from '@/components/providers/FarmModeProvider';

export default function FinancePage() {
    const { mode } = useFarmMode();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get(`/api/internal/transactions?mode=${mode}`);
                setTransactions(res.data);
            } catch (err) {
                console.error("Failed to load transactions", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [mode]);

    const columns = [
        { key: 'createdAt', header: 'Date', render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
        {
            key: 'type', header: 'Type', render: (row: any) => (
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${row.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                    {row.type}
                </span>
            )
        },
        { key: 'category', header: 'Category' },
        { key: 'amount', header: 'Amount', render: (row: any) => `Rp ${Number(row.amount).toLocaleString()}` },
        { key: 'status', header: 'Status' },
        { key: 'notes', header: 'Notes' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-[#00bfa5]" />
                        Financial Ledger
                    </h1>
                    <p className="text-gray-500 mt-2">Track income, expenses, and overall profitability.</p>
                </div>
                <button className="neu-button px-6 py-3 rounded-xl font-bold text-[#00bfa5] flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Record Transaction
                </button>
            </div>

            {isLoading ? (
                <NeuCard className="mt-8 flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5]"></div>
                </NeuCard>
            ) : (
                <div className="mt-8">
                    <NeuDataTable
                        data={transactions}
                        columns={columns}
                        keyExtractor={(item: any) => item.id}
                        emptyMessage="No financial records found."
                    />
                </div>
            )}
        </div>
    );
}
