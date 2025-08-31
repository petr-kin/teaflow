import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LastSteep, TeaProfile } from './types';
import OfflineManager from './offline';
const LAST_KEY = 'gongfu:lastSteeps'; const USER_TEAS_KEY = 'gongfu:userTeas';
export async function pushLastSteep(item: LastSteep){ 
  const raw=await AsyncStorage.getItem(LAST_KEY); 
  const list:LastSteep[]=raw?JSON.parse(raw):[]; 
  list.unshift(item);
  const out:LastSteep[]=[]; 
  const seen=new Set<string>(); 
  for(const it of list){ 
    const k=`${it.teaId}-${it.infusionIndex}`; 
    if(seen.has(k)) continue; 
    seen.add(k); 
    out.push(it); 
    if(out.length>=2) break; 
  }
  await AsyncStorage.setItem(LAST_KEY, JSON.stringify(out));
  
  // Queue for offline sync
  await OfflineManager.getInstance().executeAction('steep_log', item);
}
export async function loadLastSteeps(): Promise<LastSteep[]>{ const raw=await AsyncStorage.getItem(LAST_KEY); return raw?JSON.parse(raw):[]; }
export async function loadUserTeas(): Promise<TeaProfile[]>{ const raw=await AsyncStorage.getItem(USER_TEAS_KEY); return raw?JSON.parse(raw):[]; }
export async function saveUserTea(tea:TeaProfile){ 
  const all=await loadUserTeas(); 
  const i=all.findIndex(t=>t.id===tea.id); 
  if(i>=0) all[i]=tea; 
  else all.push(tea); 
  await AsyncStorage.setItem(USER_TEAS_KEY, JSON.stringify(all));
  
  // Queue for offline sync
  await OfflineManager.getInstance().executeAction('tea_save', tea);
  
  // Update cache status
  await OfflineManager.getInstance().updateCacheStatus('teas', true);
}
export async function deleteUserTea(teaId: string) { 
  const all = await loadUserTeas(); 
  const filtered = all.filter(t => t.id !== teaId); 
  await AsyncStorage.setItem(USER_TEAS_KEY, JSON.stringify(filtered));
  
  // Queue for offline sync
  await OfflineManager.getInstance().executeAction('tea_save', { action: 'delete', teaId });
}
