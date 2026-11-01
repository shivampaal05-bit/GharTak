import React from 'react';
import { Shield, Radio, AlertOctagon, PhoneCall, Sparkles, ArrowRight } from 'lucide-react';

interface MarketingPageProps {
  onLaunchApp: () => void;
  onOpenPrivacy: () => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ onLaunchApp, onOpenPrivacy }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC' }}>
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(15, 118, 110, 0.5)',
            }}
          >
            <Shield size={24} />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
            GharTak
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={onOpenPrivacy}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Privacy Policy
          </button>
          <button
            onClick={onLaunchApp}
            style={{
              background: '#0F766E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 118, 110, 0.4)',
            }}
          >
            Try App Simulator
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 118, 110, 0.2)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            color: '#2DD4BF',
            padding: '6px 16px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '24px',
          }}
        >
          <Sparkles size={16} />
          Safety-First Android App & Web Companion
        </div>

        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '56px',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            lineHeight: 1.15,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Safe Travels, Every Step of the Way.<br />
          <span style={{ color: '#14B8A6', WebkitTextFillColor: '#14B8A6' }}>
            Emergency SOS with Guaranteed Fallback.
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: '#94A3B8', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Select how you are travelling (Bus, Car, Train, Auto, Walking, or Custom), share your live journey, and alert your trusted contacts with one tap. Automatic SMS fallback if internet drops.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={onLaunchApp}
            style={{
              background: '#0F766E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(15, 118, 110, 0.5)',
              transition: 'transform 0.2s',
            }}
          >
            Launch Live Interactive App
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Radio size={24} color="#FFFFFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#FFFFFF' }}>
              Live Share (No History Tracking)
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
              Contacts see only your current live point. When your trip ends, location records are immediately and permanently deleted from the server. Zero tracking history.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#B71C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <AlertOctagon size={24} color="#FFFFFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#FFFFFF' }}>
              Guaranteed Fallback SOS
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
              5-second countdown with tactile vibration. If internet connectivity drops, your emergency alert is immediately dispatched via SMS with precise coordinates and Google Maps link.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <PhoneCall size={24} color="#38BDF8" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#FFFFFF' }}>
              112 Direct Police Integration
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
              Emergency receivers get a prominent 64px 112 direct police dialer, nearby police station distance, and honest approximate location wording.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
