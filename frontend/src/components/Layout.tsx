'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/hooks/useStore';
import { useRouter } from 'next/navigation';

export const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
