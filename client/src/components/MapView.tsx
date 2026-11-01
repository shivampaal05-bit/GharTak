import React from 'react';
import { MapPin, Shield, Navigation } from 'lucide-react';

interface MapViewProps {
  lat: number;
  lng: number;
  placeLabel?: string;
  isSOS?: boolean;
  transport?: string;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  lat,
  lng,
  placeLabel = 'Near City Hospital',
  isSOS = false,
  transport = 'BUS',
  height = '280px',
}) => {
  return (
    <div className="map-view-wrapper" style={{ height }}>
      {/* SVG Vector Map Rendering */}
      <svg className="map-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
        </defs>

        {/* Map Terrain */}
        <rect width="400" height="300" fill="#F1F5F9" />

        {/* River / Water body */}
        <path
          d="M -20,240 Q 80,180 200,220 T 420,190 L 420,320 L -20,320 Z"
          fill="url(#riverGrad)"
          opacity="0.7"
        />

        {/* Green Parks */}
        <rect x="20" y="30" width="80" height="70" rx="12" fill="#DCFCE7" opacity="0.8" />
        <text x="35" y="70" fill="#15803D" fontSize="10" fontWeight="600">Central Park</text>

        <rect x="270" y="40" width="100" height="60" rx="12" fill="#DCFCE7" opacity="0.8" />
        <text x="285" y="75" fill="#15803D" fontSize="10" fontWeight="600">Gomti Udhyan</text>

        {/* City Street Grid */}
        <line x1="0" y1="120" x2="400" y2="120" stroke="url(#roadGrad)" strokeWidth="12" strokeLinecap="round" />
        <line x1="160" y1="0" x2="160" y2="300" stroke="url(#roadGrad)" strokeWidth="14" strokeLinecap="round" />
        <line x1="0" y1="210" x2="400" y2="210" stroke="#E2E8F0" strokeWidth="8" />
        <line x1="280" y1="0" x2="280" y2="300" stroke="#E2E8F0" strokeWidth="8" />

        {/* Road Labels */}
        <text x="20" y="115" fill="#475569" fontSize="9" fontWeight="bold">Mahatma Gandhi Marg</text>
        <text x="170" y="35" fill="#475569" fontSize="9" fontWeight="bold" transform="rotate(90 170 35)">Hazratganj Road</text>

        {/* Nearby Landmark: Police Chowki Marker */}
        <g transform="translate(290, 110)">
          <circle cx="12" cy="12" r="14" fill="#1E293B" />
          <circle cx="12" cy="12" r="10" fill="#3B82F6" />
        </g>
        <text x="260" y="145" fill="#1E293B" fontSize="9" fontWeight="bold">Police Station (850m)</text>

        {/* Nearby Landmark: Hospital */}
        <g transform="translate(60, 110)">
          <circle cx="12" cy="12" r="14" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
          <text x="7" y="16" fill="#EF4444" fontSize="13" fontWeight="bold">+</text>
        </g>
        <text x="45" y="145" fill="#1E293B" fontSize="9" fontWeight="bold">City Hospital</text>
      </svg>

      {/* Moving Live User Dot with Accuracy Ring */}
      <div
        className={`live-dot-ring ${isSOS ? 'sos-mode' : ''}`}
        style={{ left: '50%', top: '50%' }}
      />
      <div
        className={`live-dot-pulse ${isSOS ? 'sos-mode' : ''}`}
        style={{ left: '50%', top: '50%' }}
      />

      {/* Transport Icon on Map */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '32%',
          transform: 'translateX(-50%)',
          background: isSOS ? '#B71C1C' : '#0F766E',
          color: '#FFFFFF',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <Navigation size={12} />
        {transport}
      </div>

      {/* Floating Place Banner at Bottom of Map */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #E2E8F0',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={15} color={isSOS ? '#B71C1C' : '#0F766E'} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#14213D' }}>
            {placeLabel}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
