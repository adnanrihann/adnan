import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ThemeMode,
  ThemeColors,
  getColors,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
} from "../constants/theme";

export type ThemePreference = "system" | "light" | "dark";

export interface LastRead {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  scrollY: number;
  updatedAt: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  colors: ThemeColors;
  fontSize: number;
  toggleTheme: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  lastRead: LastRead | null;
  saveLastRead: (data: LastRead) => Promise<void>;
  clearLastRead: () => Promise<void>;
  ready: boolean;
}

const STORAGE_KEYS = {
  theme: "@quran:themePreference",
  fontSize: "@quran:fontSize",
  lastRead: "@quran:lastRead",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [fontSize, setFontSize] = useState<number>(FONT_SIZE_DEFAULT);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [ready, setReady] = useState(false);

  // Load persisted prefs
  useEffect(() => {
    (async () => {
      try {
        const [themeRaw, fontRaw, lastReadRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.fontSize),
          AsyncStorage.getItem(STORAGE_KEYS.lastRead),
        ]);
        if (themeRaw === "light" || themeRaw === "dark" || themeRaw === "system") {
          setPreference(themeRaw);
        }
        if (fontRaw) {
          const n = parseInt(fontRaw, 10);
          if (!Number.isNaN(n)) setFontSize(n);
        }
        if (lastReadRaw) {
          try {
            setLastRead(JSON.parse(lastReadRaw));
          } catch {}
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const mode: ThemeMode = useMemo(() => {
    if (preference === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return preference;
  }, [preference, systemScheme]);

  const colors = useMemo(() => getColors(mode), [mode]);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      // toggle cycles: system -> opposite explicit -> other explicit -> system
      const next: ThemePreference =
        prev === "system"
          ? mode === "light"
            ? "dark"
            : "light"
          : prev === "light"
          ? "dark"
          : "light";
      AsyncStorage.setItem(STORAGE_KEYS.theme, next).catch(() => {});
      return next;
    });
  }, [mode]);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.min(FONT_SIZE_MAX, prev + FONT_SIZE_STEP);
      AsyncStorage.setItem(STORAGE_KEYS.fontSize, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.max(FONT_SIZE_MIN, prev - FONT_SIZE_STEP);
      AsyncStorage.setItem(STORAGE_KEYS.fontSize, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const saveLastRead = useCallback(async (data: LastRead) => {
    setLastRead(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.lastRead, JSON.stringify(data));
    } catch {}
  }, []);

  const clearLastRead = useCallback(async () => {
    setLastRead(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.lastRead);
    } catch {}
  }, []);

  const value: ThemeContextValue = {
    mode,
    preference,
    colors,
    fontSize,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    lastRead,
    saveLastRead,
    clearLastRead,
    ready,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
};
