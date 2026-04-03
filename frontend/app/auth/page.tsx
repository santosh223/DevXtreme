'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const isRegister = searchParams.get('register') === 'true';
  const { login, register, loading, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !loading) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.role);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 glass-card p-10 mt-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isRegister ? 'Join the Network' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isRegister ? 'Register to start making roads safer.' : 'Sign in to access your dashboard.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  name="name"
                  required={isRegister}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                name="email"
                required
                placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                onChange={handleInputChange}
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">I am a...</label>
              <div className="flex gap-2 p-1 glass-panel">
                <RoleOption 
                  selected={formData.role === 'citizen'} 
                  onClick={() => setFormData({ ...formData, role: 'citizen' })}
                  label="Citizen"
                />
                <RoleOption 
                  selected={formData.role === 'traveler'} 
                  onClick={() => setFormData({ ...formData, role: 'traveler' })}
                  label="Traveler"
                />
                <RoleOption 
                  selected={formData.role === 'admin'} 
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  label="Admin"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isRegister ? 'Register' : 'Sign In'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          {isRegister ? (
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth" className="text-primary font-bold hover:underline underline-offset-4">Sign in here</Link>
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              New here?{' '}
              <Link href="/auth?register=true" className="text-primary font-bold hover:underline underline-offset-4">Create an account</Link>
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-gray-600">
          <Shield size={10} />
          SECURE ENCRYPTED AUTHENTICATION
        </div>
      </div>
    </div>
  );
}

function RoleOption({ selected, onClick, label }: { selected: boolean, onClick: () => void, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold tracking-tight transition-all ${
        selected ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {selected && <CheckCircle2 size={12} className="mr-1.5" />}
      {label}
    </button>
  );
}
