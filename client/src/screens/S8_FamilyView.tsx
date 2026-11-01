import React from 'react';
import { Phone, MessageSquare, MapPin, Clock, Navigation, Radio } from 'lucide-react';
import { MapView } from '../components/MapView';
import { TransportType } from '../types';

interface S8FamilyViewProps {
  personName: string;
  phone: string;
  transport: TransportType;
  vehicleNumber?: string;
  placeLabel: string;
  lat: number;
  lng: number;
  minutesAgo: number;
  onCall: () => void;
  onMessage: () => void;
  onBack: () => void;
}

export const S8_FamilyView: React.FC<S8FamilyViewProps> = ({
  personName,
  phone,
  transport,
  vehicleNumber,
  placeLabel,
  lat,
  lng,
  minutesAgo,
  onCall,
  onMessage,
  onBack,
}) => {
  const isPurani = minutesAgo >= 3;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F6F7FB', position: 'relative' }}>
      {/* Top Bar */}
      <div
        style={{
          height: '52px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E1E5EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 30,
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#14213D' }}>
          {personName}'s Journey
        </div>
        <button
          onClick={onBack}
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      </div>

      {/* Map in the top half with live dot */}
      <MapView lat={lat} lng={lng} placeLabel={placeLabel} transport={transport} height="340px" />

      {/* Bottom Sheet */}
      <div className="bottom-sheet" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="sheet-handle" />

          {/* Name & Live / Purani pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#14213D' }}>{personName}</h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>{phone}</div>
            </div>

            <div>
              {isPurani ? (
                <span className="pill-purani">
                  <Clock size={12} />
                  Old Location
                </span>
              ) : (
                <span className="pill-live">
                  <Radio size={12} />
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Details Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Transport */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={15} /> Transport
              </span>
              <span style={{ fontWeight: 700, color: '#14213D' }}>{transport}</span>
            </div>

            {/* Vehicle Number */}
            {vehicleNumber && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Vehicle Number</span>
                <span style={{ fontWeight: 700, color: '#14213D' }}>{vehicleNumber}</span>
              </div>
            )}

            {/* Near / Landmark */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} /> Near
              </span>
              <span style={{ fontWeight: 700, color: '#0F766E' }}>{placeLabel}</span>
            </div>

            {/* Update Time */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> Last Update
              </span>
              <span style={{ fontWeight: 600, color: '#14213D' }}>
                {minutesAgo === 0 ? 'Just now' : `${minutesAgo} min ago`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Call {name} & Message */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={onCall}
            style={{
              minHeight: '48px',
              background: '#0F766E',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Phone size={17} />
            Call {personName.split(' ')[0]}
          </button>

          <button
            onClick={onMessage}
            style={{
              minHeight: '48px',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '12px',
              color: '#14213D',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <MessageSquare size={17} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};
