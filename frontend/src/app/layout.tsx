import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PixelPage — AI Landing Page Audit',
  description:
    'Analyze your landing page with AI and discover the CRO issues hurting clarity, trust, messaging, and conversions.',
  openGraph: {
    title: 'PixelPage — AI Landing Page Audit',
    description:
      'Analyze your landing page with AI and discover the CRO issues hurting clarity, trust, messaging, and conversions.',
    type: 'website',
    url: 'https://pixelpage.site',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Google Tag Manager */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NQ8YLXQVLB" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NQ8YLXQVLB');
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans bg-[#fafafa] text-zinc-900">
        {children}
      </body>
    </html>
  );
}
