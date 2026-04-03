'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  MoreHorizontal,
  MapPin
} from 'lucide-react';
import styles from './admin.module.css';
import { Issue } from '@/components/Map';

// Dynamically import map to avoid SSR issues with Mapbox
const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

// Mock DATA
const mockIssues: Issue[] = [
  { id: '101', lat: 37.7749, lng: -122.4194, status: 'Open', severity: 'High' },
  { id: '102', lat: 37.7849, lng: -122.4094, status: 'In Progress', severity: 'Medium' },
  { id: '103', lat: 37.7649, lng: -122.4294, status: 'Open', severity: 'Medium', isOverdue: true },
  { id: '104', lat: 37.7949, lng: -122.3994, status: 'Fixed', severity: 'Low' },
  { id: '105', lat: 37.7549, lng: -122.4394, status: 'Open', severity: 'High', isOverdue: true },
  { id: '106', lat: 37.7449, lng: -122.4494, status: 'In Progress', severity: 'Low' },
];

export default function AdminDashboard() {
  const [filter, setFilter] = useState<'All' | 'Open' | 'In Progress' | 'Fixed'>('All');
  const [issues] = useState<Issue[]>(mockIssues);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const kpis = {
    open: issues.filter(i => i.status === 'Open').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    overdue: issues.filter(i => i.isOverdue).length,
    fixed: issues.filter(i => i.status === 'Fixed').length,
  };

  const filteredIssues = issues.filter(i => filter === 'All' || i.status === filter);

  return (
    <div className={`container ${styles.dashboardContainer} animate-fade-in`}>
      <header className={styles.header}>
        <div>
          <h1>Command Center</h1>
          <p className={styles.subtitle}>Pothole resolution tracking and dispatch</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`glass-card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconOpen}`}>
            <AlertCircle />
          </div>
          <div className={styles.kpiDetails}>
            <h3>Total Open</h3>
            <span className={styles.kpiValue}>{kpis.open + kpis.inProgress}</span>
          </div>
        </div>
        
        <div className={`glass-card ${styles.kpiCard} ${styles.kpiCardOverdue}`}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconOverdue}`}>
            <Clock />
          </div>
          <div className={styles.kpiDetails}>
            <h3>SLA Overdue</h3>
            <span className={styles.kpiValue}>{kpis.overdue}</span>
          </div>
        </div>
        
        <div className={`glass-card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconFixed}`}>
            <CheckCircle />
          </div>
          <div className={styles.kpiDetails}>
            <h3>Fixed this month</h3>
            <span className={styles.kpiValue}>{kpis.fixed}</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Table Section */}
        <div className={`glass-card ${styles.tableCard}`}>
          <div className={styles.tableHeader}>
            <h3>Active Reports</h3>
            <div className={styles.filters}>
              <Filter size={16} />
              {(['All', 'Open', 'In Progress', 'Fixed'] as const).map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(issue => (
                  <tr 
                    key={issue.id} 
                    className={`${styles.tableRow} ${selectedIssueId === issue.id ? styles.tableRowSelected : ''}`}
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    <td>#{issue.id}</td>
                    <td>
                      <span className={`${styles.chip} ${styles[`chip${issue.severity}`]}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.chip} ${styles[`chip${issue.status.replace(' ', '')}`]}`}>
                        {issue.status}
                      </span>
                      {issue.isOverdue && (
                        <span className={`${styles.chip} ${styles.chipOverdue}`} style={{marginLeft: '0.5rem'}}>
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td className={styles.locationCell}>
                      <MapPin size={14} className={styles.pinIcon} />
                      {issue.lat.toFixed(3)}, {issue.lng.toFixed(3)}
                    </td>
                    <td>
                      <button className={styles.actionBtn}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Map Section */}
        <div className={`glass-card ${styles.mapCard}`}>
          <h3>Live Tracking</h3>
          <div className={styles.mapCanvas}>
            <MapComponent 
               issues={filteredIssues} 
               onMarkerClick={(issue) => setSelectedIssueId(issue.id)} 
               center={[-122.4194, 37.7749]}
               zoom={11}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
