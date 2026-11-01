import React, { useState } from 'react';
import { User, Phone, CheckCircle, Edit3 } from 'lucide-react';

interface S2ProfileProps {
  initialName?: string;
  initialPhone?: string;
  onConfirm: (name: string, phone: string) => void;
}

export const S2_Profile: React.FC<S2ProfileProps> = ({
  initialName = 'Priya Sharma',
  initialPhone = '+919876543210',
  onConfirm,
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!phone.startsWith('+91') || phone.length < 13) {
      setError('Please enter a valid 10-digit mobile number with +91.');
      return;
    }
    setError('');
    setShowConfirmStep(true);
  };

  const handleSahiHai = () => {
    onConfirm(name, phone);
  };

  const handleBadlo = () => {
    setShowConfirmStep(false);
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#F6F7FB',
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '24px',
            fontWeight: 800,
            color: '#14213D',
            marginBottom: '6px',
          }}
        >
          Your Profile
        </h2>
        <p style={{ fontSize: '14px', color: '#4A5568', marginBottom: '24px' }}>
          Your trusted contacts will see this name and phone number during an emergency.
        </p>

        {/* Name Field */}
        <div className="card" style={{ margin: '0 0 16px 0', padding: '16px' }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} color="#0F766E" />
            Full Name
          </label>
          <input
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        {/* Phone Field */}
        <div className="card" style={{ margin: '0 0 16px 0', padding: '16px' }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={16} color="#0F766E" />
            Mobile Number (+91)
          </label>
          <input
            type="tel"
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
          />
          {error && <div style={{ color: '#B71C1C', fontSize: '12px', marginTop: '6px' }}>{error}</div>}
          <div className="input-hint">No SMS verification required. Instant setup.</div>
        </div>
      </div>

      {/* Confirmation Step */}
      {showConfirmStep ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #0F766E',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F766E', textTransform: 'uppercase' }}>
            Confirm Phone Number
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#14213D', margin: '8px 0 16px' }}>
            Is this your number? <span style={{ color: '#0F766E' }}>{phone}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={handleBadlo}
              style={{
                minHeight: '48px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Edit3 size={16} />
              Edit
            </button>

            <button
              onClick={handleSahiHai}
              style={{
                minHeight: '48px',
                background: '#0F766E',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 10px rgba(15, 118, 110, 0.3)',
              }}
            >
              <CheckCircle size={16} />
              Yes, Confirm
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-primary" onClick={handleNext}>
          Continue
        </button>
      )}
    </div>
  );
};
