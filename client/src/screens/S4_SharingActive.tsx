import React, { useState } from 'react';
import { StopCircle, AlertOctagon, MapPin, Bell, Edit2, Check } from 'lucide-react';
import { MapView } from '../components/MapView';
import { TransportType } from '../types';

interface S4SharingActiveProps {
  contactNames: string;
  initialTransport: TransportType;
  initialVehicle?: string;
  currentPlace: string;
  lat: number;
  lng: number;
  onStopSharing: () => void;
  onTriggerSOS: () => void;
  onUpdateTrip: (transport: TransportType, vehicle?: string) => void;
}

export const S4_SharingActive: React.FC<S4SharingActiveProps> = ({
  contactNames,
  initialTransport,
  initialVehicle = '',
  currentPlace,
  lat,
  lng,
  onStopSharing,
  onTriggerSOS,
  onUpdateTrip,
}) => {
  const [transport, setTransport] = useState<TransportType>(initialTransport);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEdit = () => {
    setIsEditing(false);
    onUpdateTrip(transport, vehicle);
  };

  const isWalking = transport === 'PAIDAL' || transport === 'WALK' || transport === 'WALKING' || transport === 'Walking';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F6F7FB' }}>
      {/* Persistent Notification Simulation Banner */}
      <div
        style={{
          background: '#0F766E',
          color: '#FFFFFF',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={14} />
          <span>GharTak: Live location sharing active</span>
        </div>
        <button
          onClick={onStopSharing}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Stop
        </button>
      </div>

      {/* Live Map with moving dot */}
      <MapView lat={lat} lng={lng} placeLabel={currentPlace} transport={transport} height="240px" />

      {/* Status Card */}
      <div className="card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
            Live Sharing Active
          </div>
          <button
            onClick={() => (isEditing ? handleSaveEdit() : setIsEditing(true))}
            style={{
              background: 'none',
              border: 'none',
              color: '#0F766E',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div style={{ fontSize: '15px', fontWeight: 700, color: '#14213D', marginBottom: '10px' }}>
          Sharing with: <span style={{ color: '#0F766E' }}>{contactNames || 'Trusted Contacts'}</span>
        </div>

        {/* Current Place Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F1F5F9',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '12px',
          }}
        >
          <MapPin size={18} color="#0F766E" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#14213D' }}>
            {currentPlace || 'Near City Hospital'}
          </span>
        </div>

        {/* Transport & Vehicle display/edit */}
        {isEditing ? (
          <div style={{ animation: 'slideDown 0.2s ease-out' }}>
            <div className="chips-container" style={{ marginBottom: '8px' }}>
              {(['BUS', 'CAR', 'TRAIN', 'AUTO', 'Walking', 'OTHER'] as TransportType[]).map((t) => (
                <button
                  key={t}
                  className={`chip ${transport === t ? 'selected' : ''}`}
                  onClick={() => setTransport(t)}
                  style={{ padding: '6px 10px', fontSize: '12px', minHeight: '36px' }}
                >
                  {t}
                </button>
              ))}
            </div>
            {transport === 'OTHER' && (
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Specify transport (e.g. Metro, Bike, E-Rickshaw)"
                  value={transport === 'OTHER' ? '' : transport}
                  onChange={(e) => setTransport(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', minHeight: '38px' }}
                  autoFocus
                />
              </div>
            )}
            {!isWalking && (
              <input
                type="text"
                className="input-field"
                placeholder="Vehicle number"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                style={{ padding: '8px 12px', fontSize: '13px', minHeight: '38px', marginBottom: '8px' }}
              />
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#CCFBF1',
                color: '#0F766E',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {transport}
            </span>
            {vehicle && (
              <span
                style={{
                  background: '#EEF2F6',
                  color: '#14213D',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {vehicle}
              </span>
            )}
          </div>
        )}

        {/* Stop Sharing Button */}
        <button
          onClick={onStopSharing}
          style={{
            width: '100%',
            minHeight: '48px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            color: '#14213D',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          <StopCircle size={18} color="#B71C1C" />
          Stop Sharing
        </button>
      </div>

      {/* Bottom SOS Button */}
      <div className="sos-bottom-container">
        <button className="btn-sos" onClick={onTriggerSOS}>
          <div className="btn-sos-title">
            <AlertOctagon size={24} />
            SOS
          </div>
          <div className="btn-sos-subtext">5-second countdown, can be cancelled</div>
        </button>
      </div>
    </div>
  );
};
