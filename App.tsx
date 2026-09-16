import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUBJECTS, Subject, average, passCount, topThree } from './data/subjects';
import { useTheme, ThemeProvider } from './theme/useTheme';

// Step 0 Seeded parameters for MSSV 1923050973 (N = 73)
// Card corner radius = 4 + (73 mod 16) = 13
const CARD_CORNER_RADIUS = 13;
// Base phone grid columns = 2 + (73 mod 2) = 3
const BASE_PHONE_COLUMNS = 3;

function MainScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Responsive grid columns: phone = 3, wide/landscape = 4 (one more column)
  const isWide = width >= 600;
  const numColumns = isWide ? BASE_PHONE_COLUMNS + 1 : BASE_PHONE_COLUMNS;

  // Grid layout calculations (tile size computed dynamically, no hardcoded widths)
  const containerPadding = 12;
  const gridGap = 10;
  const totalGaps = (numColumns - 1) * gridGap;
  const availableWidth = width - containerPadding * 2 - insets.left - insets.right;
  const cardWidth = Math.floor((availableWidth - totalGaps) / numColumns);

  // Stats from pure functions
  const avgScore = average(SUBJECTS);
  const totalPassed = passCount(SUBJECTS);
  const bestSubjects = topThree(SUBJECTS);

  const getStatusBadge = (status: Subject['status']) => {
    switch (status) {
      case 'passed':
        return { bg: colors.badgePassed, text: colors.badgePassedText, label: 'Đạt' };
      case 'failed':
        return { bg: colors.badgeFailed, text: colors.badgeFailedText, label: 'Rớt' };
      default:
        return { bg: colors.badgeOther, text: colors.badgeOtherText, label: status };
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.headerText }]} numberOfLines={1}>
              Bùi Thanh Sơn — 1923050973
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>
              Lab 03: Themed & Responsive Grid ({numColumns} cột)
            </Text>
          </View>
          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.themeToggleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.themeToggleText, { color: colors.text }]}>
              {isDark ? '☀️ Sáng' : '🌙 Tối'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* BODY: Responsive Grid of Cards - flex: 1 takes leftover space */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { padding: containerPadding }]}
        accessibilityRole="scrollbar"
        accessibilityLabel="Danh sách môn học dạng lưới"
      >
        <View style={[styles.gridContainer, { gap: gridGap }]}>
          {SUBJECTS.map((item) => {
            const isSelected = selectedCode === item.code;
            const badge = getStatusBadge(item.status);

            return (
              <Pressable
                key={item.code}
                accessibilityRole="button"
                accessibilityLabel={`Môn ${item.name}, mã ${item.code}, số tín chỉ ${item.credits}, điểm số ${item.score}, kết quả ${badge.label}`}
                accessibilityHint="Nhấn để chọn hoặc xem chi tiết môn học này"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setSelectedCode(isSelected ? null : item.code)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    width: cardWidth,
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    borderRadius: CARD_CORNER_RADIUS,
                    opacity: pressed ? 0.75 : 1.0,
                    transform: [{ scale: pressed ? 0.97 : 1.0 }],
                  },
                ]}
              >
                {/* Subject Code Header */}
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardCode, { color: colors.accent }]} numberOfLines={1}>
                    {item.code}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Subject Name */}
                <Text
                  style={[styles.cardName, { color: colors.text }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>

                {/* Details Footer */}
                <View style={styles.cardFooterRow}>
                  <Text style={[styles.cardCredits, { color: colors.muted }]}>
                    {item.credits} TC
                  </Text>
                  <Text style={[styles.cardScore, { color: colors.text }]}>
                    {item.score.toFixed(1)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* SUMMARY FOOTER: Pinned to bottom */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.footerBg,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.footerRow}>
          <View style={styles.footerCol}>
            <Text style={[styles.footerLabel, { color: colors.muted }]}>Tổng môn</Text>
            <Text style={[styles.footerVal, { color: colors.text }]}>{SUBJECTS.length}</Text>
          </View>
          <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
          <View style={styles.footerCol}>
            <Text style={[styles.footerLabel, { color: colors.muted }]}>Đạt</Text>
            <Text style={[styles.footerVal, { color: colors.accent }]}>
              {totalPassed} / {SUBJECTS.length}
            </Text>
          </View>
          <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
          <View style={styles.footerCol}>
            <Text style={[styles.footerLabel, { color: colors.muted }]}>ĐTB Tín chỉ</Text>
            <Text style={[styles.footerVal, { color: colors.text }]}>{avgScore}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
    marginTop: 2,
  },
  themeToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1, // Recipe 1: takes all leftover space between fixed header and footer
  },
  bodyContent: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    minHeight: 120,
    padding: 10,
    justifyContent: 'space-between',
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cardCode: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginVertical: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardCredits: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerCol: {
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerVal: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  footerDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },
});
