
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import DashboardLayout from '@/components/dashboard-layout';
import NextTopLoader from 'nextjs-toploader';
import { Stars } from '@/components/stars';

export const metadata: Metadata = {
  title: 'Aivo',
  description: 'Evolve your potential with AI-powered focus.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://www.dafont.com/led-dot-matrix.font" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground relative text-gray-400">
        <Stars />
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
