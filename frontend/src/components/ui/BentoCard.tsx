import React from 'react';
import { cn } from '@/lib/utils';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'interactive';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function BentoCard({
    children,
    variant = 'default',
    padding = 'md',
    className,
    ...props
}: BentoCardProps) {
    const variantClasses = {
        default: 'bento-card',
        interactive: 'bento-card bento-card-interactive cursor-pointer',
    };

    const paddingClasses = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6 sm:p-8',
        lg: 'p-8 sm:p-10',
    };

    return (
        <div
            className={cn(
                variantClasses[variant],
                paddingClasses[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
