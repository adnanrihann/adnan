import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../src/contexts/ThemeContext";
import { surahs } from "../src/data/quranData";
import { toArabicNumerals } from "../src/utils/arabicNumerals";
import { spacing } from "../src/constants/theme";

export default function IndexScreen() {
  const router = useRouter();
  const { colors, mode, lastRead, toggleTheme } = useAppTheme();

  const openSurah = (id: number) => {
    router.push(`/reading/${id}` as any);
  };

  const continueReading = () => {
    if (lastRead) {
      router.push(`/reading/${lastRead.surahId}` as any);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
      testID="index-screen"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text
            style={[styles.appTitle, { color: colors.textPrimary }]}
            testID="app-title"
          >
            القرآن المبسط
          </Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            اقرأ بهدوء، بلا تشتيت
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.themeChip,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          testID="theme-toggle-btn-index"
          accessibilityLabel="تبديل الوضع"
        >
          <Ionicons
            name={mode === "dark" ? "sunny-outline" : "moon-outline"}
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Continue Reading Card */}
      {lastRead ? (
        <TouchableOpacity
          testID="continue-reading-btn"
          activeOpacity={0.85}
          onPress={continueReading}
          style={[
            styles.continueCard,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
            },
          ]}
        >
          <View style={styles.continueRow}>
            <View style={styles.continueTextBlock}>
              <Text
                style={[styles.continueLabel, { color: colors.textSecondary }]}
              >
                إكمال القراءة
              </Text>
              <Text
                style={[styles.continueTitle, { color: colors.textPrimary }]}
                testID="continue-reading-surah-name"
              >
                سورة {lastRead.surahName}
              </Text>
              <Text
                style={[styles.continueMeta, { color: colors.textSecondary }]}
              >
                الآية {toArabicNumerals(lastRead.ayahNumber)}
              </Text>
            </View>
            <View
              style={[
                styles.continueIconCircle,
                { backgroundColor: colors.accent },
              ]}
            >
              <Ionicons
                name={
                  I18nManager.isRTL ? "chevron-back" : "chevron-forward"
                }
                size={22}
                color="#FFFFFF"
              />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.emptyContinue,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          testID="empty-continue-placeholder"
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={colors.textSecondary}
            style={{ marginLeft: spacing.sm }}
          />
          <Text
            style={[styles.emptyContinueText, { color: colors.textSecondary }]}
          >
            ابدأ بقراءة أي سورة لحفظ موضعك تلقائياً
          </Text>
        </View>
      )}

      {/* Section label */}
      <View style={styles.sectionLabelRow}>
        <Text
          style={[styles.sectionLabel, { color: colors.textSecondary }]}
        >
          فهرس السور
        </Text>
        <View
          style={[styles.sectionDivider, { backgroundColor: colors.border }]}
        />
      </View>

      {/* Surah List */}
      <FlatList
        data={surahs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`surah-item-${item.id}`}
            activeOpacity={0.7}
            onPress={() => openSurah(item.id)}
            style={[
              styles.surahRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.surahBadge,
                { borderColor: colors.accent },
              ]}
            >
              <Text
                style={[styles.surahBadgeText, { color: colors.accent }]}
              >
                {toArabicNumerals(item.id)}
              </Text>
            </View>
            <View style={styles.surahTextBlock}>
              <Text
                style={[styles.surahName, { color: colors.textPrimary }]}
                testID={`surah-name-${item.id}`}
              >
                {item.name}
              </Text>
              <Text
                style={[styles.surahMeta, { color: colors.textSecondary }]}
              >
                {item.revelationType} · {toArabicNumerals(item.ayahsCount)} آيات
              </Text>
            </View>
            <Ionicons
              name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  appTitle: {
    fontFamily: "ScheherazadeNew_700Bold",
    fontSize: 34,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: "right",
    writingDirection: "rtl",
  },
  themeChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: spacing.md,
  },
  continueCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
  },
  continueRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  continueLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: "right",
    writingDirection: "rtl",
  },
  continueTitle: {
    fontFamily: "ScheherazadeNew_700Bold",
    fontSize: 26,
    lineHeight: 38,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  continueMeta: {
    fontSize: 14,
    marginTop: 2,
    textAlign: "right",
    writingDirection: "rtl",
  },
  continueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  emptyContinue: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContinueText: {
    fontSize: 14,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionLabelRow: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    letterSpacing: 1,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  surahRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  surahBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  surahBadgeText: {
    fontFamily: "ScheherazadeNew_700Bold",
    fontSize: 18,
  },
  surahTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  surahName: {
    fontFamily: "ScheherazadeNew_700Bold",
    fontSize: 24,
    lineHeight: 32,
    textAlign: "right",
    writingDirection: "rtl",
  },
  surahMeta: {
    fontSize: 12,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
});
