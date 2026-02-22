import React from 'react';
import { cn } from '@/lib/utils';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'flat' | 'pressed' | 'button';
    size?: 'sm' | 'md' | 'lg';
}

export function NeuCard({
    children,
    variant = 'flat',
    size = 'md',
    className,
    ...props
}: NeuCardProps) {

    const variantClasses = {
        flat: 'neu-flat',
        pressed: 'neu-pressed',
        button: 'neu-button',
    };

    const sizeClasses = {
        sm: 'p-4 rounded-xl',
        md: 'p-6 rounded-2xl',
        lg: 'p-8 rounded-3xl',
    };

    return (
        <div
            className={cn(
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
