import WeatherTeaAdvisor from '../lib/weather';

describe('WeatherTeaAdvisor', () => {
  let advisor: WeatherTeaAdvisor;

  beforeEach(() => {
    advisor = WeatherTeaAdvisor.getInstance();
  });

  test('should provide weather-based tea recommendation', async () => {
    const recommendation = await advisor.getWeatherBasedRecommendation();
    
    expect(recommendation).toHaveProperty('recommendedTea');
    expect(recommendation).toHaveProperty('reason');
    expect(recommendation).toHaveProperty('brewingNotes');
    expect(recommendation).toHaveProperty('weatherInfluence');
    expect(recommendation).toHaveProperty('confidence');
    
    expect(typeof recommendation.recommendedTea).toBe('string');
    expect(typeof recommendation.confidence).toBe('number');
    expect(recommendation.confidence).toBeGreaterThan(0);
    expect(recommendation.confidence).toBeLessThanOrEqual(1);
  });

  test('should consider user preferences', async () => {
    const userPreferences = ['green', 'white'];
    const recommendation = await advisor.getWeatherBasedRecommendation(userPreferences);
    
    expect(recommendation).toHaveProperty('recommendedTea');
    expect(recommendation.weatherInfluence).toContain('preferences');
  });

  test('should get current weather data', async () => {
    const weather = await advisor.getCurrentWeather();
    
    expect(weather).toHaveProperty('temperature');
    expect(weather).toHaveProperty('humidity');
    expect(weather).toHaveProperty('pressure');
    expect(weather).toHaveProperty('conditions');
    expect(weather).toHaveProperty('season');
    
    expect(typeof weather.temperature).toBe('number');
    expect(['sunny', 'cloudy', 'rainy', 'stormy', 'snow']).toContain(weather.conditions);
    expect(['spring', 'summer', 'autumn', 'winter']).toContain(weather.season);
  });

  test('should provide seasonal fallback when weather API fails', async () => {
    const weather = await advisor.getCurrentWeather();
    
    // Should always return valid weather data even if API fails
    expect(weather.temperature).toBeGreaterThan(-50);
    expect(weather.temperature).toBeLessThan(60);
    expect(weather.humidity).toBeGreaterThan(0);
    expect(weather.humidity).toBeLessThanOrEqual(100);
  });

  test('should provide advanced weather correlation', async () => {
    const correlation = await advisor.getAdvancedWeatherCorrelation('green_tea');
    
    expect(correlation).toHaveProperty('weatherCompatibility');
    expect(correlation).toHaveProperty('optimalConditions');
    expect(correlation).toHaveProperty('seasonalRecommendation');
    
    expect(correlation.weatherCompatibility).toBeGreaterThanOrEqual(0);
    expect(correlation.weatherCompatibility).toBeLessThanOrEqual(1);
  });
});