// Epic 2.1 Foundation: Weather-Integrated Tea Suggestions
// This is a foundation implementation for future Epic 2.1 development

interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  pressure: number; // hPa
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

interface WeatherTeaMapping {
  conditions: {
    temperature: { min: number; max: number; teaTypes: string[]; };
    humidity: { min: number; max: number; brewingAdjustments: string[]; };
    pressure: { min: number; max: number; moodMapping: string; };
  };
  seasonal: {
    [key: string]: { 
      recommendedTeas: string[]; 
      brewingStyle: string;
      notes: string;
    };
  };
}

// Foundation weather-to-tea mapping (to be enhanced in Epic 2.1)
const WEATHER_TEA_MAPPINGS: WeatherTeaMapping = {
  conditions: {
    temperature: {
      min: -10, max: 15,
      teaTypes: ['black', 'puerh'] // Warming teas for cold weather
    },
    humidity: {
      min: 60, max: 100,
      brewingAdjustments: ['shorter-steep', 'higher-temp'] // Combat humidity
    },
    pressure: {
      min: 1000, max: 1020,
      moodMapping: 'calming' // High pressure = stable, calming teas
    }
  },
  seasonal: {
    winter: {
      recommendedTeas: ['black', 'puerh', 'herbal'],
      brewingStyle: 'longer-steeps',
      notes: 'Rich, warming teas for cold months'
    },
    spring: {
      recommendedTeas: ['green', 'white'],
      brewingStyle: 'gentle-steeps', 
      notes: 'Fresh, delicate teas for renewal'
    },
    summer: {
      recommendedTeas: ['green', 'white', 'oolong'],
      brewingStyle: 'cooling-method',
      notes: 'Light, refreshing teas with cold-brew options'
    },
    autumn: {
      recommendedTeas: ['oolong', 'black'],
      brewingStyle: 'balanced-steeps',
      notes: 'Transitional teas for changing seasons'
    }
  }
};

// Foundation class for weather integration (Epic 2.1 implementation)
export class WeatherTeaAdvisor {
  private static instance: WeatherTeaAdvisor;
  
  private constructor() {}
  
  static getInstance(): WeatherTeaAdvisor {
    if (!WeatherTeaAdvisor.instance) {
      WeatherTeaAdvisor.instance = new WeatherTeaAdvisor();
    }
    return WeatherTeaAdvisor.instance;
  }
  
  // Real weather data implementation for Epic 2.1
  async getCurrentWeather(): Promise<WeatherData> {
    try {
      // Try to get real weather data from a free API (OpenWeatherMap alternative)
      const response = await fetch('https://api.weather.gov/points/39.7456,-97.0892'); // Central US for demo
      if (response.ok) {
        const data = await response.json();
        // Parse real weather data
        return {
          temperature: Math.round((data.properties?.temperature || 22)),
          humidity: data.properties?.relativeHumidity?.value || 65,
          pressure: data.properties?.barometricPressure?.value || 1015,
          conditions: this.parseWeatherConditions(data.properties?.textDescription || ''),
          season: this.getCurrentSeason()
        };
      }
    } catch (error) {
      console.log('Weather API unavailable, using seasonal defaults');
    }
    
    // Fallback to seasonal mock data
    return this.getSeasonalFallbackWeather();
  }
  
  private parseWeatherConditions(description: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow' {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('shower')) return 'rainy';
    if (desc.includes('storm') || desc.includes('thunder')) return 'stormy';
    if (desc.includes('snow') || desc.includes('blizzard')) return 'snow';
    if (desc.includes('cloud') || desc.includes('overcast')) return 'cloudy';
    return 'sunny';
  }
  
