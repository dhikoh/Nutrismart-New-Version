import React from 'react';
import { NeuCard } from '@/components/ui/NeuCard';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Tenant Settings</h1>
                <p className="text-gray-500 mt-2">Configure your farm profile and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <NeuCard>
                    <h3 className="font-bold text-gray-700 mb-4">Farm Profile</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Update your farm's public information and contact details.</p>
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Form Placeholder</span>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard>
                    <h3 className="font-bold text-gray-700 mb-4">Integrations & API</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Manage your Webhooks, API Keys, and 3rd party integrations.</p>
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Config Placeholder</span>
                        </div>
                    </div>
                </NeuCard>
            </div>
        </div>
    );
}
