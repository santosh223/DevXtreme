'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../lib/auth';
import api from '../../../lib/api';
import socket from '../../../lib/socket';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Map as MapIcon, 
  List, 
  ArrowRight, 
  Users, 
  Loader2, 
  Filter,
  RefreshCcw,
  BellRing
} from 'lucide-react';

// Dynamically import Leaflet Map to avoid SSR errors
const AdminMap = dynamic(() => import('../../../components/AdminMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full glass-panel flex items-center justify-center animate-pulse">
    <Loader2 className="animate-spin text-primary" size={40} />
  </div>
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const [potholes, setPotholes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [toasts, setToasts] = useState<string[]>([]);

  const fetchPotholes = async () => {
    try {
      const res = await api.get('/issues');
      setPotholes(res.data);
    } catch (err) {
      console.error('Failed to fetch potholes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPotholes();

      // Listen for socket events
      socket.on('pothole:new', (newIssue) => {
        setPotholes(prev => [newIssue, ...prev]);
        addToast(`New Pothole Detected: ${newIssue.severity} Severity`);
      });

      socket.on('pothole:overdue', (data) => {
        setPotholes(prev => prev.map(p => p._id === data.issueId ? { ...p, is_overdue: true } : p));
        addToast(`SLA Breach: Pothole ${data.issueId.slice(-6)} is Overdue!`);
      });

      return () => {
        socket.off('pothole:new');
        socket.off('pothole:overdue');
      };
    }
  }, [user]);

  const addToast = (msg: string) => {
    setToasts(prev => [...prev, msg]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
  }

  const handleAssign = async (issueId: string, crew: string) => {
    try {
      const res = await api.patch(`/issues/${issueId}/assign`, { assigned_to: crew });
      setPotholes(prev => prev.map(p => p._id === issueId ? res.data : p));
      setSelectedIssue(null);
    } catch (err) {
      alert('Failed to assign crew.');
    }
  };

  const filteredPotholes = filter === 'All' 
    ? potholes 
    : potholes.filter(p => p.status === filter || (filter === 'Overdue' && p.is_overdue));

  const stats = {
    total: potholes.length,
    open: potholes.filter(p => p.status === 'Open').length,
    assigned: potholes.filter(p => p.status === 'Assigned' || p.status === 'In_Progress').length,
    fixed: potholes.filter(p => p.status === 'Fixed').length,
    overdue: potholes.filter(p => p.is_overdue && p.status !== 'Fixed').length
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-10 pt-8 pb-20">
      {/* Toast Notifications */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, i) => (
          <div key={i} className="glass-card !bg-primary/20 border-primary/40 px-6 py-4 flex items-center gap-4 animate-slide-up shadow-2xl pointer-events-auto">
            <BellRing size={20} className="text-primary animate-bounce" />
            <p className="text-sm font-bold">{toast}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Operations Center</h1>
          <p className="text-gray-400">Monitoring real-time infrastructure maintenance and SLA compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <FilterTab active={filter === 'All'} onClick={() => setFilter('All')} label="All" />
            <FilterTab active={filter === 'Open'} onClick={() => setFilter('Open')} label="Open" />
            <FilterTab active={filter === 'Overdue'} onClick={() => setFilter('Overdue')} label="Overdue" />
            <FilterTab active={filter === 'Fixed'} onClick={() => setFilter('Fixed')} label="Fixed" />
          </div>
          <button 
            onClick={fetchPotholes}
            className="p-3 glass-panel hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={<ShieldAlert className="text-primary" />} label="Open Tickets" value={stats.open.toString()} />
        <KpiCard icon={<Users className="text-warning" />} label="Assigned Crews" value={stats.assigned.toString()} />
        <KpiCard icon={<AlertTriangle className="text-danger" />} label="SLA overdue" value={stats.overdue.toString()} subVal={`${Math.round((stats.overdue/stats.total)*100 || 0)}% of total`} />
        <KpiCard icon={<CheckCircle2 className="text-success" />} label="Succcessfully Fixed" value={stats.fixed.toString()} />
      </div>

      {/* Main Panel: Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Live Map Panel */}
        <div className="lg:col-span-2 glass-card p-4 relative">
          <div className="absolute top-8 right-8 z-[400] glass-panel px-4 py-2 border border-white/10 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            Live Network Feed
          </div>
          <AdminMap 
            potholes={filteredPotholes} 
            onSelect={(p) => setSelectedIssue(p)}
            center={selectedIssue ? [selectedIssue.latitude, selectedIssue.longitude] : [28.6139, 77.2090]}
          />
        </div>

        {/* Detailed List Panel */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <List className="text-gray-500" size={20} />
            <h3 className="font-bold">Issue Directory</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : filteredPotholes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                No tickets matching current filters.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredPotholes.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedIssue(p)}
                    className={`w-full p-4 flex items-center gap-4 text-left transition-all hover:bg-white/5 ${selectedIssue?._id === p._id ? 'bg-primary/10 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                  >
                    <div className={`h-10 w-10 min-w-[40px] rounded-xl flex items-center justify-center font-bold text-xs ${
                      p.severity === 'High' ? 'bg-danger/20 text-danger' : 
                      p.severity === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                    }`}>
                      {p.severity[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm truncate">ID: {p._id.slice(-6)}</p>
                        {p.is_overdue && p.status !== 'Fixed' && <AlertTriangle size={12} className="text-danger animate-pulse" />}
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold pt-0.5">{p.status.replace('_', ' ')}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-700" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Slide-over / Modal (Assignment) */}
      {selectedIssue && (
        <div className="glass-card p-10 mt-8 border-primary/20 animate-slide-up flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight">Issue Breakdown</h2>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="text-gray-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Close Panel [X]
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <DetailField label="Issue Identification" value={`#${selectedIssue._id}`} />
              <DetailField label="Current Status" value={selectedIssue.status.replace('_', ' ')} />
              <DetailField label="Assigned Crew" value={selectedIssue.assigned_to || 'UNASSIGNED'} />
              <DetailField label="AI Confidance" value={`${(selectedIssue.confidence * 100).toFixed(1)}% Accuracy`} />
            </div>

            {selectedIssue.status === 'Open' && (
              <div className="pt-6 space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Dispatch Crew Assignment</label>
                <div className="flex flex-wrap gap-3">
                  {['Crew A', 'Crew B', 'Crew C'].map(crew => (
                    <button
                      key={crew}
                      onClick={() => handleAssign(selectedIssue._id, crew)}
                      className="px-6 py-3 glass-panel hover:bg-primary hover:text-white hover:border-primary transition-all font-bold text-sm rounded-xl"
                    >
                      Assign {crew}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="md:w-1/3 h-64 md:h-auto rounded-3xl overflow-hidden shadow-2xl relative group">
            <img 
              src={selectedIssue.image_url} 
              alt="Evidence" 
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-${selectedIssue.severity === 'High' ? 'danger' : 'primary'}/60 to-transparent flex flex-end p-6 flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity`}>
               <p className="font-extrabold text-white text-xl">Verification Proof</p>
               <p className="text-white/80 text-xs">Pothole visualization with bounding box coordinates applied.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, subVal }: { icon: React.ReactNode, label: string, value: string, subVal?: string }) {
  return (
    <div className="glass-panel p-8 shadow-sm hover:border-white/20 transition-all group overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 text-white/5 transform group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 100 })}
      </div>
      <div className="space-y-4 relative z-10">
        <div className="p-3 bg-white/5 rounded-xl w-max">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-600">{label}</p>
          <div className="flex items-baseline gap-3">
            <h4 className="text-4xl font-extrabold tracking-tight">{value}</h4>
            {subVal && <span className="text-[10px] font-bold text-gray-500">{subVal}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-600">{label}</p>
      <p className="text-lg font-bold truncate">{value}</p>
    </div>
  );
}

function FilterTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${
        active ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
