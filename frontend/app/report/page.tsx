'use client';

import { useState } from 'react';
import { Camera, MapPin, UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from './report.module.css';

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get location. Please allow location access.");
          setLocationLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLocationLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !location) {
      alert("Please provide both a photo and location.");
      return;
    }
    
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className={`container ${styles.pageContainer}`}>
        <div className={`glass-card ${styles.successCard} animate-fade-in`}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h2>Report Submitted!</h2>
          <p>Thank you for making the city safer. Our system has analyzed the pothole and logged it for the repair crew.</p>
          <button 
            className="btn-primary" 
            style={{marginTop: '2rem'}}
            onClick={() => {
              setStatus('idle');
              setFile(null);
              setPreviewUrl(null);
              setLocation(null);
            }}
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.pageContainer} animate-fade-in`}>
      <div className={styles.headerArea}>
        <h1>Report a Pothole</h1>
        <p className={styles.subtitle}>Help us identify road hazards. Your report will be automatically assessed by AI.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={`glass-card ${styles.cardSection}`}>
          <h3>1. Upload Photo</h3>
          <p className={styles.instructionText}>Take a clear picture of the pothole.</p>
          
          <div className={styles.uploadArea}>
            <input 
              type="file" 
              id="photo" 
              accept="image/*" 
              onChange={handleFileChange} 
              className={styles.fileInput} 
            />
            <label htmlFor="photo" className={styles.uploadLabel}>
              {previewUrl ? (
                <div className={styles.previewContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className={styles.imagePreview} />
                  <div className={styles.replaceOverlay}>
                    <Camera size={24} />
                    <span>Replace Photo</span>
                  </div>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <UploadCloud size={48} className={styles.uploadIcon} />
                  <span>Click to browse or take a photo</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className={`glass-card ${styles.cardSection}`}>
          <h3>2. Location details</h3>
          <p className={styles.instructionText}>Provide the exact location for the repair crew.</p>
          
          <div className={styles.locationControls}>
            <button 
              type="button" 
              onClick={getLocation} 
              className={`${styles.locationBtn} ${location ? styles.locationBtnActive : ''}`}
            >
              <MapPin size={20} />
              {locationLoading ? 'Locating...' : (location ? 'Location Captured' : 'Use Current Location')}
            </button>
            
            {location && (
              <div className={styles.coordinates}>
                <span className={styles.coordLabel}>Lat: {location.lat.toFixed(6)}</span>
                <span className={styles.coordLabel}>Lng: {location.lng.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.submitArea}>
          <AlertTriangle size={20} className={styles.warningIcon} />
          <span className={styles.disclaimer}>Please ensure you are in a safe position before taking photos.</span>
          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={!file || !location || status === 'submitting'}
          >
            {status === 'submitting' ? 'Analyzing & Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
