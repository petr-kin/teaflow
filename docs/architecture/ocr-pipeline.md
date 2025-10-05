# TeaFlow OCR Pipeline

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Purpose:** Complete guide to TeaFlow's OCR system for automated tea package recognition

## Overview

TeaFlow's OCR pipeline transforms camera-captured tea package images into structured tea profiles, reducing manual data entry and enabling rapid tea library expansion. The system balances accuracy, performance, and user experience with a <3-second end-to-end target.

## Current Implementation State

### ✅ Completed Components
- **Camera Interface**: `components/CameraScreen.tsx` - Full camera capture UX
- **Image Preprocessing**: Basic image enhancement and resizing
- **UI Framework**: Review/edit interface for parsed results
- **Data Integration**: Parsed data to TeaProfile creation

### ⚠️ Partial Implementation
- **Text Parsing**: Basic regex patterns for temperature/time extraction
- **Confidence Scoring**: Simple threshold-based validation
- **Error Handling**: Basic fallback to manual entry

### ❌ Missing Components
- **Cloud OCR Integration**: No API wiring to Vision/Textract services
- **Advanced Parsing**: Limited multilingual support
- **Optimization**: No caching or batching for multiple images

## Architecture Overview

```typescript
interface OCRPipeline {
  // Phase 1: Image Capture (✅ Complete)
  captureImage(): Promise<ImageResult>;
  
  // Phase 2: Preprocessing (✅ Complete)
  preprocessImage(imageUri: string): Promise<ProcessedImage>;
  
  // Phase 3: Text Recognition (❌ Cloud integration missing)
  recognizeText(image: ProcessedImage): Promise<OCRResponse>;
  
  // Phase 4: Information Extraction (⚠️ Partial)
  parseTeaInformation(text: string): Promise<TeaInformation>;
  
  // Phase 5: Validation & Review (✅ Complete)
  validateAndReview(info: TeaInformation): Promise<TeaProfile>;
}
```

## Image Capture System

### Camera Configuration

```typescript
// components/CameraScreen.tsx
const cameraConfig = {
  // Image quality optimized for OCR
  quality: 0.8,              // Balance between quality and file size
  base64: false,             // Avoid memory bloat
  exif: false,              // Skip metadata for privacy
  
  // Camera settings for text recognition
  flashMode: Camera.FlashMode.auto,
  whiteBalance: Camera.WhiteBalance.auto,
  focusDepth: 0.5,          // Mid-range focus for packages
  
  // Aspect ratio for tea packages (usually landscape)
  ratio: '4:3',
  
  // Resolution constraints
  pictureSize: '1920x1440',  // Sufficient for text recognition
};

const CaptureArea: React.FC = () => {
  return (
    <View style={styles.captureOverlay}>
      {/* Guide frame for optimal text capture */}
      <View style={styles.guidedFrame}>
        <Text style={styles.guideText}>
          Position tea package label within frame
        </Text>
        <View style={styles.cornerGuides} />
      </View>
      
      {/* Capture tips */}
      <View style={styles.tips}>
        <Text style={styles.tipText}>
          • Ensure good lighting
          • Keep text straight and clear
          • Avoid shadows and glare
        </Text>
      </View>
    </View>
  );
};
```

### Image Quality Validation

```typescript
// Validate image before processing
interface ImageQuality {
  brightness: number;        // 0-1, optimal 0.3-0.8
  contrast: number;         // 0-1, optimal >0.4
  sharpness: number;        // 0-1, optimal >0.6
  textArea: number;         // Percentage of image with text
}

const validateImageQuality = async (imageUri: string): Promise<ImageQuality> => {
  const image = await loadImage(imageUri);
  
  return {
    brightness: calculateBrightness(image),
    contrast: calculateContrast(image),
    sharpness: calculateSharpness(image),
    textArea: estimateTextArea(image),
  };
};

const isImageSuitableForOCR = (quality: ImageQuality): boolean => {
  return (
    quality.brightness > 0.3 && quality.brightness < 0.8 &&
    quality.contrast > 0.4 &&
    quality.sharpness > 0.6 &&
    quality.textArea > 0.1  // At least 10% text content
  );
};
```

## Image Preprocessing

### Enhancement Pipeline

