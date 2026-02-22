import React from 'react';
import { NeuCard } from './NeuCard';

interface Column<T> {
    key: keyof T | string;
    header: React.ReactNode;
    render?: (item: T) => React.ReactNode;
}

interface NeuDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
}

export function NeuDataTable<T>({ data, columns, keyExtractor, emptyMessage = "No records found" }: NeuDataTableProps<T>) {
    return (
        <NeuCard className="overflow-hidden p-0">
            <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={String(col.key) + index} className="p-4 font-semibold text-gray-500 text-sm border-b-2 border-transparent border-b-[#cbced1]/20">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-400 font-medium">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={keyExtractor(row)} className="hover:bg-gray-50/50 transition-colors group">
                                    {columns.map((col, index) => (
                                        <td key={String(col.key) + index} className="p-4 align-middle text-sm text-gray-700 border-b border-gray-200/50 group-last:border-0">
                                            {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </NeuCard>
    );
}
