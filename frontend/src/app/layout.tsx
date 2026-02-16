import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clinic India - Healthcare Management',
  description: 'Professional healthcare clinic management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
