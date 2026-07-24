import type { Metadata } from 'next';
import { Epilogue } from 'next/font/google';
import './globals.css';

const epilogue = Epilogue({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'PixelPage AI - Multi-Agent AI Landing Page Generator',
  description: 'Transform prompts and ad briefs into production-ready, high-converting landing pages using multi-agent AI.',
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