```typescript
// lib/image-processor.ts
class ImageProcessor {
  async preprocessForOCR(imageUri: string): Promise<ProcessedImage> {
    const operations = [
      this.resize,              // Standardize size
      this.enhanceContrast,     // Improve text visibility
      this.sharpen,             // Enhance text edges
      this.deskew,              // Correct rotation
      this.removeNoise,         // Clean up artifacts
    ];
    
    let processedImage = await this.loadImage(imageUri);
    
    for (const operation of operations) {
      processedImage = await operation(processedImage);
    }
    
    return processedImage;
  }
  
  private async resize(image: ImageData): Promise<ImageData> {
    // Resize to optimal OCR dimensions (1920x1440 max)
    const maxDimension = 1920;
    const { width, height } = image;
    
    if (Math.max(width, height) > maxDimension) {
      const ratio = maxDimension / Math.max(width, height);
      return this.scaleImage(image, ratio);
    }
    
    return image;
  }
  
  private async enhanceContrast(image: ImageData): Promise<ImageData> {
    // Apply adaptive histogram equalization for better text contrast
    return this.applyFilter(image, {
      type: 'histogram_equalization',
      adaptive: true,
      clipLimit: 2.0,
    });
  }
  
  private async sharpen(image: ImageData): Promise<ImageData> {
    // Unsharp mask to enhance text edges
    return this.applyFilter(image, {
      type: 'unsharp_mask',
      amount: 0.5,
      radius: 1.0,
      threshold: 0.05,
    });
  }
  
  private async deskew(image: ImageData): Promise<ImageData> {
    // Detect and correct text rotation
    const skewAngle = await this.detectSkew(image);
    
    if (Math.abs(skewAngle) > 0.5) { // Correct if >0.5 degrees
      return this.rotateImage(image, -skewAngle);
    }
    
    return image;
  }
}
```

## Cloud OCR Integration (To Be Implemented)

### Service Architecture

```typescript
// lib/ocr-services.ts
abstract class OCRService {
  abstract recognizeText(image: ProcessedImage): Promise<OCRResponse>;
  abstract getConfidenceThreshold(): number;
  abstract getCostPerRequest(): number;
}

class GoogleVisionOCR extends OCRService {
  private apiKey: string;
  private endpoint = 'https://vision.googleapis.com/v1/images:annotate';
  
  async recognizeText(image: ProcessedImage): Promise<OCRResponse> {
    const base64Image = await this.imageToBase64(image);
    
    const request = {
      requests: [{
        image: { content: base64Image },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 50,
        }],
        imageContext: {
          languageHints: ['en', 'zh', 'ja'], // English, Chinese, Japanese
        },
      }],
    };
    
    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    return this.parseGoogleVisionResponse(await response.json());
  }
  
  getConfidenceThreshold(): number { return 0.7; }
  getCostPerRequest(): number { return 0.0015; } // $1.50 per 1000 requests
}

class AWSTextractOCR extends OCRService {
  private accessKey: string;
  private secretKey: string;
  private region = 'us-east-1';
  
  async recognizeText(image: ProcessedImage): Promise<OCRResponse> {
    const textract = new AWS.Textract({
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey,
      region: this.region,
    });
    
    const params = {
      Document: {
        Bytes: await this.imageToBytes(image),
      },
      FeatureTypes: ['TABLES', 'FORMS'], // Structured text extraction
    };
    
    const result = await textract.analyzeDocument(params).promise();
    return this.parseTextractResponse(result);
  }
  
  getConfidenceThreshold(): number { return 0.8; }
  getCostPerRequest(): number { return 0.0010; } // $1.00 per 1000 requests
}

// Fallback on-device OCR (larger app size but private)
class MLKitOCR extends OCRService {
  async recognizeText(image: ProcessedImage): Promise<OCRResponse> {
    // Use expo-ml-kit or react-native-ml-kit
    const result = await MLKit.recognizeText(image);
    return this.parseMLKitResponse(result);
  }
  
  getConfidenceThreshold(): number { return 0.6; } // Lower accuracy
  getCostPerRequest(): number { return 0; } // Free but larger app
}
```

### OCR Response Processing

