'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>('checking...');

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealthStatus(data.status || 'healthy');
      } catch (error) {
        setHealthStatus('error');
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">ClinicIndia</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Healthcare Management Made Simple
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Your comprehensive clinic management solution for appointments, medical records, and patient care.
        </p>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 inline-block">
          <p className="text-sm text-gray-600">System Status:</p>
          <p className={`text-lg font-semibold ${healthStatus === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
            {healthStatus === 'healthy' ? '✓ All Systems Operational' : '✗ System Check Failed'}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Login to Dashboard
            </Link>
            <Link
              href="/register"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 font-semibold"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '👥', title: 'Patient Management', desc: 'Manage patient profiles and medical history' },
              { icon: '👨‍⚕️', title: 'Doctor Profiles', desc: 'Schedule and manage doctor availability' },
              { icon: '📅', title: 'Appointments', desc: 'Easy booking and scheduling system' },
              { icon: '📋', title: 'Medical Records', desc: 'Secure digital medical records' },
              { icon: '💊', title: 'E-Prescriptions', desc: 'Digital prescription management' },
              { icon: '💳', title: 'Billing', desc: 'Automated invoicing and payments' },
            ].map((feature, i) => (
              <div key={i} className="p-6 border rounded-lg hover:shadow-lg transition">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 ClinicIndia. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Healthcare Management System</p>
        </div>
      </footer>
    </div>
  );
}
