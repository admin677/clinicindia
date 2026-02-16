'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useUIStore } from '@/hooks/useStore';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  restricted?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Appointments', href: '/appointments', icon: '📅' },
  { name: 'Doctors', href: '/doctors', icon: '👨‍⚕️' },
  { name: 'Medical Records', href: '/records', icon: '📋' },
  { name: 'Prescriptions', href: '/prescriptions', icon: '💊' },
  { name: 'Billing', href: '/billing', icon: '💳' },
  { name: 'Notifications', href: '/notifications', icon: '🔔' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen bg-gray-900 text-white transition-transform duration-300 z-40',
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-primary">🏥 Clinic India</h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                pathname === item.href
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              )}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
