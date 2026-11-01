import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Globe,
  Shield,
  Wifi,
  WifiOff,
  UserCheck,
  Radio,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  UserProfile,
  TrustedContact,
  ShareSession,
  SOSEvent,
  PoliceStationInfo,
  ScreenId,
  TransportType,
} from './types';

// Screens
import { S1_Login } from './screens/S1_Login';
import { S2_Profile } from './screens/S2_Profile';
import { S3_Home } from './screens/S3_Home';
import { S4_SharingActive } from './screens/S4_SharingActive';
import { S5_SOSCountdown } from './screens/S5_SOSCountdown';
import { S5b_SOSStatus } from './screens/S5b_SOSStatus';
import { S6_TrustedContacts } from './screens/S6_TrustedContacts';
import { S7_ContactPicker } from './screens/S7_ContactPicker';
import { S8_FamilyView } from './screens/S8_FamilyView';
import { S9_SOSAlertReceiver } from './screens/S9_SOSAlertReceiver';
import { S10_Settings } from './screens/S10_Settings';

// Web Pages
import { WebLiveView } from './pages/WebLiveView';
import { PrivacyPage } from './pages/PrivacyPage';
import { MarketingPage } from './pages/MarketingPage';

// Browser-safe UUID v4 generator
const uuidv4 = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Simulated Route Points (Lucknow MG Road coordinates)
const SIMULATED_POINTS = [
  { lat: 26.8467, lng: 80.9462, place: 'Near City Hospital' },
  { lat: 26.8485, lng: 80.9478, place: 'Near Hazratganj Crossing' },
  { lat: 26.8505, lng: 80.9495, place: 'Near Vidhan Sabha Marg' },
  { lat: 26.8530, lng: 80.9510, place: 'Near General Post Office' },
];

