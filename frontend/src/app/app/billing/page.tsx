"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileText, Plus, Receipt, Calendar, CreditCard } from 'lucide-react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
    type: string;
}

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.get(`/api/internal/billing/invoices`);
                if (res.data) {
                    setInvoices(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch billing data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#00bfa5]" />
                        Billing & Invoices
                    </h1>
                    <p className="text-gray-500 mt-2">Manage customer invoices, sales tracking, and purchases.</p>
                </div>
                <div className="flex gap-4">
                    <button className="neu-button px-6 py-2.5 rounded-xl font-medium text-[#00bfa5] flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Statistics Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="neu-flat rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <p className="font-semibold text-gray-600">Total Unpaid</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 mt-4">Rp 0</p>
                        <p className="text-sm text-gray-400 mt-1">Pending payments</p>
                    </div>
                </div>

                {/* Main Invoice Table area */}
                <div className="lg:col-span-3 neu-flat rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            Recent Invoices
                        </h2>
                        {/* Filters can go here */}
                    </div>

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-200 rounded-2xl w-full"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invoices.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-lg">No invoices generated yet.</p>
                                    <p className="text-sm mt-1">Click "Create Invoice" to issue billing to clients.</p>
                                </div>
                            ) : (
                                invoices.map((inv) => (
                                    <div key={inv.id} className="neu-pressed rounded-2xl p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                {inv.type === 'SALE' ? 'SL' : 'PR'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{inv.invoiceNumber}</p>
                                                <p className="text-sm text-gray-500">{inv.customerName || 'Unknown Client'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#00bfa5]">Rp {Number(inv.total).toLocaleString()}</p>
                                            <span className={`inline-block px-3 py-1 mt-1 text-xs font-semibold rounded-full ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                inv.status === 'DRAFT' ? 'bg-gray-200 text-gray-600' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
