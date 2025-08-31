import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VesselBucket } from './types';
import OfflineManager from './offline';

type Offsets = { [i:number]: number };
type Learning = { [teaId:string]: { [bucket in VesselBucket]?: Offsets } };

interface BrewFeedback {
  teaId: string;
  steepIndex: number;
  vesselMl: number;
  tempC: number;
  actualSec: number;
  strength: 'weak' | 'perfect' | 'strong';
  enjoyment: number;
  timestamp: number;
}

interface TeaAnalytics {
  totalBrews: number;
  averageEnjoyment: number;
  preferredStrength: 'weak' | 'perfect' | 'strong';
  averageTemp: number;
  averageVessel: number;
  lastFeedback: number;
  improvements: number;
}

const LEARNING_KEY = 'gongfu:learning';
const FEEDBACK_KEY = 'gongfu:feedback';
const ANALYTICS_KEY = 'gongfu:analytics';
export async function getLearning(): Promise<Learning> { const raw = await AsyncStorage.getItem(LEARNING_KEY); return raw ? JSON.parse(raw) : {}; }
export async function applyOffset(teaId:string, bucket:VesselBucket, i:number, deltaSec:number){
  const l = await getLearning(); const t = l[teaId] || (l[teaId]={} as any); const b = t[bucket] || (t[bucket]={});
  const cur = b[i] || 0; b[i] = Math.max(-60, Math.min(60, Math.round(cur*0.7 + deltaSec*0.3)));
  await AsyncStorage.setItem(LEARNING_KEY, JSON.stringify(l));
}

export async function saveBrewFeedback(feedback: Omit<BrewFeedback, 'timestamp'>) {
  const feedbacks = await getBrewFeedbacks();
  const newFeedback: BrewFeedback = { ...feedback, timestamp: Date.now() };
  feedbacks.push(newFeedback);
  
  // Keep only last 100 feedbacks per tea to manage storage
  const teaFeedbacks = feedbacks.filter(f => f.teaId === feedback.teaId);
  if (teaFeedbacks.length > 100) {
    const otherFeedbacks = feedbacks.filter(f => f.teaId !== feedback.teaId);
    const recentTeaFeedbacks = teaFeedbacks.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    const updatedFeedbacks = [...otherFeedbacks, ...recentTeaFeedbacks];
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(updatedFeedbacks));
  } else {
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  }
  
  // Update analytics
  await updateTeaAnalytics(feedback.teaId);
  
  // Apply learning adjustments based on strength feedback
  if (feedback.strength !== 'perfect') {
    const bucket = getBucketForVessel(feedback.vesselMl);
    const adjustment = getStrengthAdjustment(feedback.strength, feedback.actualSec);
    await applyOffset(feedback.teaId, bucket, feedback.steepIndex, adjustment);
  }
  
  // Queue for offline sync
  await OfflineManager.getInstance().executeAction('feedback_save', newFeedback);
  
  // Update cache status
  await OfflineManager.getInstance().updateCacheStatus('analytics', true);
}

export async function getBrewFeedbacks(): Promise<BrewFeedback[]> {
  const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getTeaAnalytics(teaId: string): Promise<TeaAnalytics> {
  const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
  const analytics = raw ? JSON.parse(raw) : {};
  return analytics[teaId] || {
    totalBrews: 0,
    averageEnjoyment: 0,
    preferredStrength: 'perfect' as const,
    averageTemp: 0,
    averageVessel: 0,
    lastFeedback: 0,
    improvements: 0
  };
}

async function updateTeaAnalytics(teaId: string) {
  const feedbacks = await getBrewFeedbacks();
  const teaFeedbacks = feedbacks.filter(f => f.teaId === teaId);
  
  if (teaFeedbacks.length === 0) return;
  
  const analytics: TeaAnalytics = {
    totalBrews: teaFeedbacks.length,
    averageEnjoyment: teaFeedbacks.reduce((sum, f) => sum + f.enjoyment, 0) / teaFeedbacks.length,
    preferredStrength: getMostFrequentStrength(teaFeedbacks),
    averageTemp: teaFeedbacks.reduce((sum, f) => sum + f.tempC, 0) / teaFeedbacks.length,
    averageVessel: teaFeedbacks.reduce((sum, f) => sum + f.vesselMl, 0) / teaFeedbacks.length,
    lastFeedback: Math.max(...teaFeedbacks.map(f => f.timestamp)),
    improvements: teaFeedbacks.filter(f => f.strength === 'perfect').length
  };
  
  const allAnalytics = await AsyncStorage.getItem(ANALYTICS_KEY);
  const parsed = allAnalytics ? JSON.parse(allAnalytics) : {};
  parsed[teaId] = analytics;
  await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(parsed));
}

function getBucketForVessel(vesselMl: number): VesselBucket {
  if (vesselMl <= 80) return '≤80';
  if (vesselMl <= 120) return '81–120';
  return '≥121';
}

function getStrengthAdjustment(strength: 'weak' | 'strong', currentTime: number): number {
  const baseAdjustment = Math.max(5, currentTime * 0.1);
  return strength === 'weak' ? baseAdjustment : -baseAdjustment;
}

function getMostFrequentStrength(feedbacks: BrewFeedback[]): 'weak' | 'perfect' | 'strong' {
  const counts = { weak: 0, perfect: 0, strong: 0 };
  feedbacks.forEach(f => counts[f.strength]++);
  
  const maxCount = Math.max(counts.weak, counts.perfect, counts.strong);
  if (counts.perfect === maxCount) return 'perfect';
  if (counts.weak === maxCount) return 'weak';
  return 'strong';
}

export async function getRecommendedAdjustments(teaId: string): Promise<{
  timeAdjustment: string;
  tempAdjustment: string;
  confidence: number;
}> {
  const analytics = await getTeaAnalytics(teaId);
  const feedbacks = await getBrewFeedbacks();
  const recentFeedbacks = feedbacks
    .filter(f => f.teaId === teaId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
  
  if (recentFeedbacks.length < 2) {
    return {
      timeAdjustment: 'No adjustments yet',
      tempAdjustment: 'No adjustments yet', 
      confidence: 0
    };
  }
  
  const weakCount = recentFeedbacks.filter(f => f.strength === 'weak').length;
  const strongCount = recentFeedbacks.filter(f => f.strength === 'strong').length;
  const perfectCount = recentFeedbacks.filter(f => f.strength === 'perfect').length;
  
  let timeAdjustment = 'Maintain current timing';
  let tempAdjustment = 'Maintain current temperature';
  
  if (weakCount > strongCount && weakCount > 1) {
    timeAdjustment = `Increase steep time by ${Math.round(analytics.averageTemp * 0.1)}s`;
    tempAdjustment = 'Consider raising temperature by 3-5°C';
  } else if (strongCount > weakCount && strongCount > 1) {
    timeAdjustment = `Reduce steep time by ${Math.round(analytics.averageTemp * 0.08)}s`;
    tempAdjustment = 'Consider lowering temperature by 3-5°C';
  }
  
  const confidence = Math.min(100, Math.round((recentFeedbacks.length / 10) * 100));
  
  return { timeAdjustment, tempAdjustment, confidence };
}
export async function offsetsFor(teaId:string, b:VesselBucket, n:number){ const l=await getLearning(); const offs=l[teaId]?.[b]||{}; return Array.from({length:n},(_,i)=>offs[i]||0); }

export type { BrewFeedback, TeaAnalytics };
