import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Check, Copy, ExternalLink, Compass } from 'lucide-react';
import { MapView } from '../components/MapView';
import { SOSEvent, PoliceStationInfo } from '../types';

interface S9SOSAlertReceiverProps {
  userName: string;
  userPhone: string;
  sos: SOSEvent;
  policeStation: PoliceStationInfo;
  onCall112: () => void;
  onCallUser: () => void;
  onAckDekhLiya: () => void;
  isAcked: boolean;
  onBack: () => void;
}

export const S9_SOSAlertReceiver: React.FC<S9SOSAlertReceiverProps> = ({
  userName,
  userPhone,
  sos,
  policeStation,
  onCall112,
  onCallUser,
  onAckDekhLiya,
  isAcked,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDetails = () => {
    const details = `SOS Alert! ${userName} needs emergency help. Transport: ${sos.transport} ${sos.vehicle_number || ''}. Near: ${sos.place_label}. Time: ${sos.pressed_at}. Location: https://maps.google.com/?q=${sos.lat},${sos.lng}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F6F7FB', overflowY: 'auto' }}>
      {/* Red Header: "SOS ALERT" & "{name} needs emergency help" */}
      <div
        style={{
          background: '#B71C1C',
          color: '#FFFFFF',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(183, 28, 28, 0.3)',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
            SOS ALERT
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>
            {userName} needs emergency help
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '6px',
            color: '#FFFFFF',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* FIRST CONTROL: RED 112 BUTTON (64px) */}
        <button className="btn-112" onClick={onCall112}>
          <PhoneCall size={26} />
          Call 112 (Emergency Police)
        </button>

        {/* Live Map Preview in SOS Mode */}
        <MapView lat={sos.lat} lng={sos.lng} placeLabel={sos.place_label} isSOS={true} transport={sos.transport} height="200px" />

        {/* Details Card */}
        <div className="card" style={{ margin: '14px 0 10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#B71C1C', textTransform: 'uppercase', marginBottom: '8px' }}>
            Alert Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Transport:</span>
              <span style={{ fontWeight: 700, color: '#14213D' }}>{sos.transport}</span>
            </div>

            {sos.vehicle_number && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Vehicle Number:</span>
                <span style={{ fontWeight: 700, color: '#14213D' }}>{sos.vehicle_number}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Near:</span>
              <span style={{ fontWeight: 700, color: '#0F766E' }}>{sos.place_label}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>SOS Triggered:</span>
              <span style={{ fontWeight: 600, color: '#14213D' }}>
                {new Date(sos.pressed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Last Update:</span>
              <span style={{ fontWeight: 600, color: '#15803D' }}>Updating Live</span>
            </div>
          </div>

          {/* Button: Open in Maps */}
          <a
            href={`https://maps.google.com/?q=${sos.lat},${sos.lng}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '44px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              color: '#14213D',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              marginTop: '12px',
            }}
          >
            <ExternalLink size={16} />
            Open Live Location in Google Maps
          </a>
        </div>

        {/* Police Card */}
        <div
          className="card"
          style={{
            margin: '0 0 14px',
            padding: '16px',
            border: '1px solid #CBD5E1',
            background: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldAlert size={18} color="#1E293B" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
              {policeStation.name}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
            {policeStation.address}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', marginBottom: '8px' }}>
            Distance: Approx {policeStation.distance_m} meters
          </div>

          {/* Disclaimer as required by spec */}
          <div
            style={{
              fontSize: '12px',
              color: '#B45309',
              background: '#FEF3C7',
              padding: '6px 10px',
              borderRadius: '8px',
              marginBottom: '10px',
              lineHeight: 1.4,
            }}
          >
            Station phone number is unverified. Calling 112 is recommended.
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={`https://maps.google.com/?daddr=${encodeURIComponent(policeStation.address)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '40px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#14213D',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Compass size={15} />
              Get Directions in Google Maps
            </a>

            {/* Station call button appears ONLY when phone_verified is true */}
            {policeStation.phone_verified && (
              <a
                href={`tel:${policeStation.phone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '40px',
                  padding: '0 12px',
                  background: '#0F766E',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <PhoneCall size={14} />
                Call Station
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons: Call {name} & Acknowledge */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <button
            onClick={onCallUser}
            style={{
              minHeight: '48px',
              background: '#0F766E',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <PhoneCall size={16} />
            Call {userName.split(' ')[0]}
          </button>

          <button
            onClick={onAckDekhLiya}
            disabled={isAcked}
            style={{
              minHeight: '48px',
              background: isAcked ? '#DCFCE7' : '#FFFFFF',
              border: '1.5px solid',
              borderColor: isAcked ? '#15803D' : '#CBD5E1',
              borderRadius: '12px',
              color: isAcked ? '#15803D' : '#14213D',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: isAcked ? 'default' : 'pointer',
            }}
          >
            <Check size={18} />
            {isAcked ? 'Seen ✓' : 'I Have Seen This'}
          </button>
        </div>

        {/* Link: Copy details */}
        <div style={{ textAlign: 'center', marginTop: '6px', marginBottom: '16px' }}>
          <button
            onClick={handleCopyDetails}
            style={{
              background: 'none',
              border: 'none',
              color: '#0F766E',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'underline',
            }}
          >
            <Copy size={14} />
            {copied ? 'Emergency details copied!' : 'Copy Emergency Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
