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
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800 }}>
              GharTak Public Live View
            </span>
            {shareData.isSOSActive ? (
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  padding: '4px 10px',
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
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Open App Simulator
          </button>
        </div>
      </header>

      {/* Main Content - Fully Responsive */}
      <div className="web-live-container">
        {/* If SOS is active, prominent 112 button */}
        {shareData.isSOSActive && (
          <div className="web-live-sos-banner">
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

        <div className="web-live-grid">
          {/* Map Column */}
          <div className="web-live-map-card">
            <MapView
              lat={shareData.lat}
              lng={shareData.lng}
              placeLabel={shareData.placeLabel}
              isSOS={shareData.isSOSActive}
              transport={shareData.transport}
              height="100%"
            />
          </div>

          {/* Journey Details Card Column */}
          <div className="web-live-details-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#14213D', marginBottom: '4px' }}>
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
                  gap: '8px',
                  background: '#0F766E',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
                }}
              >
                <Phone size={16} />
                Call {shareData.userName.split(' ')[0]}
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Transport Mode</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#14213D', marginTop: '4px' }}>{shareData.transport}</div>
              </div>

              {shareData.vehicleNumber && (
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Vehicle Number</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#14213D', marginTop: '4px' }}>{shareData.vehicleNumber}</div>
                </div>
              )}

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Near (Approximate)</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F766E', marginTop: '4px' }}>{shareData.placeLabel}</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Live Coordinates</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#14213D', fontFamily: 'monospace', marginTop: '4px' }}>
                  {shareData.lat.toFixed(4)}, {shareData.lng.toFixed(4)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <a
                href={`https://maps.google.com/?q=${shareData.lat},${shareData.lng}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '48px',
                  background: '#FFFFFF',
                  border: '1.5px solid #0F766E',
                  borderRadius: '12px',
                  color: '#0F766E',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '15px',
                  transition: 'all 0.2s',
                }}
              >
                <ExternalLink size={18} />
                Open in Google Maps
              </a>

              <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>
                🔒 Privacy guaranteed: Location data is instantly deleted from server when the journey is stopped. Zero history tracking.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
