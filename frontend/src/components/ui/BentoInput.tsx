import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BentoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    error?: string;
    label?: string;
}

export const BentoInput = React.forwardRef<HTMLInputElement, BentoInputProps>(
    ({ className, icon: Icon, error, label, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && <label className="text-sm font-semibold text-slate-700 pl-1">{label}</label>}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "bento-input w-full h-12 text-sm placeholder:text-slate-400",
                            Icon ? "pl-11 pr-4" : "px-4",
                            error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-500 font-medium pl-1">{error}</p>}
            </div>
        );
    }
);
BentoInput.displayName = 'BentoInput';
