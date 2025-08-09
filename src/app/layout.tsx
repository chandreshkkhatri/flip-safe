import { Inter } from 'next/font/google';
import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flip Safe - Unified Trading Platform',
  description: 'Advanced trading platform with real-time market data and analytics',
  keywords: 'trading, stocks, market watch, portfolio management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
          rel="stylesheet"
        />
        <script
          defer
          src="https://use.fontawesome.com/releases/v6.5.1/js/all.js"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div id="root">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
