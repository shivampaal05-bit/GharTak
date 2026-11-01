import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Send, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { SOSEvent } from '../types';

interface S5bSOSStatusProps {
  sos: SOSEvent;
  onResolve: () => void;
  onSimulateContactAck: (contactId: string) => void;
}

export const S5b_SOSStatus: React.FC<S5bSOSStatusProps> = ({
  sos,
  onResolve,
  onSimulateContactAck,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Delivery status badge and text
  const getDeliveryBadge = () => {
    switch (sos.delivery_channel) {
      case 'INTERNET':
        return {
          icon: <Wifi size={16} color="#0F766E" />,
          title: 'Sent via Internet',
          bg: '#CCFBF1',
          color: '#0F766E',
        };
      case 'SMS_PROMPTED':
        return {
          icon: <Send size={16} color="#B45309" />,
          title: 'Sent via SMS Fallback',
          bg: '#FEF3C7',
          color: '#B45309',
        };
      case 'PHONE_SAVED':
      default:
        return {
          icon: <WifiOff size={16} color="#B71C1C" />,
          title: 'Saved on device, sending when signal returns',
          bg: '#FEE2E2',
          color: '#B71C1C',
        };
    }
  };

  const deliveryBadge = getDeliveryBadge();

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#F6F7FB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 16px',
      }}
    >
      <div>
        {/* Top Header Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #B71C1C',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(183, 28, 28, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <AlertCircle size={24} color="#B71C1C" />
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, color: '#B71C1C' }}>
              SOS Alert Sent
            </h2>
          </div>

          {/* Delivery State indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: deliveryBadge.bg,
              color: deliveryBadge.color,
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
              marginTop: '4px',
            }}
          >
            {deliveryBadge.icon}
            <span>{deliveryBadge.title}</span>
          </div>

          <div style={{ fontSize: '13px', color: '#4A5568', marginTop: '10px' }}>
            Your location is updating live every 5 seconds.
          </div>
        </div>

        {/* Per-Contact Delivery & Acknowledgment Status */}
        <div className="card" style={{ margin: '0 0 16px 0', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#14213D', marginBottom: '12px' }}>
            Contacts Alert Status:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sos.recipients.map((rec) => {
              const isDekhLiya = Boolean(rec.ack_at);
              return (
                <div
                  key={rec.contact_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isDekhLiya ? '#DCFCE7' : '#F1F5F9',
                    border: '1px solid',
                    borderColor: isDekhLiya ? '#86EFAC' : '#E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#14213D' }}>{rec.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{rec.phone_e164}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: isDekhLiya ? '#15803D' : '#64748B',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isDekhLiya ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      {isDekhLiya ? 'Viewed' : 'Sent'}
                    </span>

                    {/* Simulation button for demo if not yet ack */}
                    {!isDekhLiya && (
                      <button
                        onClick={() => onSimulateContactAck(rec.contact_id)}
                        title="Simulate Viewed action"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#0F766E',
                        }}
                      >
                        Mark Viewed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Safe Hoon Button */}
      <div>
        <button
          onClick={() => setShowConfirmModal(true)}
          style={{
            width: '100%',
            minHeight: '52px',
            background: '#0F766E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
          }}
        >
          <ShieldCheck size={20} />
          I Am Safe
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#14213D', marginBottom: '8px' }}>
              Are you safe now?
            </div>
            <div style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.5, marginBottom: '20px' }}>
              Tapping 'I Am Safe' will stop the emergency SOS and notify your trusted contacts that you are safe.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  minHeight: '44px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                No, Keep SOS
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onResolve();
                }}
                style={{
                  minHeight: '44px',
                  background: '#0F766E',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Yes, I Am Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
