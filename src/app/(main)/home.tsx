import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { CourseCard } from '@/components/course/CourseCard';
import { MINI_CARD_WIDTH, MiniCourseCard } from '@/components/course/MiniCourseCard';
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

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

function SectionHeader({ title, onSeeAll, seeAllLabel = 'See all' }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 mb-3">
      <CustomText
        className="text-base"
        style={{ fontFamily: FONTS.BOLD, color: COLORS.TEXT_PRIMARY }}
      >
        {title}
      </CustomText>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CustomText
            className="text-sm"
            style={{ fontFamily: FONTS.MEDIUM, color: COLORS.SECONDARY }}
          >
            {seeAllLabel} →
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MiniCardSkeleton() {
  return (
    <View
      style={{
        width: MINI_CARD_WIDTH,
        height: 196,
        borderRadius: 16,
        backgroundColor: COLORS.GRAY_100,
      }}
    />
  );
}

const keyExtractor = (item: CourseListItem): string => String(item.id);

function HorizontalSeparator() {
  return <View style={{ width: 12 }} />;
}

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  const { user, isGuest } = useAppSelector((state) => state.auth);
  const enrolledCount    = useAppSelector(selectEnrolledCount);
  const completedCount   = useAppSelector(selectCompletedCount);
  const completionPct    = useAppSelector(selectCompletionPercentage);
  const isCoursesLoading = useAppSelector(selectIsCoursesLoading);
  const activeEnrolled   = useAppSelector(selectActiveEnrolledCourses);
  const recommended      = useAppSelector(selectRecommendedCourses);
  const bookmarked       = useAppSelector(selectBookmarkedCoursesData);

  const continueCourses    = useMemo(() => activeEnrolled.slice(0, CONTINUE_LIMIT),    [activeEnrolled]);
  const recommendedCourses = useMemo(() => recommended.slice(0, RECOMMENDED_LIMIT),    [recommended]);
  const bookmarkedPreview  = useMemo(() => bookmarked.slice(0, BOOKMARKED_LIMIT),       [bookmarked]);

  useEffect(() => { dispatch(fetchAllCourses()); }, [dispatch]);

  const avatarSource = user?.profileImageUri || user?.avatarUrl;
  const initial      = user?.username?.[0]?.toUpperCase() ?? '?';

  const handleSeeAllBookmarked = useCallback(() => {
    router.navigate({ pathname: ROUTES.COURSES as never, params: { section: 'bookmarked' } });
  }, []);

  const renderContinueItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <MiniCourseCard course={item} onPress={() => router.push(courseDetailRoute(item.id) as never)} />
    ), [],
  );

  const renderRecommendedItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <MiniCourseCard course={item} onPress={() => router.push(courseDetailRoute(item.id) as never)} />
    ), [],
  );

  const renderBookmarkedItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <CourseCard
        course={item}
        onPress={() => router.push(courseDetailRoute(item.id) as never)}
        style={{ width: BOOKMARKED_CARD_WIDTH }}
      />
    ), [],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.BACKGROUND }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-5 pt-5 pb-6" style={{ backgroundColor: COLORS.WHITE }}>
          <View className="flex-row items-center">

            <TouchableOpacity
              onPress={() => !isGuest && router.push(ROUTES.PROFILE as never)}
              activeOpacity={isGuest ? 1 : 0.85}
              style={{ marginRight: 14 }}
            >
              {!isGuest && avatarSource ? (
                <Image
                  source={{ uri: avatarSource }}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    borderWidth: 2.5,
                    borderColor: COLORS.SECONDARY_LIGHT,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: COLORS.SECONDARY_LIGHT,
                    borderWidth: 2.5,
                    borderColor: COLORS.SECONDARY + '55',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CustomText
                    style={{ fontFamily: FONTS.BOLD, fontSize: 21, color: COLORS.SECONDARY }}
                  >
                    {isGuest ? '👋' : initial}
                  </CustomText>
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-1">
              <CustomText
                className="text-xs"
                style={{ color: COLORS.TEXT_SECONDARY, letterSpacing: 0.2 }}
              >
                {isGuest ? 'Welcome to' : `${getGreeting()},`}
              </CustomText>
              <CustomText
                style={{ fontFamily: FONTS.BOLD, fontSize: 20, color: COLORS.TEXT_PRIMARY, marginTop: 1 }}
              >
                {isGuest ? 'HouseOfEdTech' : `${user?.username ?? ''}!`}
              </CustomText>
              <CustomText
                className="text-xs mt-0.5"
                style={{ color: COLORS.TEXT_SECONDARY }}
              >
                {isGuest ? 'Explore and learn anything.' : 'Ready to continue learning?'}
              </CustomText>
            </View>

            {!isGuest && (
              <TouchableOpacity
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: COLORS.GRAY_100 }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!isGuest && (
          <View
            className="mx-5 mt-5 rounded-3xl p-5"
            style={{
              backgroundColor: COLORS.SECONDARY_LIGHT,
              shadowColor: COLORS.SECONDARY,
              shadowOpacity: 0.16,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <CustomText
                style={{ fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.SECONDARY_DARK }}
              >
                Your Learning Progress
              </CustomText>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: COLORS.SECONDARY + '25' }}
              >
                <CustomText
                  className="text-xs"
                  style={{ fontFamily: FONTS.MEDIUM, color: COLORS.SECONDARY }}
                >
                  {completionPct}% done
                </CustomText>
              </View>
            </View>

            <View className="flex-row mb-5">
              {([
                { icon: 'book-outline',             label: 'Enrolled',    value: enrolledCount,                   color: COLORS.PRIMARY  },
                { icon: 'checkmark-circle-outline', label: 'Completed',   value: completedCount,                  color: COLORS.SUCCESS  },
                { icon: 'time-outline',             label: 'In Progress', value: enrolledCount - completedCount,  color: COLORS.ACCENT   },
              ] as const).map((s, i) => (
                <View key={i} className="flex-1 items-center">
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mb-2"
                    style={{ backgroundColor: s.color + '22' }}
                  >
                    <Ionicons name={s.icon} size={17} color={s.color} />
                  </View>
                  <CustomText
                    style={{ fontFamily: FONTS.BOLD, fontSize: 19, color: COLORS.TEXT_PRIMARY }}
                  >
                    {s.value}
                  </CustomText>
                  <CustomText
                    className="text-xs text-center mt-0.5"
                    style={{ color: COLORS.TEXT_SECONDARY }}
                  >
                    {s.label}
                  </CustomText>
                </View>
              ))}
            </View>

            <View>
              <View className="flex-row justify-between mb-1.5">
                <CustomText
                  className="text-xs"
                  style={{ fontFamily: FONTS.MEDIUM, color: COLORS.TEXT_SECONDARY }}
                >
                  Overall completion
                </CustomText>
                <CustomText
                  className="text-xs"
                  style={{ fontFamily: FONTS.BOLD, color: COLORS.SECONDARY }}
                >
                  {completionPct}%
                </CustomText>
              </View>
              <View
                className="w-full rounded-full overflow-hidden"
                style={{ height: 7, backgroundColor: COLORS.SECONDARY + '2A' }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(completionPct, 100)}%`,
                    backgroundColor: COLORS.SECONDARY,
                    borderRadius: 99,
                  }}
                />
              </View>
            </View>
          </View>
        )}

        {isGuest && (
          <View
            className="mx-5 mt-5 rounded-3xl p-6"
            style={{
              backgroundColor: COLORS.SECONDARY,
              shadowColor: COLORS.SECONDARY,
              shadowOpacity: 0.28,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <CustomText
              style={{ fontFamily: FONTS.BOLD, fontSize: 22, color: COLORS.WHITE, lineHeight: 30 }}
            >
              {'Start your learning\njourney today 🚀'}
            </CustomText>
            <CustomText
              className="text-sm mt-2 mb-6"
              style={{ color: 'rgba(255,255,255,0.70)', lineHeight: 20 }}
            >
              Join thousands of learners worldwide. Track progress, bookmark courses and unlock your full potential.
            </CustomText>
            <View className="flex-row" style={{ gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(ROUTES.REGISTER as never)}
                className="flex-1 rounded-2xl py-3.5 items-center"
                style={{ backgroundColor: COLORS.WHITE }}
              >
                <CustomText
                  className="text-sm"
                  style={{ fontFamily: FONTS.BOLD, color: COLORS.SECONDARY }}
                >
                  Sign Up
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(ROUTES.LOGIN as never)}
                className="flex-1 rounded-2xl py-3.5 items-center"
                style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' }}
              >
                <CustomText
                  className="text-sm"
                  style={{ fontFamily: FONTS.MEDIUM, color: COLORS.WHITE }}
                >
                  Login
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!isGuest && continueCourses.length > 0 && (
          <View className="mt-8">
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
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
              ItemSeparatorComponent={HorizontalSeparator}
            />
          </View>
        )}

        {bookmarkedPreview.length > 0 && (
          <View className="mt-8">
            <SectionHeader title="Bookmarked" onSeeAll={handleSeeAllBookmarked} />
            <FlatList
              data={bookmarkedPreview}
              keyExtractor={keyExtractor}
              renderItem={renderBookmarkedItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
              ItemSeparatorComponent={HorizontalSeparator}
            />
          </View>
        )}

  
        <View className="mt-8">
          <SectionHeader
            title={isGuest ? 'Recommended Courses' : 'Recommended for You'}
            onSeeAll={() => router.push(ROUTES.COURSES as never)}
            seeAllLabel="View all"
          />
          {isCoursesLoading && recommendedCourses.length === 0 ? (
            <View className="flex-row" style={{ paddingHorizontal: 20, gap: 12 }}>
              <MiniCardSkeleton />
              <MiniCardSkeleton />
            </View>
          ) : recommendedCourses.length > 0 ? (
            <FlatList
              data={recommendedCourses}
              keyExtractor={keyExtractor}
              renderItem={renderRecommendedItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
              ItemSeparatorComponent={HorizontalSeparator}
            />
          ) : (
            <View
              className="mx-5 flex-row items-center rounded-2xl p-4"
              style={{ backgroundColor: COLORS.GRAY_100, gap: 12 }}
            >
              <Ionicons name="checkmark-done-circle-outline" size={26} color={COLORS.GRAY_400} />
              <CustomText
                className="flex-1 text-sm"
                style={{ color: COLORS.TEXT_SECONDARY, lineHeight: 20 }}
              >
                You're enrolled in all available courses — well done!
              </CustomText>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="mx-5 mt-8 flex-row items-center rounded-2xl p-4"
          style={{
            backgroundColor: COLORS.PRIMARY,
            gap: 14,
            shadowColor: COLORS.PRIMARY,
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 5 },
            elevation: 5,
          }}
          onPress={() => router.push(ROUTES.COURSES as never)}
          activeOpacity={0.85}
        >
          <View
            className="w-11 h-11 rounded-xl items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          >
            <Ionicons name="library-outline" size={22} color={COLORS.WHITE} />
          </View>
          <View className="flex-1">
            <CustomText
              className="text-base"
              style={{ fontFamily: FONTS.BOLD, color: COLORS.WHITE }}
            >
              Browse all courses
            </CustomText>
            <CustomText
              className="text-xs mt-0.5"
              style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 17 }}
            >
              {enrolledCount > 0
                ? 'Discover new topics and keep growing.'
                : 'Find the right course to start your journey.'}
            </CustomText>
          </View>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
