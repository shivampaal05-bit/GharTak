import React, { useState } from 'react';
import { Trash2, LogOut, ShieldCheck, ExternalLink, AlertTriangle, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';

interface S10SettingsProps {
  user: UserProfile;
  onOpenPrivacy: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
  onBack: () => void;
}

export const S10_Settings: React.FC<S10SettingsProps> = ({
  user,
  onOpenPrivacy,
  onDeleteAccount,
  onLogout,
  onBack,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#14213D' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: '#14213D' }}>
              Settings
            </h2>
          </div>
        </div>

        {/* User Profile Info Card */}
        <div className="card" style={{ margin: '0 0 16px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', marginBottom: '4px' }}>
            Your Account
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#14213D' }}>{user.name}</div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>{user.email}</div>
          <div style={{ fontSize: '13px', color: '#14213D', marginTop: '4px' }}>
            Mobile: <strong>{user.phone_e164 || 'Not set'}</strong>
          </div>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Privacy Policy Link */}
          <button
            onClick={onOpenPrivacy}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E5EC',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#14213D',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="#0F766E" />
              Privacy Policy
            </div>
            <ExternalLink size={16} color="#94A3B8" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E5EC',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#14213D',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogOut size={18} color="#475569" />
              Log Out
            </div>
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            width: '100%',
            minHeight: '48px',
            background: 'transparent',
            border: '1.5px solid #FCA5A5',
            color: '#B71C1C',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Trash2 size={16} />
          Delete My Account & Data
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.65)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B71C1C', marginBottom: '8px' }}>
              <AlertTriangle size={22} />
              <div style={{ fontSize: '18px', fontWeight: 800 }}>Delete Account & All Data?</div>
            </div>

            <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: 1.5, marginBottom: '20px' }}>
              Your account, registered devices, trusted contacts, active shares, and saved location records will be permanently deleted immediately. This action cannot be undone.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
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
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteAccount();
                }}
                style={{
                  minHeight: '44px',
                  background: '#B71C1C',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
