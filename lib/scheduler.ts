import type { TeaProfile } from './types';
import { offsetsFor } from './learning';
import { bucket } from './buckets';
const clamp = (min:number,v:number,max:number)=>Math.max(min,Math.min(max,v));
export async function computeSchedule(tea: TeaProfile, vesselMl:number, leafGrams:number, tempC:number){
  const ratio = (leafGrams / vesselMl) / (tea.defaultRatio || (1/15));
  const ratioMult = clamp(0.6, Math.pow(ratio, 0.8), 1.6);
  const d = (tea.baseTempC ?? tempC) - tempC;
  const tempMult = d > 0 ? clamp(1.0, 1 + 0.12*(d/5), 1.5) : clamp(0.7, 1 - 0.08*(Math.abs(d)/5), 1.0);
  const base = tea.baseScheduleSec || [7,9,12,15,20,25,35,45,60,90,120];
  const prelim = base.map((t,i)=> Math.max(1, Math.round(t*ratioMult*tempMult*(i>=6?1.06:1.0))));
  const offs = await offsetsFor(tea.id, bucket(vesselMl), prelim.length);
  return prelim.map((t,i)=> Math.max(1, t + offs[i]));
}
