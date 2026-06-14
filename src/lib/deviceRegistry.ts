// Local device registry — now acts as a cache for Supabase.
import { supabase } from "./supabase";

const DEVICE_ID_KEY = "afc.deviceId";
const DEVICE_NAME_KEY = "afc.deviceName";
const REGISTRY_KEY = "afc.deviceRegistry";
const BOOTSTRAP_KEY = "afc.deviceBootstrapped";

export type DeviceStatus = "approved" | "pending" | "revoked";

export interface DeviceRecord {
  id: string;
  name: string;
  status: DeviceStatus;
  firstSeen: string;
  lastSeen: string;
  userAgent?: string;
}

export interface DeviceRegistry {
  devices: DeviceRecord[];
  maxDevices: number;
}

const DEFAULT_REGISTRY: DeviceRegistry = { devices: [], maxDevices: 10 };

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  return localStorage.getItem(DEVICE_NAME_KEY) || `Device ${getDeviceId().slice(0, 6)}`;
}

export function setDeviceName(name: string): void {
  localStorage.setItem(DEVICE_NAME_KEY, name);
  supabase.from('devices').update({ name }).eq('id', getDeviceId()).then();
}

export function loadRegistry(): DeviceRegistry {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return { ...DEFAULT_REGISTRY };
    const parsed = JSON.parse(raw) as DeviceRegistry;
    if (!Array.isArray(parsed.devices)) return { ...DEFAULT_REGISTRY };
    if (typeof parsed.maxDevices !== "number") parsed.maxDevices = DEFAULT_REGISTRY.maxDevices;
    return parsed;
  } catch {
    return { ...DEFAULT_REGISTRY };
  }
}

export function saveRegistry(reg: DeviceRegistry): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
  window.dispatchEvent(new CustomEvent("device-registry-updated"));
}

export function registerCurrentDevice(): DeviceRecord {
  const id = getDeviceId();
  const reg = loadRegistry();
  const now = new Date().toISOString();
  const existing = reg.devices.find(d => d.id === id);

  const isBootstrap = !localStorage.getItem(BOOTSTRAP_KEY) && reg.devices.length === 0;

  let record: DeviceRecord;
  if (existing) {
    existing.lastSeen = now;
    record = existing;
  } else {
    record = {
      id,
      name: getDeviceName(),
      status: isBootstrap ? "approved" : "pending",
      firstSeen: now,
      lastSeen: now,
      userAgent: navigator.userAgent,
    };
    reg.devices.push(record);
    if (isBootstrap) localStorage.setItem(BOOTSTRAP_KEY, "1");
  }

  saveRegistry(reg);

  supabase.from('devices').upsert({
    id: record.id,
    name: record.name,
    is_active: record.status === "approved",
    last_seen: record.lastSeen,
    registered_at: record.firstSeen
  }).then();

  return record;
}

export function getDeviceStatus(id: string): DeviceStatus {
  const reg = loadRegistry();
  return reg.devices.find(d => d.id === id)?.status ?? "pending";
}

export function approveDevice(id: string): void {
  const reg = loadRegistry();
  const d = reg.devices.find(x => x.id === id);
  if (d) { 
    d.status = "approved"; 
    saveRegistry(reg); 
    supabase.from('devices').update({ is_active: true }).eq('id', id).then();
  }
}

export function revokeDevice(id: string): void {
  const reg = loadRegistry();
  const d = reg.devices.find(x => x.id === id);
  if (d) { 
    d.status = "revoked"; 
    saveRegistry(reg); 
    supabase.from('devices').update({ is_active: false }).eq('id', id).then();
  }
}

export function removeDevice(id: string): void {
  const reg = loadRegistry();
  reg.devices = reg.devices.filter(x => x.id !== id);
  saveRegistry(reg);
  supabase.from('devices').delete().eq('id', id).then();
}

export function renameDevice(id: string, name: string): void {
  const reg = loadRegistry();
  const d = reg.devices.find(x => x.id === id);
  if (d) { 
    d.name = name; 
    saveRegistry(reg); 
    supabase.from('devices').update({ name }).eq('id', id).then();
  }
}

export function setMaxDevices(n: number): void {
  const reg = loadRegistry();
  reg.maxDevices = Math.max(1, Math.floor(n));
  saveRegistry(reg);
  supabase.from('app_state').update({ max_devices: reg.maxDevices }).eq('id', 1).then();
}

export async function syncRegistryWithNetwork(): Promise<void> {
  const { data, error } = await supabase.from('devices').select('*');
  if (data && !error) {
    const reg = loadRegistry();
    const serverDeviceIds = new Set(data.map(d => d.id));
    
    // Convert server array into DeviceRecord objects
    reg.devices = data.map(d => {
      // Find what local thinks it is, if it exists
      const localD = reg.devices.find(x => x.id === d.id);
      return {
        id: d.id,
        name: d.name,
        // Since remote has no revoked state (just true/false), 
        // we say if it's inactive locally as revoked, keep it, otherwise pending
        status: d.is_active ? 'approved' : (localD?.status === 'revoked' ? 'revoked' : 'pending'),
        firstSeen: d.registered_at,
        lastSeen: d.last_seen || d.registered_at,
        userAgent: localD?.userAgent || '',
      };
    });

    const maxDevRes = await supabase.from('app_state').select('max_devices').eq('id', 1).single();
    if (maxDevRes.data?.max_devices) {
       reg.maxDevices = maxDevRes.data.max_devices;
    }

    localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
    window.dispatchEvent(new CustomEvent("device-registry-updated"));
  }
}
