import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CourseCard } from '@/components/course/CourseCard';
import {
  MINI_CARD_WIDTH,
  MiniCourseCard
} from '@/components/course/MiniCourseCard';
import { COLORS, FONTS, ROUTES } from '@/constants';
import { courseDetailRoute } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchAllCourses,
  selectActiveEnrolledCourses,
  selectBookmarkedCoursesData,
  selectCompletedCount,
  selectCompletionPercentage,
  selectEnrolledCount,
  selectIsCoursesLoading,
  selectRecommendedCourses,
} from '@/store/slices/course.slice';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { CourseListItem } from '@/types/course.types';

const CONTINUE_LIMIT = 5;
const RECOMMENDED_LIMIT = 4;
const BOOKMARKED_LIMIT = 3;
const BOOKMARKED_CARD_WIDTH = 260;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

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

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MiniCardSkeleton() {
  return <View style={skeletonStyles.card} />;
}

const keyExtractor = (item: CourseListItem): string => String(item.id);

function HorizontalSeparator() {
  return <View style={sharedStyles.horizontalSeparator} />;
}

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  const { user, isGuest } = useAppSelector((state) => state.auth);
  const enrolledCount = useAppSelector(selectEnrolledCount);
  const completedCount = useAppSelector(selectCompletedCount);
  const completionPct = useAppSelector(selectCompletionPercentage);
  const isCoursesLoading = useAppSelector(selectIsCoursesLoading);
  const activeEnrolled = useAppSelector(selectActiveEnrolledCourses);
  const recommended = useAppSelector(selectRecommendedCourses);
  const bookmarked = useAppSelector(selectBookmarkedCoursesData);

  const continueCourses = useMemo(() => activeEnrolled.slice(0, CONTINUE_LIMIT), [activeEnrolled]);
  const recommendedCourses = useMemo(() => recommended.slice(0, RECOMMENDED_LIMIT), [recommended]);
  const bookmarkedPreview = useMemo(() => bookmarked.slice(0, BOOKMARKED_LIMIT), [bookmarked]);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const displayName = isGuest ? 'Guest' : (user?.username ?? '');
  const greeting = `${getGreeting()}, ${displayName}!`;
  const subtext = isGuest
    ? 'Log in to track your progress and access all features.'
    : enrolledCount > 0
      ? `You have ${enrolledCount} course${enrolledCount !== 1 ? 's' : ''} in progress.`
      : 'Browse the catalog and start your learning journey.';

  const handleSeeAllBookmarked = useCallback(() => {
    router.navigate({
      pathname: ROUTES.COURSES as never,
      params: { section: 'bookmarked' },
    });
  }, []);

  const renderContinueItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <MiniCourseCard
        course={item}
        onPress={() => router.push(courseDetailRoute(item.id) as never)}
      />
    ),
    [],
  );

  const renderRecommendedItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <MiniCourseCard
        course={item}
        onPress={() => router.push(courseDetailRoute(item.id) as never)}
      />
    ),
    [],
  );

  const renderBookmarkedItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <CourseCard
        course={item}
        onPress={() => router.push(courseDetailRoute(item.id) as never)}
        style={bookmarkedStyles.card}
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtext}>{subtext}</Text>
        </View>

        {!isGuest && (
          <View style={styles.statsRow}>
            <StatCard
              icon="book-outline"
              label="Enrolled"
              value={String(enrolledCount)}
              color={COLORS.PRIMARY}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value={String(completedCount)}
              color={COLORS.SUCCESS}
            />
            <StatCard
              icon="stats-chart-outline"
              label="% Done"
              value={`${completionPct}%`}
              color={COLORS.ACCENT}
            />
          </View>
        )}

        {!isGuest && continueCourses.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Continue Learning"
              onSeeAll={() => router.push(ROUTES.COURSES as never)}
            />
            <FlatList
              data={continueCourses}
              keyExtractor={keyExtractor}
              renderItem={renderContinueItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={HorizontalSeparator}
            />
          </View>
        )}

        {bookmarkedPreview.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Bookmarked" onSeeAll={handleSeeAllBookmarked} />
            <FlatList
              data={bookmarkedPreview}
              keyExtractor={keyExtractor}
              renderItem={renderBookmarkedItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={HorizontalSeparator}
            />
          </View>
        )}
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for You"
            onSeeAll={() => router.push(ROUTES.COURSES as never)}
          />

          {isCoursesLoading && recommendedCourses.length === 0 ? (
            <View style={styles.horizontalList}>
              <MiniCardSkeleton />
              <HorizontalSeparator />
              <MiniCardSkeleton />
            </View>
          ) : recommendedCourses.length > 0 ? (
            <FlatList
              data={recommendedCourses}
              keyExtractor={keyExtractor}
              renderItem={renderRecommendedItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={HorizontalSeparator}
            />
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="checkmark-done-circle-outline" size={32} color={COLORS.GRAY_300} />
              <Text style={styles.emptyText}>
                You&apos;re enrolled in all available courses — well done!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push(ROUTES.COURSES as never)}
            activeOpacity={0.85}
          >
            <View style={styles.ctaIconWrap}>
              <Ionicons name="library-outline" size={26} color={COLORS.WHITE} />
            </View>
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>
                {enrolledCount > 0 ? 'Explore more courses' : 'Browse the catalog'}
              </Text>
              <Text style={styles.ctaSubtitle}>
                {enrolledCount > 0
                  ? 'Discover new topics and keep growing.'
                  : 'Find the right course to start your journey.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scroll: {
    paddingBottom: SPACING.XXL,
  },

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

  section: {
    marginTop: SPACING.LG,
    gap: SPACING.SM,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
  },
  sectionTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  seeAll: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
  },
  horizontalList: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XS,
  },

  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.LG,
    gap: SPACING.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: BORDER_RADIUS.MD,
  },
  emptyText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: FONT_SIZES.SM * 1.5,
  },

  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.LG,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    gap: SPACING.MD,
    ...SHADOWS.MD,
  },
  ctaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextWrap: {
    flex: 1,
    gap: 2,
  },
  ctaTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
  ctaSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: FONT_SIZES.XS * 1.5,
  },
});

const sharedStyles = StyleSheet.create({
  horizontalSeparator: {
    width: SPACING.MD,
  },
});

const bookmarkedStyles = StyleSheet.create({
  card: {
    width: BOOKMARKED_CARD_WIDTH,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    width: MINI_CARD_WIDTH,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
});
