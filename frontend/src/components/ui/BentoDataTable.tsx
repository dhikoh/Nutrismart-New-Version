import React from 'react';
import { BentoCard } from './BentoCard';
import { cn } from '@/lib/utils';

interface Column<T> {
    key: keyof T | string;
    header: React.ReactNode;
    render?: (item: T) => React.ReactNode;
    className?: string; // Add custom styling support for columns
}

interface BentoDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    className?: string;
}

export function BentoDataTable<T>({ data, columns, keyExtractor, emptyMessage = "No records found", className }: BentoDataTableProps<T>) {
    return (
        <BentoCard padding="none" className={cn("overflow-hidden border border-slate-200 shadow-sm", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((col, index) => (
                                <th key={String(col.key) + index} className={cn("px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                            <span className="text-xl">📭</span>
                                        </div>
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={keyExtractor(row)} className="hover:bg-slate-50/80 transition-colors group">
                                    {columns.map((col, index) => (
                                        <td key={String(col.key) + index} className={cn("px-6 py-4 align-middle text-sm text-slate-700", col.className)}>
                                            {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </BentoCard>
    );
}
