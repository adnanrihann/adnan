import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  I18nManager,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../src/contexts/ThemeContext";
import { getSurahById, getNextSurah } from "../../src/data/quranData";
import { toArabicNumerals } from "../../src/utils/arabicNumerals";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LINE_HEIGHT_MULTIPLIER,
  spacing,
} from "../../src/constants/theme";

const SAVE_DEBOUNCE_MS = 400;
const TOP_OFFSET_TRIGGER = 120;

export default function ReadingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahId = parseInt(id || "1", 10);
  const surah = useMemo(() => getSurahById(surahId), [surahId]);
  const nextSurah = useMemo(() => getNextSurah(surahId), [surahId]);

  const {
    colors,
    mode,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    toggleTheme,
    saveLastRead,
    lastRead,
  } = useAppTheme();

  const scrollRef = useRef<ScrollView>(null);
  const versePositionsRef = useRef<Record<number, number>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredScrollRef = useRef(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [saveFlash, setSaveFlash] = useState(false);
  const settingsAnim = useRef(new Animated.Value(0)).current;

  // Animate settings bar
  useEffect(() => {
    Animated.timing(settingsAnim, {
      toValue: settingsOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [settingsOpen, settingsAnim]);

  // Restore scroll position on mount
  useEffect(() => {
    if (
      !hasRestoredScrollRef.current &&
      lastRead &&
      lastRead.surahId === surahId &&
      lastRead.scrollY > 0
    ) {
      const targetY = lastRead.scrollY;
      setCurrentAyah(lastRead.ayahNumber || 1);
      // Delay to wait for layout
      const t = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: targetY, animated: false });
        hasRestoredScrollRef.current = true;
      }, 180);
      return () => clearTimeout(t);
    }
    hasRestoredScrollRef.current = true;
  }, [lastRead, surahId]);

  const handleVerseLayout = useCallback(
    (verseNum: number) => (e: LayoutChangeEvent) => {
      versePositionsRef.current[verseNum] = e.nativeEvent.layout.y;
    },
    []
  );

  const computeCurrentVerse = useCallback((scrollY: number): number => {
    const positions = versePositionsRef.current;
    const entries = Object.entries(positions)
      .map(([k, v]) => [parseInt(k, 10), v] as [number, number])
      .sort((a, b) => a[1] - b[1]);
    let current = entries.length ? entries[0][0] : 1;
    const trigger = scrollY + TOP_OFFSET_TRIGGER;
    for (const [num, pos] of entries) {
      if (pos <= trigger) current = num;
      else break;
    }
    return current;
  }, []);

  const flashSaved = useCallback(() => {
    setSaveFlash(true);
    const t = setTimeout(() => setSaveFlash(false), 900);
    return () => clearTimeout(t);
  }, []);

  const scheduleSave = useCallback(
    (scrollY: number, ayahNumber: number) => {
      if (!surah) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveLastRead({
          surahId: surah.id,
          surahName: surah.name,
          ayahNumber,
          scrollY,
          updatedAt: new Date().toISOString(),
        }).then(() => flashSaved());
      }, SAVE_DEBOUNCE_MS);
    },
    [saveLastRead, surah, flashSaved]
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const verse = computeCurrentVerse(y);
      if (verse !== currentAyah) setCurrentAyah(verse);
      scheduleSave(y, verse);
    },
    [computeCurrentVerse, currentAyah, scheduleSave]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  if (!surah) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.textPrimary, textAlign: "center" }}>
          لم يتم العثور على السورة
        </Text>
      </SafeAreaView>
    );
  }

  const isFatiha = surah.id === 1;
  const settingsTranslate = settingsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 0],
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
      testID="reading-screen"
    >
      {/* Minimal top bar: back + tap-to-reveal settings toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="back-btn"
          style={styles.topIconBtn}
          accessibilityLabel="رجوع"
        >
          <Ionicons
            name={I18nManager.isRTL ? "chevron-forward" : "chevron-back"}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text
            style={[styles.currentAyahLabel, { color: colors.textSecondary }]}
            testID="current-ayah-indicator"
          >
            الآية {toArabicNumerals(currentAyah)} من{" "}
            {toArabicNumerals(surah.ayahsCount)}
          </Text>
          {saveFlash ? (
            <Text
              style={[styles.saveFlashText, { color: colors.accent }]}
              testID="save-flash"
            >
              ✓ تم حفظ الموضع
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => setSettingsOpen((v) => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="settings-toggle-btn"
          style={styles.topIconBtn}
          accessibilityLabel="الإعدادات"
        >
          <Ionicons
            name={settingsOpen ? "close" : "options-outline"}
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Settings Bar (slides down) */}
      {settingsOpen && (
        <Animated.View
          testID="settings-bar"
          style={[
            styles.settingsBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ translateY: settingsTranslate }],
              opacity: settingsAnim,
            },
          ]}
        >
          <View style={styles.settingsGroup}>
            <Text style={[styles.settingsLabel, { color: colors.textSecondary }]}>
              حجم الخط
            </Text>
            <View style={styles.settingsButtons}>
              <TouchableOpacity
                testID="font-decrease-btn"
                disabled={fontSize <= FONT_SIZE_MIN}
                onPress={decreaseFontSize}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: fontSize <= FONT_SIZE_MIN ? 0.4 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.pillBtnText, { color: colors.textPrimary }]}
                >
                  ‎-A
                </Text>
              </TouchableOpacity>
              <View
                style={[
                  styles.fontSizeDisplay,
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.fontSizeValue,
                    { color: colors.textPrimary },
                  ]}
                  testID="font-size-value"
                >
                  {toArabicNumerals(fontSize)}
                </Text>
              </View>
              <TouchableOpacity
                testID="font-increase-btn"
                disabled={fontSize >= FONT_SIZE_MAX}
                onPress={increaseFontSize}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: fontSize >= FONT_SIZE_MAX ? 0.4 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.pillBtnText, { color: colors.textPrimary }]}
                >
                  ‎+A
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[styles.settingsDivider, { backgroundColor: colors.border }]}
          />

          <TouchableOpacity
            testID="theme-toggle-btn"
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={mode === "dark" ? "sunny-outline" : "moon-outline"}
              size={18}
              color={colors.textPrimary}
              style={{ marginLeft: 6 }}
            />
            <Text
              style={[styles.themeToggleText, { color: colors.textPrimary }]}
            >
              {mode === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl * 2 },
        ]}
        onScroll={onScroll}
        scrollEventThrottle={120}
        showsVerticalScrollIndicator={false}
        testID="quran-scroll"
      >
        {/* Surah header */}
        <View style={styles.surahHeader}>
          <View
            style={[
              styles.surahHeaderBorder,
              { borderColor: colors.accent },
            ]}
          >
            <Text
              style={[styles.surahHeaderName, { color: colors.textPrimary }]}
              testID="surah-header-name"
            >
              سورة {surah.name}
            </Text>
            <Text
              style={[
                styles.surahHeaderMeta,
                { color: colors.textSecondary },
              ]}
            >
              {surah.revelationType} · عدد الآيات {toArabicNumerals(surah.ayahsCount)}
            </Text>
          </View>
        </View>

        {/* Basmalah (hidden in Al-Fatiha because it's already ayah 1) */}
        {!isFatiha && (
          <Text
            style={[
              styles.basmalah,
              {
                color: colors.textPrimary,
                fontSize: Math.max(fontSize - 4, FONT_SIZE_MIN),
              },
            ]}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        )}

        {/* Quran text container */}
        <View
          style={styles.quranTextContainer}
          testID="quran-text-container"
        >
          {surah.ayahs.map((ayah) => (
            <View
              key={ayah.number}
              onLayout={handleVerseLayout(ayah.number)}
              testID={`ayah-${surah.id}-${ayah.number}`}
              style={styles.ayahBlock}
            >
              <Text
                style={[
                  styles.quranText,
                  {
                    color: colors.textPrimary,
                    fontSize,
                    lineHeight: fontSize * LINE_HEIGHT_MULTIPLIER,
                  },
                ]}
                selectable
              >
                {ayah.text}
                <Text
                  style={[
                    styles.verseNumber,
                    {
                      color: colors.accent,
                      fontSize: Math.max(fontSize - 4, 18),
                    },
                  ]}
                >
                  {" "}۝{toArabicNumerals(ayah.number)}{" "}
                </Text>
              </Text>
            </View>
          ))}
        </View>

        {/* End of surah */}
        <View style={styles.endOfSurah}>
          <View
            style={[styles.endOrnament, { backgroundColor: colors.border }]}
          />
          <Text
            style={[styles.endText, { color: colors.textSecondary }]}
            testID="end-of-surah-text"
          >
            ﴾ صدق الله العظيم ﴿
          </Text>
          <View
            style={[styles.endOrnament, { backgroundColor: colors.border }]}
          />
        </View>

        {nextSurah ? (
          <TouchableOpacity
            testID="next-surah-btn"
            activeOpacity={0.8}
            onPress={() =>
              router.replace(`/reading/${nextSurah.id}` as any)
            }
            style={[
              styles.nextSurahBtn,
              { borderColor: colors.accent, backgroundColor: colors.accentSoft },
            ]}
          >
            <Ionicons
              name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
              size={18}
              color={colors.accent}
            />
            <Text
              style={[styles.nextSurahText, { color: colors.textPrimary }]}
            >
              السورة التالية · {nextSurah.name}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="back-to-index-btn"
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[
              styles.nextSurahBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.nextSurahText, { color: colors.textPrimary }]}
            >
              العودة إلى الفهرس
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  currentAyahLabel: {
    fontSize: 13,
    textAlign: "center",
  },
  saveFlashText: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  settingsBar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsGroup: {
    alignItems: "flex-end",
  },
  settingsLabel: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: "right",
    writingDirection: "rtl",
  },
  settingsButtons: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  pillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  pillBtnText: {
    fontSize: 18,
    fontWeight: "600",
  },
  fontSizeDisplay: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 42,
    alignItems: "center",
  },
  fontSizeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  settingsDivider: {
    width: 1,
    height: 36,
    marginHorizontal: spacing.md,
  },
  themeToggle: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  surahHeader: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  surahHeaderBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  surahHeaderName: {
    fontFamily: "ScheherazadeNew_700Bold",
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
  },
  surahHeaderMeta: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  basmalah: {
    fontFamily: "ScheherazadeNew_700Bold",
    textAlign: "center",
    marginBottom: spacing.lg,
    writingDirection: "rtl",
  },
  quranTextContainer: {
    paddingHorizontal: spacing.xs,
  },
  ayahBlock: {
    marginBottom: 0,
  },
  quranText: {
    fontFamily: "ScheherazadeNew_400Regular",
    textAlign: "right",
    writingDirection: "rtl",
  },
  verseNumber: {
    fontFamily: "ScheherazadeNew_700Bold",
  },
  endOfSurah: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  endOrnament: {
    flex: 1,
    height: 1,
  },
  endText: {
    fontFamily: "ScheherazadeNew_400Regular",
    fontSize: 18,
    textAlign: "center",
  },
  nextSurahBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  nextSurahText: {
    fontFamily: "ScheherazadeNew_700Bold",
    fontSize: 18,
  },
});
