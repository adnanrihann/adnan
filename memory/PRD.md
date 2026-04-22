# PRD - القرآن المبسط (Simple Quran)

## Overview
A minimal, distraction-free, offline-first Quran reading mobile app built with React Native (Expo Router). Designed as a "Digital Mushaf" with Arabic RTL-first UI, Scheherazade New typography, and auto-save reading position.

## Tech Stack
- **Framework**: React Native + Expo SDK 54 + Expo Router (file-based routing)
- **Language**: TypeScript
- **Fonts**: `@expo-google-fonts/scheherazade-new` (Regular + Bold)
- **Persistence**: `@react-native-async-storage/async-storage`
- **Data**: Bundled local JSON (`src/data/quran.json`) — works 100% offline
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Backend/DB**: Not used — app is fully client-side offline

## MVP Scope (as confirmed with user)
Only includes Al-Fatiha (primary POC) plus 3 short end surahs (Al-Ikhlas, Al-Falaq, An-Nas) to fully demonstrate the "Next Surah" flow. Full Quran JSON to be added in next iteration after typography/scroll/auto-save validation.

## Key Features Implemented
1. **Index Screen (`/app/index.tsx`)**
   - App title + subtitle in Scheherazade
   - Prominent "Continue Reading" card (appears only after first read) → jumps to last surah + restores scroll position
   - Dashed placeholder when no last-read yet
   - Surah list (FlatList) with numbered badge, name, revelation type, verse count
   - Theme toggle chip in header
2. **Reading Screen (`/app/reading/[id].tsx`)**
   - Continuous vertical ScrollView (no fragmented FlatList)
   - Each ayah rendered inline with the Arabic Quran symbol `۝` + Arabic numeral
   - Minimal top bar: back + current-ayah indicator + settings toggle
   - Slide-down settings panel with:
     - Font size: `-A` / numeric display / `+A` (22–48 px clamp)
     - Theme toggle ("الوضع النهاري" ⇄ "الوضع الليلي")
   - Decorative "صدق الله العظيم" end ornament
   - "السورة التالية" button (or "العودة إلى الفهرس" on last surah)
3. **Auto-save** (background, debounced 400ms on scroll)
   - Saves: surahId, surahName, current ayah number, scrollY
   - Tiny "✓ تم حفظ الموضع" flash as user-visible confirmation
   - Scroll position restored when reopening the same surah
4. **Theming**
   - System-default (follows `useColorScheme()`)
   - Light: `#FBF8F1` paper / `#1A1A1A` text / `#A78B5D` aged-gold accent
   - Dark: `#121212` bg / `#EAEAEA` text / `#C2A878` accent
   - Preference persisted in AsyncStorage
5. **RTL**
   - All layout via `flexDirection: "row-reverse"` and `writingDirection: "rtl"`
   - Works cleanly on web preview without global `I18nManager.forceRTL` (which would require native restart)

## File Structure
```
/app/frontend/
├── app/
│   ├── _layout.tsx           # Stack + ThemeProvider + Fonts + SafeAreaProvider
│   ├── index.tsx             # Surah list + Continue Reading
│   └── reading/[id].tsx      # Distraction-free reader
└── src/
    ├── constants/theme.ts    # Colors, font-size bounds, spacing scale
    ├── contexts/ThemeContext.tsx  # Theme + font size + last read state (AsyncStorage)
    ├── data/
    │   ├── quran.json        # Al-Fatiha + Al-Ikhlas + Al-Falaq + An-Nas
    │   └── quranData.ts      # Typed accessors (getSurahById, getNextSurah)
    └── utils/arabicNumerals.ts    # toArabicNumerals()
```

## AsyncStorage Keys
- `@quran:themePreference` → "system" | "light" | "dark"
- `@quran:fontSize` → number (stringified)
- `@quran:lastRead` → JSON `{ surahId, surahName, ayahNumber, scrollY, updatedAt }`

## Future Work (deferred per user request)
- Load full 114-surah JSON
- Search, multiple bookmarks
- Per-ayah highlight on scroll
- Audio recitation / translations
