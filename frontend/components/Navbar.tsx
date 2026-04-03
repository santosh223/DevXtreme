'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { LogOut, LayoutDashboard, User, Map, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-card shadow-lg fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
          <Shield className="text-white" size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          DevXtreme
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link 
              href={`/dashboard/${user.role}`} 
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{user.role}</span>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-danger"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth?register=true" 
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
