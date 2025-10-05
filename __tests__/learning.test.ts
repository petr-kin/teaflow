import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveBrewFeedback,
  getBrewFeedbacks,
  getTeaAnalytics,
  getRecommendedAdjustments,
  applyOffset,
  getLearning,
} from '../lib/learning';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock OfflineManager
jest.mock('../lib/offline', () => ({
  getInstance: () => ({
    executeAction: jest.fn(),
    updateCacheStatus: jest.fn(),
  }),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Learning System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('saveBrewFeedback', () => {
    it('saves feedback and updates analytics', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      await saveBrewFeedback({
        teaId: 'green',
        steepIndex: 0,
        vesselMl: 110,
        tempC: 80,
        actualSec: 60,
        strength: 'perfect',
        enjoyment: 8,
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'gongfu:feedback',
        expect.stringContaining('green')
      );
    });

    it('applies learning adjustments for non-perfect strength', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      await saveBrewFeedback({
        teaId: 'green',
        steepIndex: 0,
        vesselMl: 110,
        tempC: 80,
        actualSec: 60,
        strength: 'weak',
        enjoyment: 6,
      });

      // Should call setItem multiple times (feedback + learning + analytics)
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it('limits feedback history to 100 per tea', async () => {
      const largeFeedbackArray = Array.from({ length: 150 }, (_, i) => ({
        teaId: 'green',
        steepIndex: 0,
        vesselMl: 110,
        tempC: 80,
        actualSec: 60,
        strength: 'perfect',
        enjoyment: 8,
        timestamp: Date.now() - i * 1000,
      }));

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(largeFeedbackArray));

      await saveBrewFeedback({
        teaId: 'green',
        steepIndex: 0,
        vesselMl: 110,
        tempC: 80,
        actualSec: 60,
        strength: 'perfect',
        enjoyment: 8,
      });

      const feedbackCall = mockAsyncStorage.setItem.mock.calls.find(
        call => call[0] === 'gongfu:feedback'
      );
      const savedFeedbacks = JSON.parse(feedbackCall![1]);
      const greenFeedbacks = savedFeedbacks.filter((f: any) => f.teaId === 'green');
      
      expect(greenFeedbacks.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getTeaAnalytics', () => {
    it('returns default analytics for unknown tea', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{}');

      const analytics = await getTeaAnalytics('unknown');

      expect(analytics).toEqual({
        totalBrews: 0,
        averageEnjoyment: 0,
        preferredStrength: 'perfect',
        averageTemp: 0,
        averageVessel: 0,
        lastFeedback: 0,
        improvements: 0,
      });
    });

    it('returns stored analytics for known tea', async () => {
      const mockAnalytics = {
        green: {
          totalBrews: 5,
          averageEnjoyment: 8.2,
          preferredStrength: 'perfect',
          averageTemp: 80,
          averageVessel: 110,
          lastFeedback: Date.now(),
          improvements: 3,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockAnalytics));

      const analytics = await getTeaAnalytics('green');

      expect(analytics).toEqual(mockAnalytics.green);
    });
  });

  describe('getRecommendedAdjustments', () => {
    it('returns no adjustments for insufficient data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const recommendations = await getRecommendedAdjustments('green');

      expect(recommendations.confidence).toBe(0);
      expect(recommendations.timeAdjustment).toBe('No adjustments yet');
      expect(recommendations.tempAdjustment).toBe('No adjustments yet');
    });

    it('recommends increasing time for weak tea', async () => {
      const weakFeedbacks = Array.from({ length: 5 }, (_, i) => ({
        teaId: 'green',
        steepIndex: 0,
        vesselMl: 110,
        tempC: 80,
        actualSec: 60,
        strength: 'weak',
        enjoyment: 6,
        timestamp: Date.now() - i * 1000,
      }));

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(weakFeedbacks)) // feedbacks
        .mockResolvedValueOnce('{}'); // analytics

      const recommendations = await getRecommendedAdjustments('green');

      expect(recommendations.timeAdjustment).toContain('Increase steep time');
      expect(recommendations.tempAdjustment).toContain('raising temperature');
      expect(recommendations.confidence).toBeGreaterThan(0);
    });

    it('recommends decreasing time for strong tea', async () => {
      const strongFeedbacks = Array.from({ length: 5 }, (_, i) => ({
        teaId: 'green',
        steepIndex: 0,
        vesselMl: 110,
        tempC: 80,
        actualSec: 60,
        strength: 'strong',
        enjoyment: 6,
        timestamp: Date.now() - i * 1000,
      }));

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(strongFeedbacks)) // feedbacks
        .mockResolvedValueOnce('{}'); // analytics

      const recommendations = await getRecommendedAdjustments('green');

      expect(recommendations.timeAdjustment).toContain('Reduce steep time');
      expect(recommendations.tempAdjustment).toContain('lowering temperature');
      expect(recommendations.confidence).toBeGreaterThan(0);
    });
  });

  describe('applyOffset', () => {
    it('applies learning offset correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{}');

      await applyOffset('green', '81–120', 0, 15);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'gongfu:learning',
        expect.stringContaining('green')
      );
    });

    it('limits offset range to ±60 seconds', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{}');

      await applyOffset('green', '81–120', 0, 200);

      const learningCall = mockAsyncStorage.setItem.mock.calls.find(
        call => call[0] === 'gongfu:learning'
      );
      const learning = JSON.parse(learningCall![1]);
      
      // Should be clamped to maximum of 60
      expect(Math.abs(learning.green['81–120'][0])).toBeLessThanOrEqual(60);
    });

    it('applies exponential smoothing to existing offsets', async () => {
      const existingLearning = {
        green: {
          '81–120': { 0: 20 }
        }
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingLearning));

      await applyOffset('green', '81–120', 0, 10);

      const learningCall = mockAsyncStorage.setItem.mock.calls.find(
        call => call[0] === 'gongfu:learning'
      );
      const learning = JSON.parse(learningCall![1]);
      
      // Should apply smoothing: cur*0.7 + delta*0.3 = 20*0.7 + 10*0.3 = 14 + 3 = 17
      expect(learning.green['81–120'][0]).toBe(17);
    });
  });
});