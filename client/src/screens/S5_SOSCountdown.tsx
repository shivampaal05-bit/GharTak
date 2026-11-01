import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Navigation } from 'lucide-react';
import { TransportType } from '../types';

interface S5SOSCountdownProps {
  transport: TransportType;
  vehicleNumber?: string;
  placeLabel: string;
  lat: number;
  lng: number;
  pressedTimeStr: string;
  onCancel: () => void;
  onCountdownComplete: () => void;
}

export const S5_SOSCountdown: React.FC<S5SOSCountdownProps> = ({
  transport,
  vehicleNumber,
  placeLabel,
  lat,
  lng,
  pressedTimeStr,
  onCancel,
  onCountdownComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    // Vibrate on tick
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200]);
      }
    } catch {
      // browser vibration permission optional
    }

    if (secondsLeft <= 0) {
      onCountdownComplete();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, onCountdownComplete]);

  return (
    <div className="sos-screen-red">
      {/* Title */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          <AlertTriangle size={16} /> EMERGENCY ALERT
        </div>
        <div className="sos-title">Sending SOS Alert</div>
      </div>

      {/* Large 5 to 1 Countdown Circle */}
      <div className="countdown-circle-container">
        <div className="countdown-pulse-ring" />
        <div className="countdown-circle">
          <div className="countdown-number">{secondsLeft > 0 ? secondsLeft : 1}</div>
        </div>
      </div>

      {/* Box listing what will be sent */}
      <div className="sos-payload-card">
        <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
          The following details will be sent:
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Navigation size={14} />
          <span>
            <strong>Transport:</strong> {transport} {vehicleNumber ? `(${vehicleNumber})` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <MapPin size={14} />
          <span>
            <strong>Near:</strong> {placeLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Clock size={14} />
          <span>
            <strong>SOS:</strong> Triggered at {pressedTimeStr}
          </span>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>
          Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)} (Live map link included)
        </div>
      </div>

      {/* Footer text & 56px Cancel button */}
      <div style={{ width: '100%' }}>
        <div className="sos-footer-text">
          If internet fails, alert will be sent via SMS automatically
        </div>

        <button className="btn-cancel-sos" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
