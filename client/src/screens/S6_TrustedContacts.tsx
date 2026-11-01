import React from 'react';
import { UserPlus, Trash2, Clock, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { TrustedContact } from '../types';

interface S6TrustedContactsProps {
  contacts: TrustedContact[];
  onOpenPicker: () => void;
  onRemoveContact: (id: string) => void;
  onBack: () => void;
}

export const S6_TrustedContacts: React.FC<S6TrustedContactsProps> = ({
  contacts,
  onOpenPicker,
  onRemoveContact,
  onBack,
}) => {
  const acceptedCount = contacts.filter((c) => c.status === 'ACCEPTED').length;
  const isMaxReached = acceptedCount >= 5;

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: '#14213D' }}>
              Trusted Contacts
            </h2>
            <div style={{ fontSize: '13px', color: '#4A5568' }}>
              {acceptedCount}/5 Contacts added
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>

        {/* Contacts List or Empty State */}
        {contacts.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E5EC',
              borderRadius: '16px',
              padding: '32px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#CCFBF1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Shield size={32} color="#0F766E" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#14213D', marginBottom: '8px' }}>
              Why do you need trusted contacts?
            </div>
            <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: 1.5, maxWidth: '280px' }}>
              When you tap SOS or share your journey, only these trusted contacts will be able to view your live location and emergency alerts.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contacts.map((c) => {
              const isAccepted = c.status === 'ACCEPTED';
              return (
                <div
                  key={c.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E1E5EC',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#14213D' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{c.phone_e164}</div>
                    <div style={{ marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: isAccepted ? '#DCFCE7' : '#FEF3C7',
                          color: isAccepted ? '#15803D' : '#B45309',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isAccepted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isAccepted ? 'Accepted' : 'Pending (expires in 6h)'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveContact(c.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    title="Remove contact"
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contact Button */}
      <div style={{ marginTop: '20px' }}>
        {isMaxReached ? (
          <div
            style={{
              background: '#FEE2E2',
              color: '#B71C1C',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={16} /> Maximum 5 contacts limit reached
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenPicker}>
            <UserPlus size={18} />
            + Add Trusted Contact
          </button>
        )}
      </div>
    </div>
  );
};
