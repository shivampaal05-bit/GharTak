import React, { useState } from 'react';
import { Search, Plus, Send, X } from 'lucide-react';

interface ContactCandidate {
  name: string;
  phone: string;
}

const SAMPLE_CONTACTS: ContactCandidate[] = [
  { name: 'Papa (Home)', phone: '+919876500001' },
  { name: 'Mummy', phone: '+919876500002' },
  { name: 'Rahul Bhai', phone: '+919876500003' },
  { name: 'Anjali Didi', phone: '+919876500004' },
  { name: 'Aakash Friend', phone: '+919876500005' },
  { name: 'Rohit Sharma', phone: '+919876500006' },
];

interface S7ContactPickerProps {
  onAddContact: (name: string, phone: string) => void;
  onCancel: () => void;
}

export const S7_ContactPicker: React.FC<S7ContactPickerProps> = ({ onAddContact, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('+91');
  const [selectedCandidate, setSelectedCandidate] = useState<ContactCandidate | null>(null);
  const [showSMSPreview, setShowSMSPreview] = useState(false);

  const filtered = SAMPLE_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleSelect = (candidate: ContactCandidate) => {
    setSelectedCandidate(candidate);
    setShowSMSPreview(true);
  };

  const handleManualSubmit = () => {
    if (!manualName.trim() || manualPhone.length < 13) return;
    setSelectedCandidate({ name: manualName.trim(), phone: manualPhone.trim() });
    setShowSMSPreview(true);
  };

  const handleConfirmInvite = () => {
    if (selectedCandidate) {
      onAddContact(selectedCandidate.name, selectedCandidate.phone);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 16px',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, color: '#14213D' }}>
            {isManualMode ? 'Type Number Manually' : 'Choose Contact'}
          </h2>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Toggle between phone picker and manual entry */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setIsManualMode(false)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: !isManualMode ? '#0F766E' : '#CBD5E1',
              background: !isManualMode ? '#CCFBF1' : '#FFFFFF',
              color: !isManualMode ? '#0F766E' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Phone Contacts
          </button>
          <button
            onClick={() => setIsManualMode(true)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isManualMode ? '#0F766E' : '#CBD5E1',
              background: isManualMode ? '#CCFBF1' : '#FFFFFF',
              color: isManualMode ? '#0F766E' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Type Number
          </button>
        </div>

        {/* Manual Input Form */}
        {isManualMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Contact Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Papa, Brother, Friend"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mobile Number (+91)</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+919876543210"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
              />
            </div>

            <button className="btn-primary" onClick={handleManualSubmit}>
              Next (Preview SMS Invite)
            </button>
          </div>
        ) : (
          /* Phone Contact List */
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F1F5F9',
                padding: '8px 12px',
                borderRadius: '10px',
                marginBottom: '14px',
              }}
            >
              <Search size={16} color="#64748B" />
              <input
                type="text"
                placeholder="Search name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  width: '100%',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto' }}>
              {filtered.map((item) => (
                <div
                  key={item.phone}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#14213D' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{item.phone}</div>
                  </div>
                  <div
                    style={{
                      background: '#0F766E',
                      color: '#FFFFFF',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SMS Invite Composer Preview Modal */}
      {showSMSPreview && selectedCandidate && (
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
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '22px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
              SMS Invite Preview
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#14213D', margin: '4px 0 12px' }}>
              To: {selectedCandidate.name} ({selectedCandidate.phone})
            </div>

            <div
              style={{
                background: '#F1F5F9',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '13px',
                color: '#1E293B',
                lineHeight: 1.5,
                marginBottom: '16px',
                borderLeft: '4px solid #0F766E',
              }}
            >
              "Priya has added you as a trusted contact on GharTak. Tap to accept: https://ghartak.app/invite/token"
            </div>

            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '16px' }}>
              This invite link expires in 6 hours. Emergency alerts and live sharing will begin once they accept.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowSMSPreview(false)}
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
                onClick={handleConfirmInvite}
                style={{
                  minHeight: '44px',
                  background: '#0F766E',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={15} />
                Send SMS Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