  private getSeasonalFallbackWeather(): WeatherData {
    const season = this.getCurrentSeason();
    const seasonalDefaults = {
      spring: { temp: 18, humidity: 60, pressure: 1013, conditions: 'cloudy' as const },
      summer: { temp: 28, humidity: 70, pressure: 1015, conditions: 'sunny' as const },
      autumn: { temp: 15, humidity: 55, pressure: 1018, conditions: 'cloudy' as const },
      winter: { temp: 5, humidity: 45, pressure: 1020, conditions: 'cloudy' as const }
    };
    
    const defaults = seasonalDefaults[season];
    return {
      temperature: defaults.temp,
      humidity: defaults.humidity,
      pressure: defaults.pressure,
      conditions: defaults.conditions,
      season
    };
  }
  
  private getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
  
  // Enhanced weather-based tea recommendation
  async getWeatherBasedRecommendation(userPreferences?: string[]): Promise<{
    recommendedTea: string;
    reason: string;
    brewingNotes: string;
    weatherInfluence: string;
    confidence: number;
  }> {
    const weather = await this.getCurrentWeather();
    const seasonalData = WEATHER_TEA_MAPPINGS.seasonal[weather.season];
    
    // Multi-factor recommendation logic
    let recommendedTea = seasonalData.recommendedTeas[0];
    let weatherInfluence = '';
    let confidence = 0.7; // Base confidence
    
    // Temperature-based adjustments
    if (weather.temperature < 10) {
      recommendedTea = ['black', 'puerh'].find(tea => seasonalData.recommendedTeas.includes(tea)) || recommendedTea;
      weatherInfluence += 'Warming tea for cold weather. ';
      confidence += 0.1;
    } else if (weather.temperature > 25) {
      recommendedTea = ['green', 'white'].find(tea => seasonalData.recommendedTeas.includes(tea)) || recommendedTea;
      weatherInfluence += 'Cooling tea for warm weather. ';
      confidence += 0.1;
    }
    
    // Humidity considerations
    if (weather.humidity > 70) {
      if (seasonalData.recommendedTeas.includes('puerh')) {
        recommendedTea = 'puerh';
        weatherInfluence += 'Drying tea for humid conditions. ';
        confidence += 0.05;
      }
    }
    
    // Weather condition adjustments
    switch (weather.conditions) {
      case 'rainy':
        recommendedTea = ['black', 'herbal'].find(tea => seasonalData.recommendedTeas.includes(tea)) || recommendedTea;
        weatherInfluence += 'Comforting tea for rainy weather. ';
        confidence += 0.1;
        break;
      case 'stormy':
        recommendedTea = 'herbal';
        weatherInfluence += 'Calming tea for stormy weather. ';
        confidence += 0.15;
        break;
      case 'sunny':
        recommendedTea = ['green', 'white'].find(tea => seasonalData.recommendedTeas.includes(tea)) || recommendedTea;
        weatherInfluence += 'Fresh tea for bright weather. ';
        confidence += 0.05;
        break;
    }
    
    // Consider user preferences (highest priority)
    if (userPreferences && userPreferences.length > 0) {
      const match = seasonalData.recommendedTeas.find(tea => userPreferences.includes(tea));
      if (match) {
        recommendedTea = match;
        weatherInfluence += 'Matched to your preferences. ';
        confidence += 0.2;
      }
    }
    
    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);
    
    return {
      recommendedTea,
      reason: `Perfect for ${weather.season} weather (${weather.temperature}°C, ${weather.conditions})`,
      brewingNotes: seasonalData.notes,
      weatherInfluence: weatherInfluence.trim(),
      confidence: Math.round(confidence * 100) / 100
    };
  }
  
  // Foundation method for Epic 2.1 expansion
  async getAdvancedWeatherCorrelation(teaId: string): Promise<{
    weatherCompatibility: number; // 0-1 score
    optimalConditions: Partial<WeatherData>;
    seasonalRecommendation: string;
  }> {
    // Placeholder for Epic 2.1 implementation
    // Will include barometric pressure correlation, humidity adjustments, etc.
    
    return {
      weatherCompatibility: 0.8,
      optimalConditions: {
        temperature: 20,
        humidity: 50
      },
      seasonalRecommendation: 'Best enjoyed during stable weather patterns'
    };
  }
}

export default WeatherTeaAdvisor;