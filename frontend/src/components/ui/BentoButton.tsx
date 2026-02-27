import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BentoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
}

export const BentoButton = React.forwardRef<HTMLButtonElement, BentoButtonProps>(
    ({ className, variant = 'default', size = 'md', icon: Icon, iconPosition = 'left', children, ...props }, ref) => {
        const baseClass = "inline-flex items-center justify-center font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95";

        const variants = {
            default: "bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-200 focus:ring-offset-1",
            primary: "bg-blue-600 border border-transparent text-white shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            danger: "bg-white border border-red-200 text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-200 focus:ring-offset-1",
            ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs rounded-xl",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-11 w-11 p-0",
        };

        return (
            <button
                ref={ref}
                className={cn(baseClass, variants[variant], sizes[size], className)}
                {...props}
            >
                {Icon && iconPosition === 'left' && <Icon className={cn("w-5 h-5", children ? "mr-2" : "")} />}
                {children}
                {Icon && iconPosition === 'right' && <Icon className={cn("w-5 h-5", children ? "ml-2" : "")} />}
            </button>
        );
    }
);
BentoButton.displayName = 'BentoButton';
