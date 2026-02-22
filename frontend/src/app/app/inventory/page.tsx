"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Package, Plus, ClipboardList, Layers } from 'lucide-react';

interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    category: string;
    unit: string;
    stock: number;
    unitPrice: number;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get(`/api/internal/inventory`);
                if (res.data) {
                    setItems(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch inventory data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-[#00bfa5]" />
                        Inventory Hub
                    </h1>
                    <p className="text-gray-500 mt-2">Manage stocks across feed, medicines, seeds, and equipment.</p>
                </div>
                <div className="flex gap-4">
                    <button className="neu-button px-6 py-2.5 rounded-xl font-medium text-[#00bfa5] flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="neu-flat rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-gray-500" />
                        Current Stock Overview
                    </h2>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded-2xl w-full"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg">Inventory is empty.</p>
                                <p className="text-sm mt-1">Start by adding your first trackable item (e.g., vaccines, feed sacks).</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="neu-pressed rounded-2xl p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <div className="flex gap-3 text-sm text-gray-500">
                                                <span>{item.category}</span>
                                                {item.sku && <span>• SKU: {item.sku}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-gray-400">On Hand</p>
                                            <p className="font-bold text-lg text-gray-700">
                                                {item.stock} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
                                            </p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div>
                                            <p className="text-xs text-gray-400">Est. Value/Unit</p>
                                            <p className="font-semibold text-gray-700">Rp {Number(item.unitPrice).toLocaleString()}</p>
                                        </div>
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
