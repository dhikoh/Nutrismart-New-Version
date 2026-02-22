import React, { useState } from 'react';
import { NeuCard } from './NeuCard';
import { Bot, Send, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export function AiAssistant() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setResponse(null);

        try {
            const res = await api.post('/api/internal/ai/ask', { prompt });
            setResponse(res.data.recommendation);
        } catch (err: any) {
            console.error(err);
            setError('Failed to reach AI Core. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <NeuCard className="mt-8 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-10" />

            <div className="flex items-center gap-3">
                <div className="p-3 neu-pressed rounded-full">
                    <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">PediaVet AI Assistant</h2>
                    <p className="text-sm text-gray-500">Ask recommendations based on your farm's realtime data.</p>
                </div>
            </div>

            <form onSubmit={handleAskAI} className="flex flex-col gap-3 mt-4">
                <textarea
                    className="w-full h-24 p-4 neu-pressed bg-[#ecf0f3] rounded-xl outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-700 resize-none transition-shadow"
                    placeholder="e.g., 'What feed is best for my cows right now?' or 'How to isolate potentially sick livestock?'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="self-end px-6 py-2 neu-button rounded-xl font-bold flex items-center gap-2 text-purple-700 hover:text-purple-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                            Analyzing Data...
                        </>
                    ) : (
                        <>
                            Ask AI <Send className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}

            {response && (
                <div className="mt-4 p-5 neu-flat bg-purple-50 rounded-2xl border border-purple-100 relative">
                    <Sparkles className="absolute top-4 right-4 text-purple-300 w-5 h-5" />
                    <h3 className="text-sm font-bold text-purple-800 mb-2">AI Recommendation</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{response}</p>
                    <p className="text-xs text-purple-400 mt-4 italic text-right">Always verify with a certified veterinarian.</p>
                </div>
            )}
        </NeuCard>
    );
}