```typescript
interface OCRResponse {
  fullText: string;           // Complete recognized text
  confidence: number;         // Overall confidence (0-1)
  textBlocks: TextBlock[];    // Structured text regions
  processingTime: number;     // Service response time
}

interface TextBlock {
  text: string;              // Block text content
  confidence: number;        // Block-level confidence
  boundingBox: BoundingBox;  // Spatial coordinates
  isTitle?: boolean;         // Detected as title/header
  isMetadata?: boolean;      // Brewing instructions
}

interface BoundingBox {
  x: number;                 // Left coordinate
  y: number;                 // Top coordinate
  width: number;             // Box width
  height: number;            // Box height
}

// OCR service selection based on requirements
class OCRServiceManager {
  private services: OCRService[];
  
  constructor() {
    this.services = [
      new GoogleVisionOCR(),   // Primary: High accuracy
      new AWSTextractOCR(),    // Fallback: Good structured text
      new MLKitOCR(),          // Last resort: Privacy-focused
    ];
  }
  
  async recognizeText(image: ProcessedImage): Promise<OCRResponse> {
    const userPrefs = await getUserPreferences();
    
    // Privacy mode: Use only on-device OCR
    if (userPrefs.privacyMode) {
      return this.services[2].recognizeText(image);
    }
    
    // Try services in order until success or all fail
    for (const service of this.services) {
      try {
        const response = await service.recognizeText(image);
        
        if (response.confidence >= service.getConfidenceThreshold()) {
          return response;
        }
      } catch (error) {
        console.warn(`OCR service failed:`, error);
        continue; // Try next service
      }
    }
    
    throw new Error('All OCR services failed');
  }
}
```

## Information Extraction

### Text Parsing Patterns

