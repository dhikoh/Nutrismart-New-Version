import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BentoFileUploadProps {
    onUploadSuccess: (url: string) => void;
    label?: string;
    className?: string;
}

export function BentoFileUpload({ onUploadSuccess, label = "Upload Image/Document", className }: BentoFileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/internal/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const fileUrl = response.data.url;
            setUploadedUrl(fileUrl);
            onUploadSuccess(fileUrl);

        } catch (err) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            setError(error.response?.data?.message || error.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const clearUpload = () => {
        setUploadedUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={cn("w-full", className)}>
            <span className="block text-sm font-semibold text-slate-700 mb-2 pl-1">{label}</span>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf"
            />

            {!uploadedUrl ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-28 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-70 disabled:hover:bg-white disabled:hover:border-slate-300 group shadow-sm"
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-xs font-medium text-slate-500">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-100 transition-colors">
                                <UploadCloud className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700">Click to Browse File</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-100 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-green-800 truncate max-w-[200px]">
                                {uploadedUrl.split('/').pop()}
                            </span>
                            <span className="text-xs text-green-600 font-medium">Uploaded Successfully</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearUpload}
                        className="p-2 hover:bg-green-100 rounded-full text-green-700 transition-colors"
                        title="Remove file"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-2 font-medium pl-1">{error}</p>}
        </div>
    );
}
