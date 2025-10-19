import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import ProgressBarWrapper from '@/components/ui/progress-bar-wrapper';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
    title: 'Markpedia OS - Business Operating System',
    description: 'All-in-one business operating system for modern companies',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.className, 'min-h-screen bg-background font-sans antialiased')}>
        {children}
        <ProgressBarWrapper />
        <Toaster />
        </body>
        </html>
    );
}