```typescript
// lib/tea-parser.ts
interface TeaInformation {
  name?: string;
  temperature?: number;       // Celsius
  steepTimes?: number[];     // Seconds
  teaType?: TeaType;
  origin?: string;
  instructions?: string;
  confidence: ExtractionConfidence;
}

interface ExtractionConfidence {
  name: number;              // 0-1 confidence
  temperature: number;
  steepTimes: number;
  teaType: number;
  overall: number;           // Combined confidence
}

class TeaInformationExtractor {
  // Temperature extraction patterns
  private temperaturePatterns = [
    /(\d+)\s*°?\s*[CcFf]/g,                    // "85°C", "185F"
    /temp[erature]*:?\s*(\d+)/gi,              // "Temperature: 85"
    /(\d+)\s*degrees?/gi,                      // "85 degrees"
    /brew\s+at\s+(\d+)/gi,                     // "Brew at 85"
    /water\s+temp[erature]*:?\s*(\d+)/gi,      // "Water temperature: 85"
  ];
  
  // Steeping time patterns
  private timePatterns = [
    /(\d+)\s*min[utes]*\s*(\d+)\s*sec[onds]*/gi,  // "3 minutes 30 seconds"
    /(\d+)[-:](\d+)/g,                             // "3:30", "3-4"
    /steep\s*(?:for\s*)?(\d+)/gi,                  // "steep for 3"
    /(\d+)\s*(?:sec|second)s?/gi,                  // "30 seconds"
    /(\d+)\s*(?:min|minute)s?/gi,                  // "3 minutes"
    /infusion[:\s]*(\d+)\s*(?:min|sec)/gi,         // "Infusion: 3 min"
  ];
  
  // Tea type classification patterns
  private typePatterns = {
    green: /green\s*tea|sencha|matcha|gyokuro|longjing|dragon\s*well/gi,
    black: /black\s*tea|english\s*breakfast|earl\s*grey|assam|ceylon/gi,
    oolong: /oolong|wu\s*long|tie\s*guan\s*yin|da\s*hong\s*pao/gi,
    white: /white\s*tea|silver\s*needle|white\s*peony|bai\s*mu\s*dan/gi,
    puerh: /pu['-]?erh|pu['-]?er|aged\s*tea|fermented\s*tea/gi,
    herbal: /herbal|chamomile|peppermint|rooibos|tisane/gi,
  };
  
  async extractInformation(ocrResponse: OCRResponse): Promise<TeaInformation> {
    const text = ocrResponse.fullText.toLowerCase();
    const blocks = ocrResponse.textBlocks;
    
    const extracted: TeaInformation = {
      confidence: { name: 0, temperature: 0, steepTimes: 0, teaType: 0, overall: 0 }
    };
    
    // Extract tea name (usually in title blocks or first few lines)
    extracted.name = this.extractTeaName(blocks);
    extracted.confidence.name = this.calculateNameConfidence(extracted.name, blocks);
    
    // Extract temperature
    extracted.temperature = this.extractTemperature(text);
    extracted.confidence.temperature = this.calculateTemperatureConfidence(extracted.temperature, text);
    
    // Extract steeping times
    extracted.steepTimes = this.extractSteepTimes(text);
    extracted.confidence.steepTimes = this.calculateTimesConfidence(extracted.steepTimes, text);
    
    // Classify tea type
    extracted.teaType = this.classifyTeaType(text);
    extracted.confidence.teaType = this.calculateTypeConfidence(extracted.teaType, text);
    
    // Calculate overall confidence
    extracted.confidence.overall = this.calculateOverallConfidence(extracted.confidence);
    
    return extracted;
  }
  
  private extractTemperature(text: string): number | undefined {
    for (const pattern of this.temperaturePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      if (matches.length > 0) {
        const temp = parseInt(matches[0][1]);
        
        // Convert Fahrenheit to Celsius if needed
        if (temp > 50 && temp < 110) {
          return temp; // Likely Celsius
        } else if (temp > 150 && temp < 220) {
          return Math.round((temp - 32) * 5 / 9); // Convert F to C
        }
      }
    }
    
    return undefined;
  }
  
  private extractSteepTimes(text: string): number[] | undefined {
    const times: number[] = [];
    
    for (const pattern of this.timePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        if (match[2]) {
          // Minutes and seconds format
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          times.push(minutes * 60 + seconds);
        } else {
          // Single number - determine if minutes or seconds based on context
          const value = parseInt(match[1]);
          
          if (text.includes('min')) {
            times.push(value * 60); // Convert to seconds
          } else {
            times.push(value); // Assume seconds
          }
        }
      }
    }
    
    // Remove duplicates and sort
    const uniqueTimes = [...new Set(times)].sort((a, b) => a - b);
    
    // Validate reasonable steeping times (5 seconds to 20 minutes)
    const validTimes = uniqueTimes.filter(time => time >= 5 && time <= 1200);
    
    return validTimes.length > 0 ? validTimes : undefined;
  }
  
  private extractTeaName(blocks: TextBlock[]): string | undefined {
    // Look for title blocks or large text at the top
    const titleBlocks = blocks
      .filter(block => block.isTitle || block.boundingBox.y < 0.3) // Top 30% of image
      .sort((a, b) => a.boundingBox.y - b.boundingBox.y); // Top to bottom
    
    if (titleBlocks.length > 0) {
      // Clean up the name
      let name = titleBlocks[0].text
        .replace(/[^\w\s-]/g, ' ') // Remove special characters
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .trim();
      
      // Remove common packaging words
      const stopWords = ['organic', 'premium', 'loose', 'leaf', 'tea', 'bags', 'sachets'];
      name = name.split(' ')
        .filter(word => !stopWords.includes(word.toLowerCase()))
        .join(' ');
      
      return name.length > 2 ? name : undefined;
    }
    
    return undefined;
  }
  
  private classifyTeaType(text: string): TeaType | undefined {
    let maxMatches = 0;
    let bestType: TeaType | undefined;
    
    for (const [type, pattern] of Object.entries(this.typePatterns)) {
      const matches = (text.match(pattern) || []).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestType = type as TeaType;
      }
    }
    
    return maxMatches > 0 ? bestType : undefined;
  }
  
  private calculateOverallConfidence(conf: ExtractionConfidence): number {
    // Weighted confidence calculation
    const weights = {
      name: 0.3,
      temperature: 0.25,
      steepTimes: 0.25,
      teaType: 0.2,
    };
    
    return (
      conf.name * weights.name +
      conf.temperature * weights.temperature +
      conf.steepTimes * weights.steepTimes +
      conf.teaType * weights.teaType
    );
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// lib/ocr-cache.ts
interface OCRCacheEntry {
  imageHash: string;        // Image content hash
  ocrResponse: OCRResponse;
  timestamp: number;
  expiresAt: number;
}

class OCRCache {
  private cache = new Map<string, OCRCacheEntry>();
  private readonly MAX_CACHE_SIZE = 50;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  async get(imageUri: string): Promise<OCRResponse | null> {
    const hash = await this.hashImage(imageUri);
    const entry = this.cache.get(hash);
    
    if (entry && entry.expiresAt > Date.now()) {
      return entry.ocrResponse;
    }
    
    if (entry) {
      this.cache.delete(hash); // Remove expired entry
    }
    
    return null;
  }
  
  async set(imageUri: string, response: OCRResponse): Promise<void> {
    const hash = await this.hashImage(imageUri);
    
    // Cleanup old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupOldEntries();
    }
    
    this.cache.set(hash, {
      imageHash: hash,
      ocrResponse: response,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION,
    });
  }
  
  private async hashImage(imageUri: string): Promise<string> {
    // Simple content-based hash for duplicate detection
    const imageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Use first and last 1KB for quick hash
    const start = imageData.substring(0, 1024);
    const end = imageData.substring(imageData.length - 1024);
    
    return btoa(start + end).substring(0, 32);
  }
  
  private cleanupOldEntries(): void {
    // Remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = entries.slice(0, this.MAX_CACHE_SIZE / 2);
    toRemove.forEach(([hash]) => this.cache.delete(hash));
  }
}
```

