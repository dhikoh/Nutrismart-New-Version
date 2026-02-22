import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface NeuFileUploadProps {
    onUploadSuccess: (url: string) => void;
    label?: string;
}

export function NeuFileUpload({ onUploadSuccess, label = "Upload Image/Document" }: NeuFileUploadProps) {
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
        formData.append('file', file); // 'file' is the field name expected by NestJS FileInterceptor('file')

        try {
            const response = await api.post('/api/internal/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const fileUrl = response.data.url;
            setUploadedUrl(fileUrl);
            onUploadSuccess(fileUrl);

        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const clearUpload = () => {
        setUploadedUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <span className="block text-sm font-bold text-gray-700 mb-2">{label}</span>
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
                    className="w-full h-24  neu-flat rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-[#00bfa5] hover:text-[#00bfa5] transition"
                >
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                    ) : (
                        <>
                            <UploadCloud className="w-6 h-6 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">Click to Browse File</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="w-full p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700 truncate max-w-[200px]">
                            {uploadedUrl.split('/').pop()}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={clearUpload}
                        className="p-1 hover:bg-green-100 rounded-full text-green-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
        </div>
    );
}
