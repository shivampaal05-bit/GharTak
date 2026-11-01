import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Trash2, EyeOff, FileText, Mail } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FB', color: '#14213D', padding: '30px 20px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', background: '#FFFFFF', borderRadius: '24px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} />
          Back to App
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: '#CCFBF1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={32} color="#0F766E" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: '#14213D' }}>
              GharTak Privacy Policy
            </h1>
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Effective Date: 31 October 2026 | Build Specification v1.0 Compliance
            </div>
          </div>
        </div>

        <div style={{ fontSize: '15px', color: '#4A5568', lineHeight: 1.7, marginBottom: '28px' }}>
          GharTak is designed around one sacred principle: <strong>Safety Reliability with Absolute Privacy</strong>. We are not a tracking app, an ad network, or a social network. Here is transparently how your data is handled.
        </div>

        {/* 1. What Data is Collected */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14213D', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <FileText size={20} color="#0F766E" />
            1. What Data is Collected & Why
          </h2>
          <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.6 }}>
            We collect only the bare minimum required for your personal safety:
          </p>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: '#4A5568', lineHeight: 1.6, marginTop: '8px' }}>
            <li><strong>Profile:</strong> Name and mobile number (in E.164 format) to identify you to your loved ones during a journey or SOS.</li>
            <li><strong>Transport Choice:</strong> Mode of travel (Bus, Car, Train, Auto, Paidal) and optional vehicle registration number.</li>
            <li><strong>Live Location:</strong> Current GPS coordinates solely while an active share or SOS is triggered by you.</li>
          </ul>
        </section>

        {/* 2. Who Sees Your Data */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14213D', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <EyeOff size={20} color="#0F766E" />
            2. Who Sees It
          </h2>
          <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.6 }}>
            <strong>Only your explicitly accepted trusted contacts (maximum 5).</strong> Your contacts see only your current live point. We never sell, monetize, or expose your data to advertisers, third-party trackers, or public feeds. Full contact lists on your phone never leave your device.
          </p>
        </section>

        {/* 3. Instant Deletion & Zero History */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14213D', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Trash2 size={20} color="#0F766E" />
            3. What is Deleted and When (Zero Location History)
          </h2>
          <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.6 }}>
            When you tap <strong>"Stop Sharing"</strong>, the active location row is <strong>immediately and permanently deleted</strong> from our database, and the web view token is revoked. Contacts can never review past breadcrumb trails or where you travelled yesterday.
          </p>
        </section>

        {/* 4. Retention Rules */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14213D', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Lock size={20} color="#0F766E" />
            4. Data Retention Limits
          </h2>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: '#4A5568', lineHeight: 1.6 }}>
            <li><strong>SOS Trail:</strong> Emergency rolling trail points are deleted within 24 hours of resolving an SOS.</li>
            <li><strong>Audit Records:</strong> Minimal trip metadata (without coordinates) kept strictly for safety verification according to system configuration.</li>
            <li><strong>Cleanup Engine:</strong> Stale shares inactive for 12 hours are automatically closed and scrubbed.</li>
          </ul>
        </section>

        {/* 5. User Controls: Delete My Account & Data */}
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14213D', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Trash2 size={20} color="#B71C1C" />
            5. User Controls: "Delete My Account & Data"
          </h2>
          <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.6 }}>
            You have complete sovereignty over your data. You can stop sharing at any moment, remove contacts with a single tap, or permanently wipe your account and all associated records via the <strong>"Delete My Account & Data"</strong> button in Settings.
          </p>
        </section>

        {/* 6. Contact */}
        <div style={{ background: '#F1F5F9', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Mail size={24} color="#0F766E" />
          <div style={{ fontSize: '13px', color: '#334155' }}>
            <strong>Privacy Questions or Grievances:</strong> Reach out to our privacy officer directly at <code>privacy@ghartak.app</code>.
          </div>
        </div>
      </div>
    </div>
  );
};
