import React from 'react';
import { Phone, ExternalLink, Clock, PhoneCall, Radio } from 'lucide-react';
import { MapView } from '../components/MapView';

interface WebLiveViewProps {
  token: string;
  shareData: {
    userName: string;
    userPhone: string;
    transport: string;
    vehicleNumber?: string;
    placeLabel: string;
    lat: number;
    lng: number;
    updatedAt: string;
    isEnded: boolean;
    isSOSActive: boolean;
  };
  onBackToApp: () => void;
}

export const WebLiveView: React.FC<WebLiveViewProps> = ({
  token,
  shareData,
  onBackToApp,
}) => {
  if (shareData.isEnded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F6F7FB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '20px',
            padding: '36px 24px',
            maxWidth: '420px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Clock size={32} color="#64748B" />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: '#14213D', marginBottom: '8px' }}>
            This journey has ended
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
            In accordance with our privacy policy, location data is immediately and permanently deleted from the server once a trip ends.
          </p>
          <button
            onClick={onBackToApp}
            style={{
              background: '#0F766E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Open GharTak App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FB', display: 'flex', flexDirection: 'column' }}>
      {/* Web Header */}
      <header
        style={{
          background: shareData.isSOSActive ? '#B71C1C' : '#FFFFFF',
          color: shareData.isSOSActive ? '#FFFFFF' : '#14213D',
          borderBottom: shareData.isSOSActive ? 'none' : '1px solid #E1E5EC',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800 }}>
            GharTak Public Live View
          </span>
          {shareData.isSOSActive ? (
            <span
              style={{
                background: 'rgba(255,255,255,0.25)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              SOS ALERT ACTIVE
            </span>
          ) : (
            <span className="pill-live">
              <Radio size={12} />
              Live
            </span>
          )}
        </div>

        <button
          onClick={onBackToApp}
          style={{
            background: shareData.isSOSActive ? '#FFFFFF' : '#0F766E',
            color: shareData.isSOSActive ? '#B71C1C' : '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Open App Simulator
        </button>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, maxWidth: '720px', width: '100%', margin: '0 auto', padding: '20px 16px' }}>
        {/* If SOS is active, prominent 112 button */}
        {shareData.isSOSActive && (
          <div style={{ marginBottom: '16px' }}>
            <a
              href="tel:112"
              className="btn-112"
              style={{ textDecoration: 'none' }}
            >
              <PhoneCall size={26} />
              Call 112 (Emergency Police)
            </a>
          </div>
        )}

        {/* Map */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
          <MapView
            lat={shareData.lat}
            lng={shareData.lng}
            placeLabel={shareData.placeLabel}
            isSOS={shareData.isSOSActive}
            transport={shareData.transport}
            height="340px"
          />
        </div>

        {/* Journey Details Card */}
        <div className="card" style={{ margin: 0, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#14213D' }}>
                {shareData.userName}'s Live Journey
              </h2>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Token: /v/{token.slice(0, 8)}... (Read-only web link)
              </div>
            </div>

            <a
              href={`tel:${shareData.userPhone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0F766E',
                color: '#FFFFFF',
                padding: '8px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <Phone size={15} />
              Call
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Transport</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#14213D' }}>{shareData.transport}</div>
            </div>

            {shareData.vehicleNumber && (
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Vehicle Number</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#14213D' }}>{shareData.vehicleNumber}</div>
              </div>
            )}

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Near (Approximate)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F766E' }}>{shareData.placeLabel}</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Live Coordinates</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#14213D', fontFamily: 'monospace' }}>
                {shareData.lat.toFixed(4)}, {shareData.lng.toFixed(4)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
            <a
              href={`https://maps.google.com/?q=${shareData.lat},${shareData.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '44px',
                background: '#FFFFFF',
                border: '1.5px solid #0F766E',
                borderRadius: '10px',
                color: '#0F766E',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <ExternalLink size={16} />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
