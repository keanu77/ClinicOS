import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '庫存管理',
  description: '管理診所庫存品項與異動記錄',
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
