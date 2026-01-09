import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '使用者管理',
  description: '管理系統使用者帳號',
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
