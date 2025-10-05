# Localization Strategy

## Multi-language Support
```typescript
const teaTranslations = {
  'en': {
    'green_default': 'Green Tea',
    'black_default': 'Black Tea'
  },
  'zh': {
    'green_default': '绿茶',
    'black_default': '红茶'
  },
  'ja': {
    'green_default': '緑茶',
    'black_default': '紅茶'
  }
};
```

## Cultural Adaptations
```typescript
const regionalDefaults = {
  'CN': ['longjing', 'tieguanyin', 'puerh'],
  'JP': ['sencha', 'gyokuro', 'genmaicha'],
  'IN': ['darjeeling', 'assam', 'chai'],
  'GB': ['earl_grey', 'english_breakfast'],
  'US': ['green_default', 'black_default', 'herbal_default']
};
```
