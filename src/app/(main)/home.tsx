import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { CourseCard } from '@/components/course/CourseCard';
import { MINI_CARD_WIDTH, MiniCourseCard } from '@/components/course/MiniCourseCard';
import { FONTS, ROUTES } from '@/constants';
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
import { selectDarkMode, setDarkMode } from '@/store/slices/preferences.slice';
import { useTheme } from '@/theme/ThemeContext';
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
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12,
      }}
    >
      <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 16, color: colors.TEXT_PRIMARY }}>
        {title}
      </CustomText>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CustomText style={{ fontFamily: FONTS.MEDIUM, fontSize: 14, color: colors.SECONDARY }}>
            {seeAllLabel} →
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MiniCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: MINI_CARD_WIDTH,
        height: 196,
        borderRadius: 16,
        backgroundColor: colors.GRAY_100,
      }}
    />
  );
}

const keyExtractor = (item: CourseListItem): string => String(item.id);

function HorizontalSeparator() {
  return <View style={{ width: 12 }} />;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector(selectDarkMode);

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

  function handleDarkMode(value: boolean): void {
    dispatch(setDarkMode(value));
  }

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const avatarSource = user?.profileImageUri || user?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  const handleSeeAllBookmarked = useCallback(() => {
    router.push(ROUTES.BOOKMARKS as never);
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
        style={{ width: BOOKMARKED_CARD_WIDTH }}
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.BACKGROUND }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 24,
            backgroundColor: colors.WHITE,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                    borderColor: colors.SECONDARY_LIGHT,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: colors.SECONDARY_LIGHT,
                    borderWidth: 2.5,
                    borderColor: colors.SECONDARY + '55',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CustomText
                    style={{ fontFamily: FONTS.BOLD, fontSize: 21, color: colors.SECONDARY }}
                  >
                    {isGuest ? '👋' : initial}
                  </CustomText>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <CustomText
                style={{ fontSize: 12, color: colors.TEXT_SECONDARY, letterSpacing: 0.2 }}
              >
                {isGuest ? 'Welcome to' : `${getGreeting()},`}
              </CustomText>
              <CustomText
                style={{
                  fontFamily: FONTS.BOLD,
                  fontSize: 20,
                  color: colors.TEXT_PRIMARY,
                  marginTop: 1,
                }}
              >
                {isGuest ? 'HouseOfEdTech' : `${user?.username ?? ''}!`}
              </CustomText>
              <CustomText style={{ fontSize: 12, marginTop: 2, color: colors.TEXT_SECONDARY }}>
                {isGuest ? 'Explore and learn anything.' : 'Ready to continue learning?'}
              </CustomText>
            </View>

            {isGuest ? (
              <View style={{ alignItems: 'center' }}>
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkMode}
                  trackColor={{ false: colors.GRAY_200, true: colors.SECONDARY + 'BB' }}
                  thumbColor={darkMode ? colors.SECONDARY : colors.WHITE}
                  ios_backgroundColor={colors.GRAY_200}
                  style={{ marginBottom: -6 }}
                />
                <CustomText
                  style={{
                    fontSize: 12,
                    marginTop: 0,
                    color: colors.TEXT_SECONDARY,
                    fontFamily: FONTS.MEDIUM,
                  }}
                >
                  {darkMode ? 'Dark' : 'Light'} Mode
                </CustomText>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.GRAY_100,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.TEXT_PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!isGuest && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              borderRadius: 24,
              padding: 20,
              backgroundColor: colors.SECONDARY_LIGHT,
              shadowColor: colors.SECONDARY,
              shadowOpacity: 0.16,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <CustomText
                style={{ fontFamily: FONTS.BOLD, fontSize: 15, color: colors.SECONDARY_DARK }}
              >
                Your Learning Progress
              </CustomText>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 99,
                  backgroundColor: colors.SECONDARY + '25',
                }}
              >
                <CustomText
                  style={{ fontFamily: FONTS.MEDIUM, fontSize: 12, color: colors.SECONDARY }}
                >
                  {completionPct}% done
                </CustomText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              {(
                [
                  {
                    icon: 'book-outline',
                    label: 'Enrolled',
                    value: enrolledCount,
                    color: colors.PRIMARY,
                  },
                  {
                    icon: 'checkmark-circle-outline',
                    label: 'Completed',
                    value: completedCount,
                    color: colors.SUCCESS,
                  },
                  {
                    icon: 'time-outline',
                    label: 'In Progress',
                    value: enrolledCount - completedCount,
                    color: colors.ACCENT,
                  },
                ] as const
              ).map((s, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      backgroundColor: s.color + '22',
                    }}
                  >
                    <Ionicons name={s.icon} size={17} color={s.color} />
                  </View>
                  <CustomText
                    style={{ fontFamily: FONTS.BOLD, fontSize: 19, color: colors.TEXT_PRIMARY }}
                  >
                    {s.value}
                  </CustomText>
                  <CustomText
                    style={{
                      fontSize: 12,
                      textAlign: 'center',
                      marginTop: 2,
                      color: colors.TEXT_SECONDARY,
                    }}
                  >
                    {s.label}
                  </CustomText>
                </View>
              ))}
            </View>

            <View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
              >
                <CustomText
                  style={{ fontFamily: FONTS.MEDIUM, fontSize: 12, color: colors.TEXT_SECONDARY }}
                >
                  Overall completion
                </CustomText>
                <CustomText
                  style={{ fontFamily: FONTS.BOLD, fontSize: 12, color: colors.SECONDARY }}
                >
                  {completionPct}%
                </CustomText>
              </View>
              <View
                style={{
                  width: '100%',
                  borderRadius: 99,
                  overflow: 'hidden',
                  height: 7,
                  backgroundColor: colors.SECONDARY + '2A',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(completionPct, 100)}%`,
                    backgroundColor: colors.SECONDARY,
                    borderRadius: 99,
                  }}
                />
              </View>
            </View>
          </View>
        )}

        {isGuest && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              borderRadius: 24,
              padding: 24,
              backgroundColor: colors.SECONDARY,
              shadowColor: colors.SECONDARY,
              shadowOpacity: 0.28,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <CustomText
              style={{ fontFamily: FONTS.BOLD, fontSize: 22, color: '#FFFFFF', lineHeight: 30 }}
            >
              {'Start your learning\njourney today 🚀'}
            </CustomText>
            <CustomText
              style={{
                fontSize: 14,
                marginTop: 8,
                marginBottom: 24,
                color: 'rgba(255,255,255,0.70)',
                lineHeight: 20,
              }}
            >
              Join thousands of learners worldwide. Track progress, bookmark courses and unlock your
              full potential.
            </CustomText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(ROUTES.REGISTER as never)}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <CustomText
                  style={{ fontFamily: FONTS.BOLD, fontSize: 14, color: colors.SECONDARY }}
                >
                  Sign Up
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(ROUTES.LOGIN as never)}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: 'rgba(255,255,255,0.4)',
                }}
              >
                <CustomText style={{ fontFamily: FONTS.MEDIUM, fontSize: 14, color: '#FFFFFF' }}>
                  Login
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isGuest && continueCourses.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <SectionHeader
              title="Continue Learning"
              onSeeAll={() => router.push(ROUTES.MY_COURSES as never)}
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
          <View style={{ marginTop: 32 }}>
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

        <View style={{ marginTop: 32 }}>
          <SectionHeader
            title={isGuest ? 'Recommended Courses' : 'Recommended for You'}
            onSeeAll={() => router.push(ROUTES.COURSES as never)}
            seeAllLabel="View all"
          />
          {isCoursesLoading && recommendedCourses.length === 0 ? (
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
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
              style={{
                marginHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 16,
                padding: 16,
                backgroundColor: colors.GRAY_100,
                gap: 12,
              }}
            >
              <Ionicons name="checkmark-done-circle-outline" size={26} color={colors.GRAY_400} />
              <CustomText
                style={{ flex: 1, fontSize: 14, color: colors.TEXT_SECONDARY, lineHeight: 20 }}
              >
                {/* {"You're enrolled in all available courses — well done!"} */}
              </CustomText>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            marginTop: 32,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 16,
            padding: 16,
            gap: 14,
            backgroundColor: colors.SECONDARY,
            shadowColor: colors.SECONDARY,
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 5 },
            elevation: 5,
          }}
          onPress={() => router.push(ROUTES.COURSES as never)}
          activeOpacity={0.85}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <Ionicons name="library-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 16, color: '#FFFFFF' }}>
              Browse all courses
            </CustomText>
            <CustomText
              style={{
                fontSize: 12,
                marginTop: 2,
                color: 'rgba(255,255,255,0.68)',
                lineHeight: 17,
              }}
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
