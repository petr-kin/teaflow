import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineManager from './offline';
const KEY = 'gongfu:prefs';
export type TeaPrefs = { vesselMl?: number; tempC?: number };
export type PrefMap = { [teaId: string]: TeaPrefs };
export async function getPrefs(): Promise<PrefMap> { const raw = await AsyncStorage.getItem(KEY); return raw?JSON.parse(raw):{}; }
export async function getTeaPrefs(teaId:string): Promise<TeaPrefs> { const all = await getPrefs(); return all[teaId] || {}; }
export async function setTeaPrefs(teaId:string, prefs: TeaPrefs) { 
  const all = await getPrefs(); 
  all[teaId] = { ...(all[teaId]||{}), ...prefs }; 
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
  
  // Queue for offline sync
  await OfflineManager.getInstance().executeAction('preferences_save', { teaId, prefs });
  
  // Update cache status
  await OfflineManager.getInstance().updateCacheStatus('preferences', true);
}
