import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { EnvScript } from '@/components/env-script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Clinic OS - 診所營運管理系統',
    template: '%s | Clinic OS',
  },
  description: '診所交班、庫存、排班管理系統 - 提升診所營運效率',
  keywords: ['診所管理', '交班系統', '庫存管理', '排班系統', 'Clinic OS'],
  authors: [{ name: 'Clinic OS Team' }],
  robots: {
    index: false, // 內部系統不需要被搜尋引擎索引
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <EnvScript />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
