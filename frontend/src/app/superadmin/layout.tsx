import AppLayoutClient from '@/components/layout/AppLayoutClient';

export default function SuperadminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayoutClient>{children}</AppLayoutClient>;
}
