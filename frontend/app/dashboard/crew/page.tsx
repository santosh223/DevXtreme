'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import api from '../../../lib/api';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Camera, 
  Send,
  Loader2,
  ChevronRight,
  ClipboardList,
  Image as ImageIcon
} from 'lucide-react';

export default function CrewDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      // Find all issues where assigned_to matches the user's name or is one of the crews
      // For demo, we'll fetch all and filter by assigned_to
      const res = await api.get('/issues');
      // In a real app, the server would filter this. For demo, we assume user.name is the crew name.
      const myTasks = res.data.filter((t: any) => t.assigned_to && t.status !== 'Fixed');
      setTasks(myTasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const handleMarkFixed = async () => {
    if (!selectedTask || !afterImageUrl) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/issues/${selectedTask._id}/status`, {
        status: 'Fixed',
        after_image_url: afterImageUrl
      });
      setAfterImageUrl('');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      alert('Failed to update status. Ensure the after photo URL is provided.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-10 pt-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Crew Dashboard</h1>
          <p className="text-gray-400">Assigned field operations and repair logs for {user?.name}.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Tasks</p>
            <p className="text-xl font-bold">{tasks.length}</p>
          </div>
          <Users size={32} className="text-primary" />
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-gray-500" />
            Current Assignment Queue
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 glass-panel">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-gray-500">Syncing assignments...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-panel p-20 text-center space-y-4">
              <CheckCircle2 size={40} className="text-success mx-auto opacity-50" />
              <p className="text-gray-500">Queue is empty. Good work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <button
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full glass-card p-6 flex items-center gap-6 text-left transition-all hover:border-primary/40 group ${selectedTask?._id === task._id ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
                >
                  <div className="h-24 w-24 rounded-2xl overflow-hidden min-w-[96px] bg-white/5">
                    <img src={task.image_url} alt="Problem" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        task.severity === 'High' ? 'bg-danger/20 text-danger' : 
                        task.severity === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                      }`}>
                        {task.severity}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">CREATED: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg">ID: {task._id.slice(-6)}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin size={12} />
                      {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-700 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action / Detail Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Focus Details</h2>
          
          {selectedTask ? (
            <div className="glass-card p-10 animate-slide-up sticky top-24 border-primary/20 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight">Task Verification</h3>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Job #{selectedTask._id.slice(-6)}</p>
                  </div>
                  {selectedTask.is_overdue && (
                    <div className="bg-danger/20 text-danger px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={14} /> EXPIRED SLA
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                  <Detail label="Current State" value={selectedTask.status.replace('_', ' ')} />
                  <Detail label="Coordinates" value={`${selectedTask.latitude.toFixed(3)}, ${selectedTask.longitude.toFixed(3)}`} />
                  <Detail label="Reported By" value={selectedTask.citizen_id || 'System'} />
                  <Detail label="Due Time" value={new Date(selectedTask.sla_due_time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })} />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Repair Evidence (After Photo)</h4>
                <div className="space-y-4">
                  <div className="relative group">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="url"
                      placeholder="Enter fixed pothole photo URL"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                      value={afterImageUrl}
                      onChange={e => setAfterImageUrl(e.target.value)}
                    />
                  </div>
                  
                  {afterImageUrl && (
                    <div className="h-48 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl">
                      <img src={afterImageUrl} alt="After" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleMarkFixed}
                  disabled={isSubmitting || !afterImageUrl}
                  className="w-full py-5 bg-success hover:bg-success/80 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-success/20 disabled:opacity-30 disabled:grayscale"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> Mark as Fixed & Close Ticket</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-4 h-[500px]">
              <div className="p-6 bg-white/5 rounded-full">
                <ClipboardList size={48} className="text-gray-700" />
              </div>
              <p className="text-gray-500 max-w-xs mx-auto font-medium">Select a task from your queue to view coordinates and submit repair evidence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">{label}</p>
      <p className="text-sm font-bold truncate">{value}</p>
    </div>
  );
}
