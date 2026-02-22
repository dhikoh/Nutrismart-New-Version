import React from 'react';
import { NeuCard } from '@/components/ui/NeuCard';

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Financial Records</h1>
                    <p className="text-gray-500 mt-2">Track income, expenses, and overall profitability.</p>
                </div>
                <button className="neu-button px-6 py-3 rounded-xl font-bold text-green-500 hover:text-green-600">
                    + Record Transaction
                </button>
            </div>

            <NeuCard className="mt-8">
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-400 font-medium">Financial Data Table Placeholder</p>
                </div>
            </NeuCard>
        </div>
    );
}
