# Multilingual Architecture Documentation

## Overview

The application now uses a **static, language-routed architecture** for multilingual support. Instead of runtime translation or language selectors, users access different language versions through URL prefixes.

## Language Routes

All dashboard and main pages are available in three languages:

- **English**: `https://example.com/en/dashboard`
- **Hindi**: `https://example.com/hi/dashboard`
- **French**: `https://example.com/fr/dashboard`

The root URL `/` automatically redirects to `/en/dashboard` (English by default).

## Architecture

### 1. Language Files (`lib/i18n/`)

Static translation files organize all user-facing content:

```
lib/i18n/
├── en.ts       # English translations
├── hi.ts       # Hindi translations
├── fr.ts       # French translations
└── index.ts    # Central exports and helpers
```

Each file exports a `language` object with namespaced translation keys:

```typescript
export const en = {
  header: {
    title: "WEC-Guardian · demonstration only",
    audioEnable: "Enable audio",
    // ...
  },
  main: {
    certificateProcess: "60 second certificate process",
    // ...
  },
  // ... more namespaces
};
```

### 2. Route Structure (`app/[lang]/`)

Language is a dynamic route segment:

```
app/
├── [lang]/
│   ├── layout.tsx              # Language layout wrapper
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx        # Language-specific dashboard
├── page.tsx                     # Root page (redirects to /en/dashboard)
└── dashboard/page.tsx           # Legacy redirect (→ /en/dashboard)
```

### 3. Component Updates

#### ConciergeClient Component

**Old approach (removed):**
```typescript
const [language, setLanguage] = useState("en");
const text = await translateText("Hello", language);
```

**New approach:**
```typescript
export function ConciergeClient({ 
  embed, 
  language = "en" 
}: { 
  embed?: boolean
  language?: Language 
}) {
  const translations = getTranslations(language);
  const langMeta = getLanguageMetadata(language);
  // ...
  return <div>{translations.header.title}</div>;
}
```

#### Language-Specific TTS

Instead of runtime translation before speaking, the component now speaks the hardcoded content in the selected language:

```typescript
const speakWithLanguage = useCallback((text: string) => {
  speak(text, langMeta.langCode);  // e.g., "hi-IN", "fr-FR"
}, [langMeta.langCode]);

speakWithLanguage("60 second certificate process");
```

### 4. Page Structure

Pages receive the language parameter and pass it to components:

```typescript
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  return (
    <ConciergeClient 
      language={lang as Language} 
      embed={embed} 
    />
  );
}
```

## Adding New Languages

To add a new language (e.g., Spanish):

### 1. Create translation file (`lib/i18n/es.ts`):
```typescript
export const es = {
  header: { ... },
  main: { ... },
  // ... all other namespaces
};

export type TranslationKeys = typeof es;
```

### 2. Update `lib/i18n/index.ts`:
```typescript
import { es } from "./es";

export type Language = "en" | "hi" | "fr" | "es";

export const translations: Record<Language, TranslationKeys> = {
  en, hi, fr, es,
};

export const languageMetadata: Record<Language, ...> = {
  // ...
  es: { code: "es", name: "Spanish", nativeName: "Español", langCode: "es-ES" },
};
```

### 3. Update route validator in `app/[lang]/layout.tsx`:
```typescript
const validLanguages = ["en", "hi", "fr", "es"];
```

## How Users Switch Languages

Users can navigate between languages using URL prefixes:

- English: `/en/dashboard`
- Hindi: `/hi/dashboard`  
- French: `/fr/dashboard`

The application can optionally provide language switcher links in the UI that direct to the same page in a different language.

## Performance Benefits

1. **No Runtime Translation**: All strings are pre-defined static constants
2. **No API Calls**: No need for `/api/translate` endpoint
3. **Faster Load Times**: Translations are bundled with the app
4. **Better SEO**: Language is clear from URL structure
5. **Type Safety**: Full TypeScript support for translation keys

## Migration Notes

### Removed
- `translateText()` function
- Translation cache
- `/api/translate` endpoint calls (endpoint still exists but unused)
- Language selector dropdown UI
- In-component language state mutation

### Preserved
- TTS/speech synthesis functionality
- All existing routes and functionality
- Backward compatibility via redirects

## Example: Using Translations in a Component

```typescript
import { getTranslations, type Language } from "@/lib/i18n";

export function MyComponent({ language = "en" }: { language?: Language }) {
  const t = getTranslations(language);
  
  return (
    <div>
      <h1>{t.main.certificateProcess}</h1>
      <p>{t.main.certificateProcessDesc}</p>
      <button title={t.header.audioEnable}>
        🔊
      </button>
    </div>
  );
}
```

## Deployment

No special configuration needed:
- All languages are built statically
- Routes are pre-generated for `/en/*`, `/hi/*`, `/fr/*`
- Fallback to English for invalid language codes

## Future Considerations

- Consider adding a language switcher component in the header
- Add language preference detection based on browser locale
- Consider cookies/localStorage for user language preference (though URL is the source of truth)
- Implement language prefixes in dynamic routes (verify, admin, etc.)
