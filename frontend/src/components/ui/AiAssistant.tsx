import React, { useState } from 'react';
import { BentoCard } from './BentoCard';
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
        } catch (err) {
            setError('Failed to reach AI Core. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BentoCard className="mt-8 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />

            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl shadow-sm">
                    <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">PediaVet AI Assistant</h2>
                    <p className="text-sm text-slate-500 font-medium">Ask recommendations based on your farm's realtime data.</p>
                </div>
            </div>

            <form onSubmit={handleAskAI} className="flex flex-col gap-3 mt-4 relative z-10">
                <textarea
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 text-slate-800 resize-none transition-all placeholder:text-slate-400 text-sm"
                    placeholder="e.g., 'What feed is best for my cows right now?' or 'How to isolate potentially sick livestock?'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="self-end px-6 py-2.5 bento-button-primary rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all text-sm"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Analyzing Data...
                        </>
                    ) : (
                        <>
                            Ask AI <Send className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {error && <p className="text-red-500 text-sm font-medium mt-1">{error}</p>}

            {response && (
                <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Sparkles className="absolute top-4 right-4 text-purple-300 w-5 h-5" />
                    <h3 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                        AI Recommendation
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{response}</p>
                    <p className="text-[11px] text-purple-400/80 mt-4 italic text-right font-medium">Always verify with a certified veterinarian.</p>
                </div>
            )}
        </BentoCard>
    );
}
