import { TeaProfile } from './types';
export const DEFAULTS: Record<string, TeaProfile> = {
  oolong: { id:'oolong', name:'Oolong', type:'oolong', baseTempC:92, defaultRatio:1/15, baseScheduleSec:[7,9,12,15,20,25,35,45,60,90,120] },
  puerh:  { id:'puerh',  name:'Pu-erh', type:'puerh', baseTempC:98, defaultRatio:1/15, baseScheduleSec:[5,7,9,12,15,20,25,35,45,60,90,120] },
  green:  { id:'green',  name:'Green',  type:'green', baseTempC:78, defaultRatio:1/20, baseScheduleSec:[5,7,10,15,20,25] },
  white:  { id:'white',  name:'White',  type:'white', baseTempC:82, defaultRatio:1/18, baseScheduleSec:[8,10,15,20,25,35] },
  black:  { id:'black',  name:'Black',  type:'black', baseTempC:95, defaultRatio:1/16, baseScheduleSec:[8,10,15,20,25,35] },
  herbal: { id:'herbal', name:'Herbal', type:'herbal', baseTempC:100, defaultRatio:1/12, baseScheduleSec:[300] },
};
