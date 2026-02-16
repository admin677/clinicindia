'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/useQueries';
import { useAuthStore } from '@/hooks/useStore';
import { setToken } from '@/utils/api';

export const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser, setToken: setTokenStore } = useAuthStore();
  const { mutate: login, isPending } = useLogin();

  const onSubmit = async (data: any) => {
    setError('');
    login(data, {
      onSuccess: (response) => {
        const { token, user } = response.data;
        setToken(token);
        setTokenStore(token);
        setUser(user);
        localStorage.setItem('token', token);
        router.push('/dashboard');
      },
      onError: (err: any) => {
        setError(err.response?.data?.error || 'Login failed');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          {...register('password', { required: 'Password is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
