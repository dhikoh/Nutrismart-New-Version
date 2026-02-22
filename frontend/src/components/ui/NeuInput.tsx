import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    error?: string;
    label?: string;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
    ({ className, icon: Icon, error, label, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && <label className="text-sm font-semibold text-gray-600 pl-2">{label}</label>}
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "neu-input w-full h-12 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none",
                            Icon ? "pl-12 pr-4" : "px-4",
                            error ? "focus:shadow-[inset_2px_2px_4px_var(--neumorphic-dark),inset_-2px_-2px_4px_var(--neumorphic-light),0_0_0_2px_#ef4444]" : "",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-500 font-medium pl-2">{error}</p>}
            </div>
        );
    }
);
NeuInput.displayName = 'NeuInput';
