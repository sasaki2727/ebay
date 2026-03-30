import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'eBay 利益判定ツール',
  description: 'eBay物販の仕入れ判断を数字で確認するツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
