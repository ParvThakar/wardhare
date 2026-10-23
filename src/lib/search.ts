import devices from '../data/devices.json';
export type Device = typeof devices[number];
const clean = (v:string) => v.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchDevices(query:string): Device[] {
  const q = clean(query); if (!q) return [];
  const words = q.split(/\s+/); const compact = q.replace(/\s/g,'');
  return devices.filter((device) => { const hay = clean([device.brand, device.model, device.type, ...device.aliases].join(' ')); return words.every(w => hay.includes(w)) || hay.replace(/\s/g,'').includes(compact); });
}
