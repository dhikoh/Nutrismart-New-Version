"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calculator, Plus, Save, ActivitySquare, AlertCircle } from 'lucide-react';

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

export default function NutritionCalculatorPage() {
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState<FeedIngredient[]>([]);
    const [nrcStandards, setNrcStandards] = useState<NrcStandard[]>([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const resIngredients = await api.get(`/api/internal/nutrition/ingredients`);
                const resNrc = await api.get(`/api/internal/nutrition/nrc-standards`);

                if (resIngredients.data && resNrc.data) {
                    setIngredients(resIngredients.data);
                    setNrcStandards(resNrc.data);
                }
            } catch (error) {
                console.error("Failed to fetch nutrition data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMasterData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-[#00bfa5]" />
                        Nutrition Engine
                    </h1>
                    <p className="text-gray-500 mt-2">Calculate feed formulations and manage feed ingredients.</p>
                </div>
                <div className="flex gap-4">
                    <button className="neu-button px-6 py-2.5 rounded-xl font-medium text-[#00bfa5] flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Formula
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Master Ingredients List */}
                <div className="lg:col-span-1 neu-flat rounded-3xl p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ActivitySquare className="w-5 h-5 text-indigo-500" />
                        Master Ingredients
                    </h2>

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-200 rounded-2xl w-full"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {ingredients.map((item) => (
                                <div key={item.id} className="neu-pressed rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50/50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                                            <span>PK: {item.crudeProtein}%</span>
                                            <span>ME: {item.metabolizableEnergy} Kcal</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#00bfa5]">Rp {Number(item.pricePerKg).toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">/kg</p>
                                    </div>
                                </div>
                            ))}
                            {ingredients.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No master ingredients found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Formulation Workspace */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="neu-flat rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-gray-500" />
                                Ration Composer
                            </h3>
                            <button className="neu-button px-4 py-2 rounded-xl text-sm font-semibold text-[#00bfa5] flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Formula
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 min-h-[250px] flex flex-col items-center justify-center text-center">
                            <p className="text-gray-400 mb-2">Click ingredients from the master list to add them here.</p>
                            <p className="text-sm text-gray-400">You will be able to adjust the quantity (kg) for each ingredient.</p>
                        </div>
                    </div>

                    {/* NRC Comparison Panel */}
                    <div className="neu-flat rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Target NRC Comparison</h3>
                            <select className="neu-pressed rounded-xl px-4 py-2 text-sm bg-transparent outline-none cursor-pointer text-gray-700 font-medium">
                                <option value="">Select NRC Target...</option>
                                {nrcStandards.map(std => (
                                    <option key={std.id} value={std.id}>
                                        {std.species} - {std.stage} ({std.weightRange}kg)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Crude Protein (PK)', 'Energy (ME)', 'Calcium (Ca)', 'Phosphorus (P)'].map((nutrient, idx) => (
                                <div key={idx} className="neu-pressed rounded-2xl p-4 text-center">
                                    <p className="text-xs text-gray-500 font-medium mb-1">{nutrient}</p>
                                    <div className="flex items-end justify-center gap-1">
                                        <p className="text-2xl font-bold text-gray-800">0.0</p>
                                        <p className="text-sm text-gray-400 mb-1">/ 0.0</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                                        <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
