import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useAppSelector } from '@/store';

// ─── Greeting helper ─────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user, isGuest } = useAppSelector((state) => state.auth);

  const displayName = isGuest ? 'Guest' : (user?.username ?? '');
  const greeting = `${getGreeting()}, ${displayName}!`;
  const subtext = isGuest
    ? 'Log in to track your progress and access all features.'
    : 'Ready to continue learning?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtext}>{subtext}</Text>
        </View>

        {/* ── Stats row ───────────────────────────────────────────────── */}
        {!isGuest && (
          <View style={styles.statsRow}>
            <StatCard
              icon="book-outline"
              label="Enrolled"
              value="0"
              color={COLORS.PRIMARY}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value="0"
              color={COLORS.SUCCESS}
            />
            <StatCard
              icon="time-outline"
              label="Hours"
              value="0"
              color={COLORS.ACCENT}
            />
          </View>
        )}

        {/* ── Placeholder content ─────────────────────────────────────── */}
        <View style={styles.placeholderSection}>
          <View style={styles.placeholderCard}>
            <Ionicons name="school-outline" size={40} color={COLORS.GRAY_300} />
            <Text style={styles.placeholderTitle}>Courses coming soon</Text>
            <Text style={styles.placeholderText}>
              Browse and enroll in courses to start your learning journey.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scroll: {
    paddingBottom: SPACING.XXL,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: SPACING.XS,
  },
  greeting: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
  },
  subtext: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    gap: SPACING.SM,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: SPACING.MD,
    alignItems: 'center',
    gap: SPACING.XS,
    ...SHADOWS.SM,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },

  // ── Placeholder ─────────────────────────────────────────────────────────────
  placeholderSection: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
  },
  placeholderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: SPACING.XL,
    alignItems: 'center',
    gap: SPACING.SM,
    ...SHADOWS.SM,
  },
  placeholderTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
  },
  placeholderText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: FONT_SIZES.SM * 1.6,
  },
});
