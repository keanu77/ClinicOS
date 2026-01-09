import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '稽核紀錄',
  description: '檢視系統操作紀錄',
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
