import React from 'react';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

interface S1LoginProps {
  onLogin: (userName?: string) => void;
  onOpenPrivacy: () => void;
}

export const S1_Login: React.FC<S1LoginProps> = ({ onLogin, onOpenPrivacy }) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 24px 28px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '24px',
            backgroundColor: '#0F766E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 24px rgba(15, 118, 110, 0.25)',
            marginBottom: '20px',
          }}
        >
          <ShieldCheck size={48} color="#FFFFFF" />
        </div>

        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '32px',
            fontWeight: 800,
            color: '#14213D',
            letterSpacing: '-0.5px',
            marginBottom: '8px',
          }}
        >
          GharTak
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#4A5568',
            textAlign: 'center',
            maxWidth: '290px',
            lineHeight: 1.5,
          }}
        >
          Safe travels, every step of the way. Share your live journey and send instant SOS alerts with one tap.
        </p>

        <div
          style={{
            marginTop: '32px',
            background: '#F6F7FB',
            border: '1px solid #E1E5EC',
            borderRadius: '16px',
            padding: '16px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <HeartHandshake size={28} color="#0F766E" />
          <div style={{ fontSize: '13px', color: '#14213D', lineHeight: 1.4 }}>
            <strong>100% Privacy-First:</strong> Location history is never saved. Only your selected trusted contacts can see your current location.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {/* Google Login Button */}
        <button
          onClick={() => onLogin('Priya Sharma')}
          style={{
            width: '100%',
            minHeight: '52px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#14213D',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Sign in with Google
        </button>

        <div style={{ fontSize: '12px', color: '#718096', textAlign: 'center', lineHeight: 1.5 }}>
          By continuing, you agree to our{' '}
          <span style={{ color: '#0F766E', textDecoration: 'underline', cursor: 'pointer' }} onClick={onOpenPrivacy}>
            Terms
          </span>{' '}
          and{' '}
          <span style={{ color: '#0F766E', textDecoration: 'underline', cursor: 'pointer' }} onClick={onOpenPrivacy}>
            Privacy Policy
          </span>
          . No password or OTP required.
        </div>
      </div>
    </div>
  );
};