### Batch Processing

```typescript
// Process multiple images efficiently
class BatchOCRProcessor {
  private queue: ProcessingJob[] = [];
  private processing = false;
  private readonly MAX_CONCURRENT = 2;
  
  async addJob(imageUri: string): Promise<TeaInformation> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        imageUri,
        resolve,
        reject,
        createdAt: Date.now(),
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    const batch = this.queue.splice(0, this.MAX_CONCURRENT);
    const promises = batch.map(job => this.processJob(job));
    
    await Promise.allSettled(promises);
    
    this.processing = false;
    
    // Continue processing if more jobs arrived
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
  
  private async processJob(job: ProcessingJob): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Check cache first
      const cached = await this.cache.get(job.imageUri);
      if (cached) {
        const extracted = await this.extractor.extractInformation(cached);
        job.resolve(extracted);
        return;
      }
      
      // Process image
      const processed = await this.processor.preprocessForOCR(job.imageUri);
      const ocrResponse = await this.ocrService.recognizeText(processed);
      const extracted = await this.extractor.extractInformation(ocrResponse);
      
      // Cache result
      await this.cache.set(job.imageUri, ocrResponse);
      
      const processingTime = Date.now() - startTime;
      console.log(`OCR processing completed in ${processingTime}ms`);
      
      job.resolve(extracted);
      
    } catch (error) {
      job.reject(error);
    }
  }
}
```

## Error Handling and Fallbacks

### Graceful Degradation

```typescript
// Handle OCR failures gracefully
class OCRErrorHandler {
  async handleOCRFailure(error: Error, imageUri: string): Promise<TeaInformation> {
    console.warn('OCR processing failed:', error);
    
    // Attempt basic image analysis as fallback
    try {
      const basicInfo = await this.extractBasicInformation(imageUri);
      return basicInfo;
    } catch (fallbackError) {
      // Complete fallback to manual entry
      return this.createEmptyTeaInformation();
    }
  }
  
  private async extractBasicInformation(imageUri: string): Promise<TeaInformation> {
    // Use color analysis to guess tea type
    const dominantColors = await this.analyzeColors(imageUri);
    const guessedType = this.guessTeaTypeFromColors(dominantColors);
    
    return {
      teaType: guessedType,
      confidence: {
        name: 0,
        temperature: 0,
        steepTimes: 0,
        teaType: guessedType ? 0.3 : 0, // Low confidence guess
        overall: guessedType ? 0.1 : 0,
      }
    };
  }
  
  private createEmptyTeaInformation(): TeaInformation {
    return {
      confidence: {
        name: 0,
        temperature: 0,
        steepTimes: 0,
        teaType: 0,
        overall: 0,
      }
    };
  }
}
```

## Testing Framework

### OCR Accuracy Testing

```typescript
// Test OCR accuracy with known tea packages
describe('OCR Pipeline', () => {
  const testImages = [
    { path: 'test-images/green-tea-package.jpg', expected: { /* ... */ } },
    { path: 'test-images/oolong-package.jpg', expected: { /* ... */ } },
    // ... more test cases
  ];
  
  test.each(testImages)('accurately extracts tea information from %s', async ({ path, expected }) => {
    const processor = new OCRPipeline();
    const result = await processor.processImage(path);
    
    // Validate extracted information
    expect(result.teaType).toBe(expected.teaType);
    expect(result.temperature).toBeCloseTo(expected.temperature, 5); // Within 5°C
    expect(result.steepTimes).toEqual(expect.arrayContaining(expected.steepTimes));
    expect(result.confidence.overall).toBeGreaterThan(0.7);
  });
  
  test('handles poor quality images gracefully', async () => {
    const processor = new OCRPipeline();
    const result = await processor.processImage('test-images/blurry-package.jpg');
    
    // Should not crash and should indicate low confidence
    expect(result).toBeDefined();
    expect(result.confidence.overall).toBeLessThan(0.5);
  });
  
  test('processes image within performance target', async () => {
    const processor = new OCRPipeline();
    const startTime = Date.now();
    
    await processor.processImage('test-images/standard-package.jpg');
    
    const processingTime = Date.now() - startTime;
    expect(processingTime).toBeLessThan(3000); // <3s target
  });
});
```

This comprehensive OCR pipeline documentation provides AI agents with the complete framework for implementing and enhancing TeaFlow's automated tea package recognition system.