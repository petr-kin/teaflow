import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TeaProfile } from '../lib/types';
import { loadLastSteeps } from '../lib/store';
import { getBrewFeedbacks, getTeaAnalytics, TeaAnalytics, BrewFeedback } from '../lib/learning';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';
import Header from './ui/Header';
import Card from './ui/Card';

interface Props {
  onClose: () => void;
  userTeas: TeaProfile[];
  defaultTeas: TeaProfile[];
}

interface BrewStats {
  totalBrews: number;
  totalTime: number;
  averageEnjoyment: number;
  favoriteTeaType: string;
  mostBrewedTea: string;
  currentStreak: number;
  perfectBrews: number;
  improvementRate: number;
}

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ onClose, userTeas, defaultTeas }: Props) {
  const theme = useTheme();
  const { spacing } = useResponsive();
  const [stats, setStats] = useState<BrewStats | null>(null);
  const [teaAnalytics, setTeaAnalytics] = useState<{ tea: TeaProfile; analytics: TeaAnalytics }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      const feedbacks = await getBrewFeedbacks();
      const lastSteeps = await loadLastSteeps();
      const allTeas = [...defaultTeas, ...userTeas];
      
      // Filter by selected period
      const now = Date.now();
      const periodMs = selectedPeriod === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                       selectedPeriod === 'month' ? 30 * 24 * 60 * 60 * 1000 : 
                       Infinity;
      
      const filteredFeedbacks = feedbacks.filter(f => 
        selectedPeriod === 'all' || (now - f.timestamp) <= periodMs
      );
      
      const filteredSteeps = lastSteeps.filter(s => 
        selectedPeriod === 'all' || (now - s.ts) <= periodMs
      );

      // Calculate general statistics
      const totalBrews = filteredSteeps.length;
      const totalTime = filteredSteeps.reduce((sum, s) => sum + s.actualSec, 0);
      const averageEnjoyment = filteredFeedbacks.length > 0 ? 
        filteredFeedbacks.reduce((sum, f) => sum + f.enjoyment, 0) / filteredFeedbacks.length : 0;
      
      // Find favorite tea type
      const typeCount: Record<string, number> = {};
      filteredSteeps.forEach(s => {
        const tea = allTeas.find(t => t.id === s.teaId);
        if (tea) {
          typeCount[tea.type] = (typeCount[tea.type] || 0) + 1;
        }
      });
      
      const favoriteTeaType = Object.entries(typeCount).reduce((a, b) => 
        typeCount[a[0]] > typeCount[b[0]] ? a : b
      )?.[0] || 'none';

      // Find most brewed tea
      const teaCount: Record<string, number> = {};
      filteredSteeps.forEach(s => {
        teaCount[s.teaId] = (teaCount[s.teaId] || 0) + 1;
      });
      
      const mostBrewedTeaId = Object.entries(teaCount).reduce((a, b) => 
        teaCount[a[0]] > teaCount[b[0]] ? a : b
      )?.[0];
      
      const mostBrewedTea = allTeas.find(t => t.id === mostBrewedTeaId)?.name || 'None';

      // Calculate current streak (consecutive days with brews)
      const uniqueDays = [...new Set(filteredSteeps.map(s => 
        new Date(s.ts).toDateString()
      ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      let currentStreak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
        let checkDate = new Date();
        for (const day of uniqueDays) {
          if (day === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      const perfectBrews = filteredFeedbacks.filter(f => f.strength === 'perfect').length;
      const improvementRate = filteredFeedbacks.length > 5 ? 
        (perfectBrews / filteredFeedbacks.length) * 100 : 0;

      setStats({
        totalBrews,
        totalTime,
        averageEnjoyment,
        favoriteTeaType,
        mostBrewedTea,
        currentStreak,
        perfectBrews,
        improvementRate
      });

      // Load individual tea analytics
      const teaAnalyticsData = [];
      for (const tea of allTeas) {
        const analytics = await getTeaAnalytics(tea.id);
        if (analytics.totalBrews > 0) {
          teaAnalyticsData.push({ tea, analytics });
        }
      }
      
      // Sort by total brews
      teaAnalyticsData.sort((a, b) => b.analytics.totalBrews - a.analytics.totalBrews);
      setTeaAnalytics(teaAnalyticsData.slice(0, 10)); // Top 10 teas

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    
    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const getEnjoymentColor = (rating: number) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 3.5) return '#FF9800';
    if (rating >= 2.5) return '#FFC107';
    return '#F44336';
  };

  const getStrengthColor = (strength: string) => {
    const colors = { weak: '#FFB74D', perfect: '#4CAF50', strong: '#F44336' };
    return colors[strength as keyof typeof colors] || '#757575';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing(20) }]}>
        {/* Header */}
        <Header title="Brewing Analytics" onBack={onClose} />

        {/* Period Selector */}
        <View style={[styles.periodSelector, { backgroundColor: theme.colors.surfaceVariant }]}>
          {(['week', 'month', 'all'] as const).map(period => (
            <Pressable
              key={period}
              style={[styles.periodButton, selectedPeriod === period && { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                setSelectedPeriod(period);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.periodText, { color: theme.colors.textSecondary }, selectedPeriod === period && { color: '#fff', fontWeight: '600' }]}>
                {period === 'all' ? 'All Time' : period === 'week' ? 'Past Week' : 'Past Month'}
              </Text>
            </Pressable>
          ))}
        </View>

        {stats && (
          <>
            {/* Overview Stats */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Overview</Text>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalBrews}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Brews</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatTime(stats.totalTime)}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Brewing Time</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <Text style={[styles.statValue, { color: getEnjoymentColor(stats.averageEnjoyment) }]}>
                    {stats.averageEnjoyment.toFixed(1)}★
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg Enjoyment</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.currentStreak}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Day Streak</Text>
                </Card>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏆 Achievements</Text>
              <View style={styles.achievementsList}>
                <Card style={styles.achievement}>
                  <Text style={styles.achievementIcon}>🍃</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: theme.colors.textSecondary }]}>Favorite Tea Type</Text>
                    <Text style={[styles.achievementValue, { color: theme.colors.text }]}>{stats.favoriteTeaType.charAt(0).toUpperCase() + stats.favoriteTeaType.slice(1)}</Text>
                  </View>
                </Card>
                
                <Card style={styles.achievement}>
                  <Text style={styles.achievementIcon}>☕</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: theme.colors.textSecondary }]}>Most Brewed Tea</Text>
                    <Text style={[styles.achievementValue, { color: theme.colors.text }]}>{stats.mostBrewedTea}</Text>
                  </View>
                </Card>
                
                <Card style={styles.achievement}>
                  <Text style={styles.achievementIcon}>✨</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: theme.colors.textSecondary }]}>Perfect Brews</Text>
                    <Text style={[styles.achievementValue, { color: theme.colors.text }]}>{stats.perfectBrews}</Text>
                  </View>
                </Card>
                
                <Card style={styles.achievement}>
                  <Text style={styles.achievementIcon}>📈</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: theme.colors.textSecondary }]}>Improvement Rate</Text>
                    <Text style={[styles.achievementValue, { color: theme.colors.text }]}>{stats.improvementRate.toFixed(1)}%</Text>
                  </View>
                </Card>
              </View>
            </View>

            {/* Top Teas */}
            {teaAnalytics.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏅 Your Top Teas</Text>
                {teaAnalytics.map(({ tea, analytics }, index) => (
                  <Card key={tea.id} style={styles.teaAnalyticsCard}>
                    <View style={styles.teaRank}>
                      <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>#{index + 1}</Text>
                    </View>
                    
                    <View style={styles.teaAnalyticsInfo}>
                      <Text style={[styles.teaAnalyticsName, { color: theme.colors.text }]}>{tea.name}</Text>
                      <Text style={[styles.teaAnalyticsType, { color: theme.colors.textSecondary }]}>{tea.type}</Text>
                      
                      <View style={styles.teaAnalyticsStats}>
                        <View style={styles.teaAnalyticsStat}>
                          <Text style={[styles.teaAnalyticsStatValue, { color: theme.colors.text }]}>{analytics.totalBrews}</Text>
                          <Text style={styles.teaAnalyticsStatLabel}>brews</Text>
                        </View>
                        
                        <View style={styles.teaAnalyticsStat}>
                          <Text style={[styles.teaAnalyticsStatValue, { color: getEnjoymentColor(analytics.averageEnjoyment) }]}>
                            {analytics.averageEnjoyment.toFixed(1)}★
                          </Text>
                          <Text style={styles.teaAnalyticsStatLabel}>rating</Text>
                        </View>
                        
                        <View style={styles.teaAnalyticsStat}>
                          <View style={[styles.strengthIndicator, { backgroundColor: getStrengthColor(analytics.preferredStrength) }]} />
                          <Text style={styles.teaAnalyticsStatLabel}>{analytics.preferredStrength}</Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}

        {(!stats || stats.totalBrews === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No brewing data yet</Text>
            <Text style={styles.emptyText}>
              Start brewing some tea to see your analytics and track your progress!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 30,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#2F7A55',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodButtonSelected: {
    backgroundColor: '#2F7A55',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    width: (width - 60) / 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementsList: {
    gap: 12,
  },
  achievement: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  achievementValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  teaAnalyticsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teaRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  teaAnalyticsInfo: {
    flex: 1,
  },
  teaAnalyticsName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  teaAnalyticsType: {
    fontSize: 12,
    marginBottom: 8,
  },
  teaAnalyticsStats: {
    flexDirection: 'row',
    gap: 16,
  },
  teaAnalyticsStat: {
    alignItems: 'center',
  },
  teaAnalyticsStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  teaAnalyticsStatLabel: {
    fontSize: 10,
  },
  strengthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
