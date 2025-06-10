import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'BraLiga Anti-Panela',
  description: 'Sorteador justo de equipes para futebol',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-[#BA1B1B] via-[#D32F2F] to-[#E57373] min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
