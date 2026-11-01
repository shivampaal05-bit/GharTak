/**
 * SMS Fallback Dispatcher (Section 4, 7)
 * Opens SMS composer with coordinates and Google Maps link when internet is unavailable.
 */

export interface SOSMessageParams {
  senderName: string;
  transport: string;
  vehicleNumber?: string;
  placeLabel?: string;
  pressedAt: string;
  lat: number;
  lng: number;
  liveLink?: string;
}

export function buildSOSText(params: SOSMessageParams): string {
  const time = new Date(params.pressedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const vehicle = params.vehicleNumber ? `(${params.vehicleNumber})` : '';
  const place = params.placeLabel ? `${params.placeLabel}.` : '';
  const link = params.liveLink || `https://maps.google.com/?q=${params.lat},${params.lng}`;

  // Simple English SOS message format
  const parts = [
    `SOS Alert! ${params.senderName} needs emergency help.`,
    `Travelling by ${params.transport} ${vehicle}`.trim() + (place ? `, near ${place}` : ''),
    `SOS triggered at ${time}.`,
    `Live location: ${link}`,
  ];

  return parts.filter(Boolean).join(' ');
}

export function triggerSMSFallback(contacts: { name: string; phone_e164: string }[], params: SOSMessageParams) {
  const text = buildSOSText(params);
  const phoneList = contacts.map((c) => c.phone_e164).join(';');

  // Intent: ACTION_SENDTO sms:{numbers}?body={text}
  const encodedBody = encodeURIComponent(text);
  const smsUri = `sms:${phoneList}?body=${encodedBody}`;

  if (typeof window !== 'undefined') {
    window.location.href = smsUri;
  }

  return {
    dispatched: true,
    channel: 'SMS_PROMPTED',
    sms_text: text,
  };
}
