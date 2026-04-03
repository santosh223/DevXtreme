import React from 'react';
import Link from 'next/link';
import { ArrowRight, Car, ClipboardList, Map as MapIcon, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl flex flex-col items-center text-center space-y-12 py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Real-time Pothole Detection & Alert System
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Making Every Journey <br />
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              Safer & Smarter
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing road management with AI-powered detection, real-time traveler alerts,
            and seamless dispatching. Join us in building smarter infrastructure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
          <Link 
            href="/auth?register=true" 
            className="group px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-primary/30"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/auth" 
            className="px-8 py-4 glass-panel hover:bg-white/5 rounded-2xl font-bold transition-all border border-white/10"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
        <FeatureCard 
          icon={<ClipboardList className="text-accent" />}
          title="Citizen Reporting"
          description="Instant pothole uploads with automatic GPS location and AI confidence scoring."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-success" />}
          title="AI Inspection"
          description="Automatic severity classification (Low, Medium, High) determines SLA prioritization."
        />
        <FeatureCard 
          icon={<MapIcon className="text-primary" />}
          title="Traveler Alerts"
          description="Real-time notifications for nearby potholes with automated routing suggests."
        />
        <FeatureCard 
          icon={<Car className="text-warning" />}
          title="Admin Oversight"
          description="Full management dashboard for crew assignment and SLA tracking."
        />
      </section>
      
      {/* Footer / Stats (Placeholder) */}
      <div className="w-full max-w-6xl py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} />
          <span>DevXtreme © 2026</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-foreground font-bold text-xl">250+</span>
            <span className="text-[10px] uppercase tracking-widest">Potholes Fixed</span>
          </div>
          <div className="flex flex-col items-center text-accent">
            <span className="font-bold text-xl">15ms</span>
            <span className="text-[10px] uppercase tracking-widest">AI Latency</span>
          </div>
          <div className="flex flex-col items-center text-primary">
            <span className="font-bold text-xl">Real-time</span>
            <span className="text-[10px] uppercase tracking-widest">Global Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 flex flex-col items-start gap-4 hover:border-primary/30 transition-all hover:-translate-y-1">
      <div className="p-3 bg-white/5 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
