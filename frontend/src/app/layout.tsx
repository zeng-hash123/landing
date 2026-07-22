import type { Metadata } from 'next';
import { Epilogue } from 'next/font/google';
import './globals.css';

const epilogue = Epilogue({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Forge - AI Landing Page Generator',
  description: 'Generate stunning landing pages with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${epilogue.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-sans">{children}</body>
    </html>
  );
}
