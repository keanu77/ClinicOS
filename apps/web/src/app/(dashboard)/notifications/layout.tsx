import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '通知中心',
  description: '查看系統通知與訊息',
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
