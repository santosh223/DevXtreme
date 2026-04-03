'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import api from '../../../lib/api';
import { 
  Plus, 
  MapPin, 
  Camera, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  History,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    image_url: '',
    latitude: '',
    longitude: ''
  });

  const fetchReports = async () => {
    try {
      // For demo, we just fetch all and filter by citizen_id client-side or use query
      // The backend getIssues supports status filter, but we'll just fetch all for now
      const res = await api.get('/issues');
      // Filter reports for this citizen if citizen_id is set
      const myReports = res.data.filter((r: any) => r.citizen_id === `citizen_${user?.id}` || r.citizen_id === user?.email);
      setReports(myReports);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/issues', {
        citizen_id: user?.email, // Using email as ID for demo
        image_url: formData.image_url,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
      setFormData({ image_url: '', latitude: '', longitude: '' });
      setShowForm(false);
      fetchReports();
    } catch (err) {
      alert('Failed to submit report. Ensure coordinates are valid numbers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString()
        }));
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-10 pt-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name}. Your contributions make roads safer.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          {showForm ? 'Cancel' : <><Plus size={20} /> Report Pothole</>}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<History className="text-primary" />}
          label="Total Reports"
          value={reports.length.toString()}
        />
        <StatCard 
          icon={<CheckCircle2 className="text-success" />}
          label="Fixed Potholes"
          value={reports.filter(r => r.status === 'Fixed').length.toString()}
        />
        <StatCard 
          icon={<TrendingUp className="text-accent" />}
          label="Community Impact"
          value="High"
        />
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="glass-card p-10 animate-slide-up space-y-8 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Camera size={24} />
            </div>
            <h2 className="text-2xl font-bold">New Pothole Report</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Photo URL</label>
                <div className="relative group">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/pothole.jpg"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Latitude</label>
                  <input
                    type="text"
                    required
                    placeholder="28.6139"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Longitude</label>
                  <input
                    type="text"
                    required
                    placeholder="77.2090"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={autofillLocation}
                className="flex items-center justify-center gap-2 text-primary font-bold text-sm hover:underline underline-offset-4"
              >
                <MapPin size={16} /> Get My Location
              </button>
            </div>

            <div className="flex flex-col justify-between gap-8">
              <div className="glass-panel p-6 flex flex-col items-center justify-center border-dashed border-2 border-white/10 rounded-3xl h-full">
                {formData.image_url ? (
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                    onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')}
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon size={48} className="mx-auto text-gray-700" />
                    <p className="text-gray-500 text-sm">Image preview will appear here</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-primary/30 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Report</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History size={20} className="text-gray-400" />
            My Recent Reports
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-gray-500">Fetching your activity...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-panel p-20 text-center space-y-4">
            <div className="p-4 bg-white/5 rounded-full w-max mx-auto">
              <AlertTriangle size={40} className="text-gray-700" />
            </div>
            <p className="text-gray-500 max-w-sm mx-auto">You haven't reported any potholes yet. Start by clicking the button above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="glass-panel p-6 flex items-center gap-6">
      <div className="p-4 bg-white/5 rounded-2xl">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  const isOverdue = report.is_overdue && report.status !== 'Fixed';

  return (
    <div className="glass-card overflow-hidden group">
      <div className="relative h-48 w-full">
        <img 
          src={report.image_url} 
          alt="Pothole" 
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
        />
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg ${
          report.severity === 'High' ? 'bg-danger text-white' : 
          report.severity === 'Medium' ? 'bg-warning text-white' : 'bg-success text-white'
        }`}>
          {report.severity}
        </div>
        {isOverdue && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-danger/30 text-danger px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg">
            <AlertTriangle size={10} /> OVERDUE
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <MapPin size={12} />
            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
          </div>
          <span className="text-[10px] text-gray-600 font-medium">
            {new Date(report.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              report.status === 'Fixed' ? 'bg-success' : 
              report.status === 'Open' ? 'bg-primary animate-pulse' : 'bg-warning'
            }`} />
            <span className="text-sm font-semibold">{report.status.replace('_', ' ')}</span>
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            ID: {report._id.slice(-6)}
          </p>
        </div>
      </div>
    </div>
  );
}
