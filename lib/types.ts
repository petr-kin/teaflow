export type TeaType = 'oolong'|'puerh'|'green'|'white'|'black'|'herbal'|'custom';
export interface TeaProfile { id:string; name:string; type:TeaType; baseTempC:number; defaultRatio:number; baseScheduleSec:number[]; cover?:string; user?:boolean; }
export interface LastSteep { teaId:string; name:string; infusionIndex:number; actualSec:number; ts:number; }
export type VesselBucket = '≤80'|'81–120'|'≥121';
