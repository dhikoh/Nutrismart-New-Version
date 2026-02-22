import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
}

export const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
    ({ className, variant = 'default', size = 'md', icon: Icon, iconPosition = 'left', children, ...props }, ref) => {

        const baseClass = "neu-button inline-flex items-center justify-center font-bold transition-all active:neu-pressed disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            default: "text-gray-600 hover:text-gray-900",
            primary: "text-[#00bfa5] hover:text-[#00cca8]",
            danger: "text-red-500 hover:text-red-600",
            ghost: "shadow-none hover:neu-button bg-transparent hover:bg-transparent text-gray-500", // Soft hover
        };

        const sizes = {
            sm: "h-9 px-4 text-xs rounded-xl",
            md: "h-11 px-6 text-sm rounded-2xl",
            lg: "h-14 px-8 text-base rounded-2xl",
            icon: "h-11 w-11 rounded-xl p-0",
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
NeuButton.displayName = 'NeuButton';