export const App: React.FC = () => {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'APP_SIMULATOR' | 'PUBLIC_WEB_VIEW' | 'MARKETING' | 'PRIVACY'>('APP_SIMULATOR');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('S3_HOME');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Network Simulation (Online / Offline for Fallback Chain)
  const [isOnline, setIsOnline] = useState(true);
  const [localQueue, setLocalQueue] = useState<any[]>([]);

  // User Profile
  const [user, setUser] = useState<UserProfile>({
    id: 'user_priya_1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone_e164: '+919876543210',
  });

  // Trusted Contacts (Max 5)
  const [contacts, setContacts] = useState<TrustedContact[]>([
    {
      id: 'c1',
      name: 'Papa (Home)',
      phone_e164: '+919876500001',
      status: 'ACCEPTED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'c2',
      name: 'Rahul Bhaiya',
      phone_e164: '+919876500002',
      status: 'ACCEPTED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'c3',
      name: 'Anjali Didi',
      phone_e164: '+919876500003',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    },
  ]);

  // Active Share Session
  const [activeShare, setActiveShare] = useState<ShareSession | null>(null);

  // Active SOS Event
  const [activeSOS, setActiveSOS] = useState<SOSEvent | null>(null);

  // Live Location Tracker
  const [routeIndex, setRouteIndex] = useState(0);
  const currentCoord = SIMULATED_POINTS[routeIndex];

  // Police Station info (Section 9)
  const policeStation: PoliceStationInfo = {
    name: 'Hazratganj Police Station',
    address: 'Mahatma Gandhi Marg, Hazratganj',
    distance_m: 850,
    phone: '0522-2200112',
    phone_verified: false, // Default false: Call button hidden, 112 is primary!
  };

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulated GPS movement every 10 seconds while sharing or SOS
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex((prev) => (prev + 1) % SIMULATED_POINTS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // When coming back online, auto-retry any PENDING SOS in local queue (Section 7 Step 4)
  useEffect(() => {
    if (isOnline && localQueue.length > 0) {
      showToast('Signal restored! SOS synchronized with server.');
      setLocalQueue([]);
      if (activeSOS) {
        setActiveSOS({
          ...activeSOS,
          delivery_channel: 'INTERNET',
        });
      }
    }
  }, [isOnline, localQueue, activeSOS]);

  // Start Share handler
  const handleStartShare = (transport: TransportType, vehicleNumber?: string) => {
    const shareId = uuidv4();
    const token = uuidv4().slice(0, 16);
    const newShare: ShareSession = {
      id: shareId,
      transport,
      vehicle_number: vehicleNumber || null,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
      view_url: `https://ghartak.app/v/${token}`,
      view_token: token,
      lat: currentCoord.lat,
      lng: currentCoord.lng,
      place_label: currentCoord.place,
      updated_at: new Date().toISOString(),
    };
    setActiveShare(newShare);
    setCurrentScreen('S4_SHARING_ACTIVE');
    showToast(`Journey started! Notification sent to trusted contacts.`);
  };

  // Stop Share handler (Immediate location deletion per Section 6.2 & 10)
  const handleStopSharing = () => {
    if (activeShare) {
      setActiveShare({
        ...activeShare,
        status: 'ENDED',
      });
      showToast('Live sharing stopped. Location data permanently deleted from server.');
    }
    setCurrentScreen('S3_HOME');
  };

  // Trigger SOS button tapped -> Open S5 Countdown
  const handleTriggerSOS = () => {
    setCurrentScreen('S5_SOS_COUNTDOWN');
  };

  // SOS Countdown Completed (Section 7: Fallback Chain execution)
  const handleSOSComplete = () => {
    const sosId = uuidv4();
    const nowIso = new Date().toISOString();
    const transport = activeShare?.transport || 'BUS';
    const vehicle = activeShare?.vehicle_number || undefined;

    const acceptedRecipients = contacts
      .filter((c) => c.status === 'ACCEPTED')
      .map((c) => ({
        contact_id: c.id,
        name: c.name,
        phone_e164: c.phone_e164,
        notified_at: nowIso,
        ack_at: null,
      }));

    if (isOnline) {
      // Step 2: Push via Internet
      const newSOS: SOSEvent = {
        id: sosId,
        pressed_at: nowIso,
        transport,
        vehicle_number: vehicle || null,
        status: 'ACTIVE',
        delivery_channel: 'INTERNET',
        lat: currentCoord.lat,
        lng: currentCoord.lng,
        place_label: currentCoord.place,
        recipients: acceptedRecipients,
      };
      setActiveSOS(newSOS);
      setCurrentScreen('S5B_SOS_STATUS');
      showToast('SOS alert sent (Internet Push)!');
    } else {
      // Step 3 & 4: Offline Fallback Chain
      // Saved in phone queue + SMS Fallback triggered
      const queuedSOS: SOSEvent = {
        id: sosId,
        pressed_at: nowIso,
        transport,
        vehicle_number: vehicle || null,
        status: 'ACTIVE',
        delivery_channel: 'SMS_PROMPTED',
        lat: currentCoord.lat,
        lng: currentCoord.lng,
        place_label: currentCoord.place,
        recipients: acceptedRecipients,
      };
      setLocalQueue([queuedSOS]);
      setActiveSOS(queuedSOS);
      setCurrentScreen('S5B_SOS_STATUS');
      showToast('Offline detected! Automatic SMS fallback activated.');
    }
  };

  // Resolve SOS ("Main safe hoon")
  const handleResolveSOS = () => {
    if (activeSOS) {
      setActiveSOS({
        ...activeSOS,
        status: 'RESOLVED',
      });
    }
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    showToast('You are marked safe. SOS alert resolved.');
    setCurrentScreen('S3_HOME');
  };

  // WhatsApp Share button
  const handleWhatsAppShare = (transport: TransportType, vehicle?: string) => {
    const vehiclePart = vehicle ? `(${vehicle})` : '';
    const text = encodeURIComponent(
      `Priya is travelling by ${transport} ${vehiclePart}, near ${currentCoord.place}. Live location: https://ghartak.app/v/${activeShare?.view_token || 'demo'}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Add Contact
  const handleAddContact = (name: string, phone: string) => {
    const acceptedCount = contacts.filter((c) => c.status === 'ACCEPTED').length;
    if (acceptedCount >= 5) {
      alert('Maximum 5 accepted contacts allowed');
      return;
    }
    const newContact: TrustedContact = {
      id: uuidv4(),
      name,
      phone_e164: phone,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    setContacts([...contacts, newContact]);
    showToast(`Invite sent to ${name} (valid for 6 hours).`);
    setCurrentScreen('S6_TRUSTED_CONTACTS');
  };

  // Remove Contact
  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    showToast('Contact removed successfully.');
  };

  // Delete Account
  const handleDeleteAccount = () => {
    setUser({ id: '', name: '', email: '', phone_e164: null });
    setContacts([]);
    setActiveShare(null);
    setActiveSOS(null);
    setIsLoggedIn(false);
    setCurrentScreen('S1_LOGIN');
    showToast('Account and all data permanently deleted.');
  };

  // Contact acknowledgment
  const handleContactAck = (contactId: string) => {
    if (activeSOS) {
      const updated = activeSOS.recipients.map((r) =>
        r.contact_id === contactId ? { ...r, ack_at: new Date().toISOString() } : r
      );
      setActiveSOS({ ...activeSOS, recipients: updated });
      showToast('Contact viewed the emergency alert!');
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR: Developer / Tester Controls & Scenario Simulator (DEV ONLY) */}
      {import.meta.env.DEV && (
        <aside className="simulator-sidebar">
        {/* Brand */}
        <div className="brand-badge">
          <div className="brand-icon">
            <Shield size={24} />
          </div>
          <div>
            <div className="brand-title">GharTak</div>
            <div className="brand-tagline">Safety-First Android & Web Platform</div>
          </div>
        </div>

        {/* View Mode Navigation */}
        <div className="sim-card">
          <div className="sim-card-header">Platform View Mode</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              className={`sim-btn ${activeTab === 'APP_SIMULATOR' ? 'active' : ''}`}
              onClick={() => setActiveTab('APP_SIMULATOR')}
            >
              <Smartphone size={16} />
              Android Mobile App (S1-S10)
            </button>
            <button
              className={`sim-btn ${activeTab === 'PUBLIC_WEB_VIEW' ? 'active' : ''}`}
              onClick={() => setActiveTab('PUBLIC_WEB_VIEW')}
            >
              <Globe size={16} />
              Public Live View (/v/token)
            </button>
            <button
              className={`sim-btn ${activeTab === 'MARKETING' ? 'active' : ''}`}
              onClick={() => setActiveTab('MARKETING')}
            >
              <Radio size={16} />
              Marketing Website (/)
            </button>
            <button
              className={`sim-btn ${activeTab === 'PRIVACY' ? 'active' : ''}`}
              onClick={() => setActiveTab('PRIVACY')}
            >
              <Shield size={16} />
              Privacy Policy (/privacy)
            </button>
          </div>
        </div>

        {/* Network & Fallback Chain Tester (Section 7) */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span>Network Condition</span>
            <span style={{ fontSize: '11px', color: isOnline ? '#34D399' : '#F87171' }}>
              {isOnline ? 'Online (4G)' : 'Airplane Mode'}
            </span>
          </div>
          <div className="sim-btn-group">
            <button
              className={`sim-btn ${isOnline ? 'active' : ''}`}
              onClick={() => setIsOnline(true)}
            >
              <Wifi size={15} />
              Online
            </button>
            <button
              className={`sim-btn ${!isOnline ? 'danger-active' : ''}`}
              onClick={() => setIsOnline(false)}
            >
              <WifiOff size={15} />
              Offline (SMS Fallback)
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>
            Toggle offline to test the automatic SMS fallback chain.
          </div>
        </div>

        {/* Quick Screen Switcher for Testing (Section 5 Spec) */}
        {activeTab === 'APP_SIMULATOR' && (
          <div className="sim-card">
            <div className="sim-card-header">Screen Switcher (S1 - S10)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <button
                className={`sim-btn ${currentScreen === 'S1_LOGIN' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S1_LOGIN')}
              >
                S1 Login
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S2_PROFILE' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S2_PROFILE')}
              >
                S2 Profile
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S3_HOME' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S3_HOME')}
              >
                S3 Home
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S4_SHARING_ACTIVE' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S4_SHARING_ACTIVE')}
              >
                S4 Live Sharing
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S5_SOS_COUNTDOWN' ? 'danger-active' : ''}`}
                onClick={() => setCurrentScreen('S5_SOS_COUNTDOWN')}
              >
                S5 SOS Countdown
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S5B_SOS_STATUS' ? 'danger-active' : ''}`}
                onClick={() => setCurrentScreen('S5B_SOS_STATUS')}
              >
                S5b SOS Status
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S6_TRUSTED_CONTACTS' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S6_TRUSTED_CONTACTS')}
              >
                S6 Contacts
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S7_CONTACT_PICKER' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S7_CONTACT_PICKER')}
              >
                S7 Picker
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S8_FAMILY_VIEW' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S8_FAMILY_VIEW')}
              >
                S8 Family View
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S9_SOS_RECEIVER' ? 'danger-active' : ''}`}
                onClick={() => setCurrentScreen('S9_SOS_RECEIVER')}
              >
                S9 SOS Alert (112)
              </button>
              <button
                className={`sim-btn ${currentScreen === 'S10_SETTINGS' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('S10_SETTINGS')}
                style={{ gridColumn: 'span 2' }}
              >
                S10 Settings (Delete Account)
              </button>
            </div>
          </div>
        )}

        {/* GPS Live Movement Simulation */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span>Simulated GPS Position</span>
            <span style={{ fontSize: '11px', color: '#38BDF8' }}>Step {routeIndex + 1}/4</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9' }}>
            {currentCoord.place}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
            {currentCoord.lat.toFixed(4)}, {currentCoord.lng.toFixed(4)} (Updates every 10s)
          </div>
          <button
            className="sim-btn"
            onClick={() => setRouteIndex((prev) => (prev + 1) % SIMULATED_POINTS.length)}
          >
            <Play size={13} /> Move to Next Location
          </button>
        </div>
      </aside>
      )}

      {/* MAIN STAGE */}
      <main className="simulator-stage">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-notification">
            <CheckCircle size={18} color="#2DD4BF" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. PUBLIC WEB LIVE VIEW */}
        {activeTab === 'PUBLIC_WEB_VIEW' && (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <WebLiveView
              token={activeShare?.view_token || 'demo-share-token'}
              shareData={{
                userName: user.name || 'Priya Sharma',
                userPhone: user.phone_e164 || '+919876543210',
                transport: activeShare?.transport || 'BUS',
                vehicleNumber: activeShare?.vehicle_number || 'UP32 AB 1234',
                placeLabel: currentCoord.place,
                lat: currentCoord.lat,
                lng: currentCoord.lng,
                updatedAt: new Date().toISOString(),
                isEnded: activeShare?.status === 'ENDED',
                isSOSActive: activeSOS?.status === 'ACTIVE',
              }}
              onBackToApp={() => setActiveTab('APP_SIMULATOR')}
            />
          </div>
        )}

        {/* 2. MARKETING PAGE */}
        {activeTab === 'MARKETING' && (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <MarketingPage
              onLaunchApp={() => setActiveTab('APP_SIMULATOR')}
              onOpenPrivacy={() => setActiveTab('PRIVACY')}
            />
          </div>
        )}

        {/* 3. PRIVACY PAGE */}
        {activeTab === 'PRIVACY' && (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <PrivacyPage onBack={() => setActiveTab('APP_SIMULATOR')} />
          </div>
        )}

        {/* 4. ANDROID PHONE APP (S1 - S10) */}
        {activeTab === 'APP_SIMULATOR' && (
          <div className="phone-device">
            <div className="phone-screen">
              {/* Top Notch & Status Bar */}
              <div
                className={`phone-notch-bar ${
                  currentScreen === 'S5_SOS_COUNTDOWN' || currentScreen === 'S9_SOS_RECEIVER'
                    ? 'dark-header'
                    : ''
                }`}
              >
                <span>9:41</span>
                <div className="notch-pill" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isOnline ? <Wifi size={14} /> : <WifiOff size={14} color="#EF4444" />}
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Viewport Screen Router */}
              <div className="screen-viewport">
                {currentScreen === 'S1_LOGIN' && (
                  <S1_Login
                    onLogin={(name) => {
                      setIsLoggedIn(true);
                      setUser({ ...user, name: name || 'Priya Sharma' });
                      setCurrentScreen('S2_PROFILE');
                    }}
                    onOpenPrivacy={() => setActiveTab('PRIVACY')}
                  />
                )}

                {currentScreen === 'S2_PROFILE' && (
                  <S2_Profile
                    initialName={user.name}
                    initialPhone={user.phone_e164 || '+919876543210'}
                    onConfirm={(name, phone) => {
                      setUser({ ...user, name, phone_e164: phone });
                      showToast('Profile saved successfully!');
                      setCurrentScreen('S3_HOME');
                    }}
                  />
                )}

                {currentScreen === 'S3_HOME' && (
                  <S3_Home
                    userName={user.name || 'Priya'}
                    onStartShare={handleStartShare}
                    onTriggerSOS={handleTriggerSOS}
                    onWhatsAppShare={handleWhatsAppShare}
                    onManageContacts={() => setCurrentScreen('S6_TRUSTED_CONTACTS')}
                    acceptedContactsCount={contacts.filter((c) => c.status === 'ACCEPTED').length}
                  />
                )}

                {currentScreen === 'S4_SHARING_ACTIVE' && (
                  <S4_SharingActive
                    contactNames={contacts
                      .filter((c) => c.status === 'ACCEPTED')
                      .map((c) => c.name.split(' ')[0])
                      .join(', ')}
                    initialTransport={activeShare?.transport || 'BUS'}
                    initialVehicle={activeShare?.vehicle_number || ''}
                    currentPlace={currentCoord.place}
                    lat={currentCoord.lat}
                    lng={currentCoord.lng}
                    onStopSharing={handleStopSharing}
                    onTriggerSOS={handleTriggerSOS}
                    onUpdateTrip={(t, v) => {
                      if (activeShare) {
                        setActiveShare({ ...activeShare, transport: t, vehicle_number: v || null });
                        showToast('Transport mode updated.');
                      }
                    }}
                  />
                )}

                {currentScreen === 'S5_SOS_COUNTDOWN' && (
                  <S5_SOSCountdown
                    transport={activeShare?.transport || 'BUS'}
                    vehicleNumber={activeShare?.vehicle_number || undefined}
                    placeLabel={currentCoord.place}
                    lat={currentCoord.lat}
                    lng={currentCoord.lng}
                    pressedTimeStr={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    onCancel={() => {
                      showToast('SOS alert cancelled.');
                      setCurrentScreen(activeShare?.status === 'ACTIVE' ? 'S4_SHARING_ACTIVE' : 'S3_HOME');
                    }}
                    onCountdownComplete={handleSOSComplete}
                  />
                )}

                {currentScreen === 'S5B_SOS_STATUS' && activeSOS && (
                  <S5b_SOSStatus
                    sos={activeSOS}
                    onResolve={handleResolveSOS}
                    onSimulateContactAck={handleContactAck}
                  />
                )}

                {currentScreen === 'S6_TRUSTED_CONTACTS' && (
                  <S6_TrustedContacts
                    contacts={contacts}
                    onOpenPicker={() => setCurrentScreen('S7_CONTACT_PICKER')}
                    onRemoveContact={handleRemoveContact}
                    onBack={() => setCurrentScreen('S3_HOME')}
                  />
                )}

                {currentScreen === 'S7_CONTACT_PICKER' && (
                  <S7_ContactPicker
                    onAddContact={handleAddContact}
                    onCancel={() => setCurrentScreen('S6_TRUSTED_CONTACTS')}
                  />
                )}

                {currentScreen === 'S8_FAMILY_VIEW' && (
                  <S8_FamilyView
                    personName={user.name}
                    phone={user.phone_e164 || '+919876543210'}
                    transport={activeShare?.transport || 'BUS'}
                    vehicleNumber={activeShare?.vehicle_number || 'UP32 AB 1234'}
                    placeLabel={currentCoord.place}
                    lat={currentCoord.lat}
                    lng={currentCoord.lng}
                    minutesAgo={0}
                    onCall={() => alert(`Calling ${user.name}...`)}
                    onMessage={() => alert(`Messaging ${user.name}...`)}
                    onBack={() => setCurrentScreen('S3_HOME')}
                  />
                )}

                {currentScreen === 'S9_SOS_RECEIVER' && (
                  <S9_SOSAlertReceiver
                    userName={user.name}
                    userPhone={user.phone_e164 || '+919876543210'}
                    sos={
                      activeSOS || {
                        id: 'demo_sos',
                        pressed_at: new Date().toISOString(),
                        transport: 'BUS',
                        vehicle_number: 'UP32 AB 1234',
                        status: 'ACTIVE',
                        delivery_channel: 'INTERNET',
                        lat: currentCoord.lat,
                        lng: currentCoord.lng,
                        place_label: currentCoord.place,
                        recipients: [],
                      }
                    }
                    policeStation={policeStation}
                    onCall112={() => alert('Dialing Police Emergency 112...')}
                    onCallUser={() => alert(`Calling ${user.name}...`)}
                    onAckDekhLiya={() => {
                      showToast('Emergency alert acknowledged!');
                    }}
                    isAcked={false}
                    onBack={() => setCurrentScreen('S3_HOME')}
                  />
                )}

                {currentScreen === 'S10_SETTINGS' && (
                  <S10_Settings
                    user={user}
                    onOpenPrivacy={() => setActiveTab('PRIVACY')}
                    onDeleteAccount={handleDeleteAccount}
                    onLogout={() => {
                      setIsLoggedIn(false);
                      setCurrentScreen('S1_LOGIN');
                      showToast('Logged out successfully.');
                    }}
                    onBack={() => setCurrentScreen('S3_HOME')}
                  />
                )}
              </div>

              {/* Bottom In-App Android Navigation (When not in full SOS countdown) */}
              {currentScreen !== 'S5_SOS_COUNTDOWN' && (
                <div className="phone-bottom-nav">
                  <button
                    className={`nav-item ${currentScreen === 'S3_HOME' ? 'active' : ''}`}
                    onClick={() => setCurrentScreen('S3_HOME')}
                  >
                    <Smartphone size={18} />
                    <span>Home</span>
                  </button>

                  <button
                    className={`nav-item ${currentScreen === 'S4_SHARING_ACTIVE' ? 'active' : ''}`}
                    onClick={() => {
                      if (!activeShare) {
                        handleStartShare('BUS');
                      } else {
                        setCurrentScreen('S4_SHARING_ACTIVE');
                      }
                    }}
                  >
                    <Radio size={18} />
                    <span>Sharing</span>
                  </button>

                  <button
                    className={`nav-item ${currentScreen === 'S6_TRUSTED_CONTACTS' || currentScreen === 'S7_CONTACT_PICKER' ? 'active' : ''}`}
                    onClick={() => setCurrentScreen('S6_TRUSTED_CONTACTS')}
                  >
                    <Users size={18} />
                    <span>Contacts</span>
                  </button>

                  <button
                    className={`nav-item ${currentScreen === 'S10_SETTINGS' ? 'active' : ''}`}
                    onClick={() => setCurrentScreen('S10_SETTINGS')}
                  >
                    <Shield size={18} />
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
