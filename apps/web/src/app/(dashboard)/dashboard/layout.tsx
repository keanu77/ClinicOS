import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '儀表板',
  description: '查看診所營運概覽、待辦事項和排班資訊',
};

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
