'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './map.module.css';

// Important: Provide a public Mapbox token here or via environment variable. 
// For demo purposes, we will handle the error if it's missing and show a placeholder.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export type Issue = {
  id: string;
  lat: number;
  lng: number;
  status: 'Open' | 'In Progress' | 'Fixed';
  severity: 'Low' | 'Medium' | 'High';
  isOverdue?: boolean;
};

interface MapProps {
  issues: Issue[];
  onMarkerClick?: (issue: Issue) => void;
  center?: [number, number];
  zoom?: number;
}

export default function Map({ issues, onMarkerClick, center = [-122.4194, 37.7749], zoom = 12 }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [tokenMissing, setTokenMissing] = useState(!MAPBOX_TOKEN);

  useEffect(() => {
    if (tokenMissing) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (map.current) return; // Initialize map only once

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark themes match our design
        center: center,
        zoom: zoom,
        pitch: 45, // Add a bit of 3D tilt for a cooler look
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }
  }, [center, zoom, tokenMissing]);

  // Handle marker updates
  useEffect(() => {
    if (!map.current || tokenMissing) return;

    const currentMap = map.current;

    // Clear old markers that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!issues.find(issue => issue.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    issues.forEach(issue => {
      if (!markersRef.current[issue.id]) {
        // Create custom map element for styling
        const el = document.createElement('div');
        el.className = styles.marker;
        
        // Add specific classes based on status and severity
        if (issue.status === 'Fixed') {
           el.classList.add(styles.markerFixed);
        } else if (issue.status === 'In Progress') {
           el.classList.add(styles.markerInProgress);
        } else if (issue.isOverdue) {
           el.classList.add(styles.markerOverdue);
        } else {
           el.classList.add(styles.markerOpen);
        }

        // Add pulse animation
        const pulse = document.createElement('div');
        pulse.className = styles.markerPulse;
        el.appendChild(pulse);

        // Core marker logic
        const marker = new mapboxgl.Marker(el)
          .setLngLat([issue.lng, issue.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>Issue #${issue.id}</h3>
               <p>Status: ${issue.status}</p>
               <p>Severity: ${issue.severity}</p>
               ${issue.isOverdue ? '<p style="color:var(--danger)">OVERDUE</p>' : ''}`
            )
          )
          .addTo(currentMap);

        el.addEventListener('click', () => {
          if (onMarkerClick) onMarkerClick(issue);
        });

        markersRef.current[issue.id] = marker;
      }
    });
  }, [issues, onMarkerClick, tokenMissing]);

  if (tokenMissing) {
    return (
      <div className={`glass-card ${styles.placeholderMap}`}>
        <div className={styles.placeholderContent}>
          <h3>Map Component Placeholder</h3>
          <p>Please provide a Mapbox Access Token in your <code>.env.local</code> as <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable the interactive map.</p>
          <div className={styles.mockPinsContainer}>
            {issues.map(issue => (
              <div 
                key={issue.id} 
                className={styles.mockPinRow}
                onClick={() => onMarkerClick && onMarkerClick(issue)}
              >
                <span>Issue {issue.id}</span>
                <span className={issue.isOverdue ? styles.textOverdue : ''}>
                  {issue.status} - {issue.severity} Severity
                </span>
                <span>[{issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.mapWrapper} />
    </div>
  );
}
