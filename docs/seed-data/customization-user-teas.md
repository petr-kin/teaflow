# Customization & User Teas

## Custom Tea Creation
```typescript
interface CustomTea extends BaseTea {
  isCustom: true;
  createdAt: number;
  basedOn?: string; // ID of tea it's based on
  source: 'manual' | 'ocr' | 'import';
  confidence?: number; // For OCR-created teas
}
```

## Import/Export Format
```typescript
interface TeaExportFormat {
  version: '2.0';
  exportedAt: number;
  teas: {
    defaults: string[]; // IDs only
    custom: CustomTea[];
  };
  preferences: UserTeaProfile;
  stats: {
    totalBrews: number;
    favoriteTea: string;
    averageBrewTime: number;
  };
}
```
