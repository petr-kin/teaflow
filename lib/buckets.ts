import type { VesselBucket } from './types';
export function bucket(vesselMl:number): VesselBucket { if (vesselMl <= 80) return '≤80'; if (vesselMl <= 120) return '81–120'; return '≥121'; }
export const VESSEL_STEPS = [70, 90, 110, 130, 150, 180, 200];
export function snapVessel(v:number){ let best=VESSEL_STEPS[0]; let d=1e9; for(const s of VESSEL_STEPS){ const dd=Math.abs(s-v); if(dd<d){ d=dd; best=s; } } return best; }
