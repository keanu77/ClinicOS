import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '排班系統',
  description: '管理診所人員排班與班表',
};

export default function SchedulingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
