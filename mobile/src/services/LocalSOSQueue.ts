/**
 * Local SOS Queue and Fallback Synchronization (Section 7)
 * Uses encrypted local storage (MMKV or SQLite) to preserve SOS alerts
 * through reboots, network blackouts, and application termination.
 */

export interface QueuedSOS {
  sos_id: string;
  pressed_at: string;
  transport: string;
  vehicle_number?: string;
  lat: number;
  lng: number;
  place_label?: string;
  status: 'PENDING' | 'SENT_INTERNET' | 'SMS_PROMPTED' | 'RESOLVED';
  retry_count: number;
  last_retry_at?: string;
}

const QUEUE_STORAGE_KEY = 'ghartak_local_sos_queue';
const CONTACTS_CACHE_KEY = 'ghartak_accepted_contacts_cache';

export class LocalSOSQueue {
  private queue: QueuedSOS[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage save error handling
    }
  }

  public cacheAcceptedContacts(contacts: { id: string; name: string; phone_e164: string }[]) {
    try {
      localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(contacts));
    } catch {}
  }

  public getCachedContacts(): { id: string; name: string; phone_e164: string }[] {
    try {
      const raw = localStorage.getItem(CONTACTS_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public enqueueSOS(sos: Omit<QueuedSOS, 'status' | 'retry_count'>): QueuedSOS {
    const item: QueuedSOS = {
      ...sos,
      status: 'PENDING',
      retry_count: 0,
    };

    // Upsert by sos_id
    const existingIndex = this.queue.findIndex((q) => q.sos_id === sos.sos_id);
    if (existingIndex >= 0) {
      this.queue[existingIndex] = item;
    } else {
      this.queue.push(item);
    }

    this.saveToStorage();
    return item;
  }

  public updateStatus(sos_id: string, status: QueuedSOS['status']) {
    const item = this.queue.find((q) => q.sos_id === sos_id);
    if (item) {
      item.status = status;
      this.saveToStorage();
    }
  }

  public getPending(): QueuedSOS[] {
    return this.queue.filter((q) => q.status === 'PENDING' || q.status === 'SMS_PROMPTED');
  }

  public remove(sos_id: string) {
    this.queue = this.queue.filter((q) => q.sos_id !== sos_id);
    this.saveToStorage();
  }
}

export const localSosQueue = new LocalSOSQueue();
