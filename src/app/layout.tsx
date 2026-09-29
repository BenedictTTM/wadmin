import './globals.css';
import type { Metadata } from 'next';

import AppProviders from '../components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Question Bank Admin',
  description: 'WASSCE Question Bank Management & Review System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
