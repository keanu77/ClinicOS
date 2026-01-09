import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '交班系統',
  description: '管理交班事項與追蹤狀態',
};

export default function HandoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
