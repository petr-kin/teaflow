import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TeaProfile } from '../lib/types';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';
import Header from './ui/Header';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Tag from './ui/Tag';
import TeaLeafIcon from './graphics/TeaLeafIcon';
import WeatherTeaAdvisor from '../lib/weather';

interface Props {
  teas: TeaProfile[];
  userTeas: TeaProfile[];
  onClose: () => void;
  onSelectTea: (tea: TeaProfile) => void;
  onDeleteUserTea: (teaId: string) => void;
  onEditTea: (tea: TeaProfile) => void;
  onOpenExportImport: () => void;
  onOpenAnalytics: () => void;
}

type SortOption = 'name' | 'type' | 'temperature' | 'steeps';
type FilterType = 'all' | 'green' | 'black' | 'oolong' | 'white' | 'puerh' | 'herbal' | 'user';

interface WeatherRecommendation {
  recommendedTea: string;
  reason: string;
  brewingNotes: string;
  weatherInfluence: string;
  confidence: number;
}

export default function TeaLibraryScreen({ teas, userTeas, onClose, onSelectTea, onDeleteUserTea, onEditTea, onOpenExportImport, onOpenAnalytics }: Props) {
  const theme = useTheme();
  const { spacing, fontSize } = useResponsive();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [weatherRecommendation, setWeatherRecommendation] = useState<WeatherRecommendation | null>(null);
  const [showWeatherCard, setShowWeatherCard] = useState(false);

  const allTeas = useMemo(() => [...teas, ...userTeas], [teas, userTeas]);

  // Load weather recommendation on mount
  useEffect(() => {
    const loadWeatherRecommendation = async () => {
      try {
        const advisor = WeatherTeaAdvisor.getInstance();
        const userPreferences = userTeas.map(tea => tea.type);
        const recommendation = await advisor.getWeatherBasedRecommendation(userPreferences);
        setWeatherRecommendation(recommendation);
      } catch (error) {
        console.log('Failed to load weather recommendation:', error);
      }
    };
    
    loadWeatherRecommendation();
  }, [userTeas]);

  const filteredAndSortedTeas = useMemo(() => {
    let filtered = allTeas;

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter(tea => 
        tea.name.toLowerCase().includes(searchText.toLowerCase()) ||
        tea.type.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply type filter
    if (filterBy !== 'all') {
      if (filterBy === 'user') {
        filtered = filtered.filter(tea => tea.user);
      } else {
        filtered = filtered.filter(tea => tea.type === filterBy);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'temperature':
          return a.baseTempC - b.baseTempC;
        case 'steeps':
          return a.baseScheduleSec.length - b.baseScheduleSec.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTeas, searchText, filterBy, sortBy]);

  const handleTeaPress = (tea: TeaProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectTea(tea);
    onClose();
  };

  const handleDeleteTea = (tea: TeaProfile) => {
    if (tea.user) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onDeleteUserTea(tea.id);
    }
  };

  const handleEditTea = (tea: TeaProfile) => {
    if (tea.user) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onEditTea(tea);
    }
  };

  const getTeaTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      green: '#4CAF50',
      black: '#795548', 
      oolong: '#FF9800',
      white: '#E0E0E0',
      puerh: '#8D6E63',
      herbal: '#9C27B0'
    };
    return colors[type] || theme.colors.primary;
  };

  const handleWeatherTeaSelect = () => {
    if (weatherRecommendation) {
      const recommendedTea = allTeas.find(tea => tea.type === weatherRecommendation.recommendedTea);
      if (recommendedTea) {
        handleTeaPress(recommendedTea);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Header
        title="Tea Library"
        onBack={onClose}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconButton name="stats-chart-outline" onPress={onOpenAnalytics} />
            <IconButton name="settings-outline" onPress={onOpenExportImport} />
            <Button variant="text" size="sm" title="Sort" onPress={() => setShowSortMenu(!showSortMenu)} />
          </View>
        }
      />

      {/* Weather Recommendation Card */}
      {weatherRecommendation && (
        <View style={[styles.weatherCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.weatherHeader}>
            <View style={styles.weatherIcon}>
              <Text style={styles.weatherIconText}>🌤️</Text>
            </View>
            <View style={styles.weatherInfo}>
              <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>Weather-Based Suggestion</Text>
              <Text style={[styles.weatherSubtitle, { color: theme.colors.textSecondary }]}>{weatherRecommendation.reason}</Text>
            </View>
            <Button 
              variant={showWeatherCard ? "ghost" : "primary"} 
              size="sm" 
              title={showWeatherCard ? "Hide" : "View"} 
              onPress={() => setShowWeatherCard(!showWeatherCard)}
            />
          </View>
          
          {showWeatherCard && (
            <View style={styles.weatherDetails}>
              <View style={styles.recommendationRow}>
                <View style={[styles.teaTypeIndicator, { backgroundColor: getTeaTypeColor(weatherRecommendation.recommendedTea) }]} />
                <View style={styles.recommendationInfo}>
                  <Text style={[styles.recommendedTeaType, { color: theme.colors.text }]}>
                    {weatherRecommendation.recommendedTea.charAt(0).toUpperCase() + weatherRecommendation.recommendedTea.slice(1)} Tea
                  </Text>
                  <Text style={[styles.weatherInfluence, { color: theme.colors.textSecondary }]}>{weatherRecommendation.weatherInfluence}</Text>
                  <Text style={[styles.brewingNotes, { color: theme.colors.textTertiary }]}>{weatherRecommendation.brewingNotes}</Text>
                </View>
                <View style={styles.confidenceBadge}>
                  <Text style={[styles.confidenceText, { color: theme.colors.textSecondary }]}>
                    {Math.round(weatherRecommendation.confidence * 100)}% match
                  </Text>
                </View>
              </View>
              <Button 
                variant="primary" 
                title="Select This Tea" 
                onPress={handleWeatherTeaSelect}
                style={{ marginTop: 12 }}
              />
            </View>
          )}
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchContainer, { paddingHorizontal: spacing(20) }]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }
          ]}
          placeholder="Search teas..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }] }>
          {(['name', 'type', 'temperature', 'steeps'] as SortOption[]).map(option => (
            <Pressable 
              key={option}
              style={[
                styles.sortOption,
                { borderColor: theme.colors.border },
                sortBy === option && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => {
                setSortBy(option);
                setShowSortMenu(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  { color: theme.colors.textSecondary },
                  sortBy === option && { color: theme.colors.surface, fontWeight: '600' }
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterContainer, { paddingHorizontal: spacing(20) }]}>
        {(['all', 'green', 'black', 'oolong', 'white', 'puerh', 'herbal', 'user'] as FilterType[]).map(filter => (
          <Pressable 
            key={filter}
            style={[
              styles.filterTab,
              { backgroundColor: theme.colors.surfaceVariant },
              filterBy === filter && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => {
              setFilterBy(filter);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: theme.colors.textSecondary },
                filterBy === filter && { color: theme.colors.surface, fontWeight: '600' }
              ]}
            >
              {filter === 'all' ? 'All' : filter === 'user' ? 'My Teas' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tea List */}
      <ScrollView style={styles.teaList} contentContainerStyle={[styles.teaListContent, { paddingHorizontal: spacing(20) }]}>
        <Text style={[styles.resultsCount, { color: theme.colors.textSecondary }]}>
          {filteredAndSortedTeas.length} tea{filteredAndSortedTeas.length !== 1 ? 's' : ''} found
        </Text>
        
        {filteredAndSortedTeas.map(tea => (
          <Pressable 
            key={tea.id}
            style={[
              styles.teaItem,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }
            ]}
            onPress={() => handleTeaPress(tea)}
            onLongPress={() => tea.user ? handleEditTea(tea) : null}
          >
            <View style={styles.teaItemLeft}>
              <View style={[styles.teaTypeIndicator, { backgroundColor: getTeaTypeColor(tea.type) }]} />
              <View style={styles.teaInfo}>
                <View style={styles.teaNameRow}>
                  <Text style={[styles.teaName, { color: theme.colors.text }]}>{tea.name}</Text>
                  {tea.user && <Tag label="Custom" />}
                </View>
                <Text style={[styles.teaType, { color: theme.colors.textSecondary }]}>{tea.type.charAt(0).toUpperCase() + tea.type.slice(1)}</Text>
                <Text style={[styles.teaDetails, { color: theme.colors.textTertiary }]}>
                  {tea.baseTempC}°C • {tea.baseScheduleSec.length} steeps
                </Text>
              </View>
            </View>
            
            <View style={styles.teaItemRight}>
              <TeaLeafIcon size={18} color={getTeaTypeColor(tea.type)} />
              <Text style={[styles.steepTimes, { color: theme.colors.textSecondary }]}>
                {tea.baseScheduleSec.slice(0, 3).map(s => `${s}s`).join(', ')}
                {tea.baseScheduleSec.length > 3 && '...'}
              </Text>
              {tea.user && (
                <View style={styles.userActions}>
                  <Button variant="ghost" size="sm" title="Edit" onPress={() => handleEditTea(tea)} />
                  <IconButton name="trash-outline" onPress={() => handleDeleteTea(tea)} />
                </View>
              )}
            </View>
          </Pressable>
        ))}

        {filteredAndSortedTeas.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No teas found</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>Try adjusting your search or filters</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  actionText: {
    fontSize: 16,
  },
  sortButton: {
    padding: 8,
  },
  sortText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  sortMenu: {
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
  },
  sortOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  teaList: {
    flex: 1,
  },
  teaListContent: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  teaItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teaItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teaTypeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  teaInfo: {
    flex: 1,
  },
  teaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  teaName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  userBadge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  teaType: {
    fontSize: 14,
    marginBottom: 2,
  },
  teaDetails: {
    fontSize: 12,
  },
  teaItemRight: {
    alignItems: 'flex-end',
  },
  steepTimes: {
    fontSize: 12,
    marginBottom: 4,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  weatherCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  weatherIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(47, 122, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  weatherIconText: {
    fontSize: 20,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  weatherSubtitle: {
    fontSize: 14,
  },
  weatherDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recommendedTeaType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherInfluence: {
    fontSize: 14,
    marginBottom: 2,
  },
  brewingNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(47, 122, 85, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
