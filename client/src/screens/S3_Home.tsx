import React, { useState } from 'react';
import { Bus, Car, Train, Navigation, Footprints, MoreHorizontal, AlertOctagon, Share2, MessageCircle, Shield } from 'lucide-react';
import { TransportType } from '../types';

interface S3HomeProps {
  userName: string;
  onStartShare: (transport: TransportType, vehicleNumber?: string) => void;
  onTriggerSOS: () => void;
  onWhatsAppShare: (transport: TransportType, vehicleNumber?: string) => void;
  onManageContacts: () => void;
  acceptedContactsCount: number;
}

export const S3_Home: React.FC<S3HomeProps> = ({
  userName,
  onStartShare,
  onTriggerSOS,
  onWhatsAppShare,
  onManageContacts,
  acceptedContactsCount,
}) => {
  // Remember last choice in state/localStorage
  const [transport, setTransport] = useState<TransportType>(() => {
    return (localStorage.getItem('ghartak_last_transport') as TransportType) || 'BUS';
  });
  const [customTransport, setCustomTransport] = useState<string>(() => {
    return localStorage.getItem('ghartak_last_custom_transport') || '';
  });
  const [vehicleNumber, setVehicleNumber] = useState('');

  const handleSelectTransport = (t: TransportType) => {
    setTransport(t);
    localStorage.setItem('ghartak_last_transport', t);
  };

  const handleCustomTransportChange = (val: string) => {
    setCustomTransport(val);
    localStorage.setItem('ghartak_last_custom_transport', val);
  };

  const isWalking = transport === 'PAIDAL' || transport === 'WALK' || transport === 'WALKING';
  const isOther = transport === 'OTHER';

  const getEffectiveTransport = (): string => {
    if (isOther) {
      return customTransport.trim() ? customTransport.trim() : 'Other';
    }
    if (isWalking) {
      return 'Walking';
    }
    return transport;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F6F7FB' }}>
      {/* Top Header */}
      <div className="app-header">
        <div>
          <div className="app-title">GharTak</div>
          <div className="app-greeting">Welcome, {userName}</div>
        </div>
        <button
          onClick={onManageContacts}
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '20px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#0F766E',
            cursor: 'pointer',
          }}
        >
          <Shield size={14} color="#0F766E" />
          Contacts ({acceptedContactsCount})
        </button>
      </div>

      {/* Main Card: How are you travelling? */}
      <div className="card" style={{ marginTop: '8px' }}>
        <div className="card-title">How are you travelling?</div>

        <div className="chips-container grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
          <button
            className={`chip ${transport === 'BUS' ? 'selected' : ''}`}
            onClick={() => handleSelectTransport('BUS')}
          >
            <Bus size={17} />
            Bus
          </button>

          <button
            className={`chip ${transport === 'CAR' ? 'selected' : ''}`}
            onClick={() => handleSelectTransport('CAR')}
          >
            <Car size={17} />
            Car
          </button>

          <button
            className={`chip ${transport === 'TRAIN' ? 'selected' : ''}`}
            onClick={() => handleSelectTransport('TRAIN')}
          >
            <Train size={17} />
            Train
          </button>

          <button
            className={`chip ${transport === 'AUTO' ? 'selected' : ''}`}
            onClick={() => handleSelectTransport('AUTO')}
          >
            <Navigation size={17} />
            Auto
          </button>

          <button
            className={`chip ${isWalking ? 'selected' : ''}`}
            onClick={() => handleSelectTransport('PAIDAL')}
          >
            <Footprints size={17} />
            Walking
          </button>

          <button
            className={`chip ${transport === 'OTHER' ? 'selected' : ''}`}
            onClick={() => handleSelectTransport('OTHER')}
          >
            <MoreHorizontal size={17} />
            Other
          </button>
        </div>

        {/* If Other selected: Custom transport input */}
        {isOther && (
          <div className="input-group" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <label className="input-label">Specify transport mode</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Metro, Bike, E-Rickshaw"
              value={customTransport}
              onChange={(e) => handleCustomTransportChange(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Vehicle Number (optional) - Hidden when Walking is selected */}
        {!isWalking && (
          <div className="input-group" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <label className="input-label">Vehicle Number (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. UP32 AB 1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            />
            <div className="input-hint">Leave blank if waiting on the road or walking</div>
          </div>
        )}

        {/* Primary Button: Share Live Location */}
        <button
          className="btn-primary"
          onClick={() => onStartShare(getEffectiveTransport(), isWalking ? undefined : vehicleNumber)}
          style={{ marginTop: '8px' }}
        >
          <Share2 size={18} />
          Share Live Location
        </button>

        {/* Secondary Outlined Button: Share via WhatsApp */}
        <button
          className="btn-outline"
          onClick={() => onWhatsAppShare(getEffectiveTransport(), isWalking ? undefined : vehicleNumber)}
        >
          <MessageCircle size={18} />
          Share via WhatsApp
        </button>
      </div>

      {/* Privacy Note */}
      <div className="privacy-note">
        Only visible to trusted contacts. You can stop sharing anytime.
      </div>

      {/* Bottom SOS Trigger Button */}
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
