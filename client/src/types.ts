export type TransportType = 'BUS' | 'CAR' | 'TRAIN' | 'AUTO' | 'PAIDAL' | 'OTHER' | string;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_e164: string | null;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone_e164: string;
  status: 'PENDING' | 'ACCEPTED' | 'REMOVED';
  created_at: string;
}

export interface ShareSession {
  id: string;
  transport: TransportType;
  vehicle_number: string | null;
  status: 'ACTIVE' | 'ENDED';
  started_at: string;
  view_url: string;
  view_token: string;
  lat: number;
  lng: number;
  place_label: string;
  updated_at: string;
}

export interface SOSEvent {
  id: string;
  pressed_at: string;
  transport: TransportType;
  vehicle_number: string | null;
  status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  delivery_channel: 'INTERNET' | 'SMS_PROMPTED' | 'PHONE_SAVED';
  lat: number;
  lng: number;
  place_label: string;
  recipients: {
    contact_id: string;
    name: string;
    phone_e164: string;
    notified_at: string;
    ack_at: string | null;
  }[];
}

export interface PoliceStationInfo {
  name: string;
  address: string;
  distance_m: number;
  phone: string;
  phone_verified: boolean;
}

export type ScreenId =
  | 'S1_LOGIN'
  | 'S2_PROFILE'
  | 'S3_HOME'
  | 'S4_SHARING_ACTIVE'
  | 'S5_SOS_COUNTDOWN'
  | 'S5B_SOS_STATUS'
  | 'S6_TRUSTED_CONTACTS'
  | 'S7_CONTACT_PICKER'
  | 'S8_FAMILY_VIEW'
  | 'S9_SOS_RECEIVER'
  | 'S10_SETTINGS';
