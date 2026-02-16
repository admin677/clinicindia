'use client';

import { LoginForm } from '@/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏥 Clinic India</h1>
          <p className="text-gray-100">Healthcare Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>
          
          <LoginForm />

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800">Email: demo@clinicindia.fit</p>
            <p className="text-xs text-blue-800">Password: demo123456</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-100 text-sm mt-6">
          © 2024 Clinic India. All rights reserved.
        </p>
      </div>
    </div>
  );
}
