import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import { courseDetailRoute } from '@/constants/routes';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { AppError } from '@/services/api/error-handler';
import { handleApiError } from '@/services/api/error-handler';
import { courseService } from '@/services/api/modules/course.service';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchAllCourses,
  selectBookmarkedCoursesData,
  selectEnrolledCoursesData,
} from '@/store/slices/course.slice';
import { CourseCard } from '@/components/course/CourseCard';
import { FilterBar } from '@/components/course/FilterBar';
import { MiniCourseCard } from '@/components/course/MiniCourseCard';
import type { CourseListItem, SortOption } from '@/types/course.types';


const PAGE_SIZE = 10;

type LoadMode = 'initial' | 'refresh' | 'more';

function sortToApiParams(
  sort: SortOption | null,
): { sortBy?: string; sortType?: 'asc' | 'desc' } {
  if (!sort) return {};
  switch (sort) {
    case 'az':         return { sortBy: 'title', sortType: 'asc' };
    case 'za':         return { sortBy: 'title', sortType: 'desc' };
    case 'price-asc':  return { sortBy: 'price', sortType: 'asc' };
    case 'price-desc': return { sortBy: 'price', sortType: 'desc' };
  }
}


const keyExtractor = (item: CourseListItem): string => String(item.id);

function FooterLoader({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <View style={footerStyles.container}>
      <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      <Text style={footerStyles.text}>Loading more…</Text>
    </View>
  );
}

function RefreshErrorBanner({
  error,
  onRetry,
}: {
  error: AppError;
  onRetry: () => void;
}) {
  const isOffline = error.isNetworkError || error.isTimeout;

  return (
    <View style={[bannerStyles.banner, isOffline ? bannerStyles.offline : bannerStyles.error]}>
      <Ionicons
        name={isOffline ? 'wifi-outline' : 'warning-outline'}
        size={15}
        color={isOffline ? COLORS.WARNING : COLORS.ERROR}
        style={bannerStyles.icon}
      />
      <Text style={bannerStyles.text} numberOfLines={2}>
        {isOffline
          ? "You're offline — showing cached content."
          : `Couldn't refresh: ${error.message}`}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={bannerStyles.retry}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
function EmptyState({ isSearching }: { isSearching: boolean }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={isSearching ? 'search-outline' : 'school-outline'}
        size={52}
        color={COLORS.GRAY_300}
      />
      <Text style={styles.emptyTitle}>
        {isSearching ? 'No results found' : 'No courses available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isSearching
          ? 'Try a different search term or remove filters.'
          : 'Pull down to refresh and try again.'}
      </Text>
    </View>
  );
}


interface MyCourseStripProps {
  courses: CourseListItem[];
  onPressCourse: (courseId: number) => void;
}

function MyCourseStrip({ courses, onPressCourse }: MyCourseStripProps) {
  return (
    <View style={myCoursesStyles.section}>
      <View style={myCoursesStyles.header}>
        <Text style={myCoursesStyles.title}>My Courses</Text>
        <View style={myCoursesStyles.countBadge}>
          <Text style={myCoursesStyles.countText}>{courses.length}</Text>
        </View>
      </View>
      <FlatList
        data={courses}
        keyExtractor={(item) => `enrolled-${item.id}`}
        renderItem={({ item }) => (
          <MiniCourseCard
            course={item}
            onPress={() => onPressCourse(item.id)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={myCoursesStyles.list}
        ItemSeparatorComponent={HorizontalSeparator}
        scrollEnabled
      />
    </View>
  );
}


const BOOKMARKED_CARD_WIDTH = 260;

function HorizontalSeparator() {
  return <View style={sharedStyles.horizontalSeparator} />;
}

interface BookmarkedStripProps {
  courses: CourseListItem[];
  onPressCourse: (courseId: number) => void;
}

function BookmarkedStrip({ courses, onPressCourse }: BookmarkedStripProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <CourseCard
        course={item}
        onPress={() => onPressCourse(item.id)}
        style={bookmarkedStyles.card}
      />
    ),
    [onPressCourse],
  );

  return (
    <View style={bookmarkedStyles.section}>
      <View style={bookmarkedStyles.header}>
        <Text style={bookmarkedStyles.title}>Bookmarked</Text>
        <View style={bookmarkedStyles.countBadge}>
          <Text style={bookmarkedStyles.countText}>{courses.length}</Text>
        </View>
      </View>
      <FlatList
        data={courses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={bookmarkedStyles.list}
        ItemSeparatorComponent={HorizontalSeparator}
      />
    </View>
  );
}

interface CoursesListHeaderProps {
  enrolledCourses: CourseListItem[];
  bookmarkedCourses: CourseListItem[];
  searchQuery: string;
  displayedCount: number;
  isRefreshError: boolean;
  fetchError: AppError | null;
  onRetry: () => void;
  onPressCourse: (courseId: number) => void;
  onBookmarkedLayout?: (y: number) => void;
}

function CoursesListHeader({
  enrolledCourses,
  bookmarkedCourses,
  searchQuery,
  displayedCount,
  isRefreshError,
  fetchError,
  onRetry,
  onPressCourse,
  onBookmarkedLayout,
}: CoursesListHeaderProps) {
  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      {isRefreshError && fetchError && (
        <RefreshErrorBanner error={fetchError} onRetry={onRetry} />
      )}

      {bookmarkedCourses.length > 0 && !isSearching && (
        <View onLayout={(e) => onBookmarkedLayout?.(e.nativeEvent.layout.y)}>
          <BookmarkedStrip courses={bookmarkedCourses} onPressCourse={onPressCourse} />
        </View>
      )}

      <View style={myCoursesStyles.allCoursesRow}>
        <Text style={myCoursesStyles.allCoursesTitle}>
          {isSearching ? 'Results' : 'All Courses'}
        </Text>
        <Text style={myCoursesStyles.allCoursesCount}>{displayedCount}</Text>
      </View>
    </>
  );
}


export default function CourseListScreen() {
  const dispatch = useAppDispatch();

  const { section } = useLocalSearchParams<{ section?: string }>();

  const flatListRef    = useRef<FlatList<CourseListItem>>(null);
  const bookmarkedYRef = useRef<number | null>(null);

  const enrolledCourses   = useAppSelector(selectEnrolledCoursesData);
  const bookmarkedCourses = useAppSelector(selectBookmarkedCoursesData);

  const [courses, setCourses]         = useState<CourseListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems]   = useState(0);
  const [hasMore, setHasMore]         = useState(false);
  const [loadMode, setLoadMode]       = useState<LoadMode | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption]   = useState<SortOption | null>(null);

  const [fetchError, setFetchError]         = useState<AppError | null>(null);
  const [isRefreshError, setIsRefreshError] = useState(false);

  const isInitialLoading = loadMode === 'initial' && courses.length === 0;
  const isLoadingMore    = loadMode === 'more';

  const handleBookmarkedLayout = useCallback((y: number) => {
    bookmarkedYRef.current = y;
  }, []);

  useEffect(() => {
    if (section !== 'bookmarked') return;

    const timer = setTimeout(() => {
      if (bookmarkedYRef.current !== null) {
        flatListRef.current?.scrollToOffset({
          offset: bookmarkedYRef.current,
          animated: true,
        });
      }
      router.setParams({ section: undefined });
    }, 150);

    return () => clearTimeout(timer);
  }, [section]);

  const loadPage = useCallback(async (
    pageNum: number,
    opts: { search: string; sort: SortOption | null; mode: LoadMode },
  ) => {
    setLoadMode(opts.mode);
    setFetchError(null);
    if (opts.mode === 'refresh') setIsRefreshError(false);

    try {
      const result = await courseService.getCoursesPage({
        page:  pageNum,
        limit: PAGE_SIZE,
        ...(opts.search.trim() && { query: opts.search.trim() }),
        ...sortToApiParams(opts.sort),
      });

      if (opts.mode === 'more') {
        setCourses((prev) => [...prev, ...result.courses]);
      } else {
        setCourses(result.courses);
      }

      setCurrentPage(result.page);
      setHasMore(result.hasNextPage);
      setTotalItems(result.totalItems);
    } catch (err) {
      const appError = handleApiError(err);
      if (opts.mode !== 'more') {
        setFetchError(appError);
        if (opts.mode === 'refresh') setIsRefreshError(true);
      }
    } finally {
      setLoadMode(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  useEffect(() => {
    loadPage(1, { search: searchQuery, sort: sortOption, mode: 'initial' });
  }, [searchQuery, sortOption, loadPage]);


  const handleEndReached = useCallback(() => {
    if (!hasMore || loadMode !== null) return;
    loadPage(currentPage + 1, { search: searchQuery, sort: sortOption, mode: 'more' });
  }, [hasMore, loadMode, currentPage, searchQuery, sortOption, loadPage]);

  const handleRefresh = useCallback(() => {
    loadPage(1, { search: searchQuery, sort: sortOption, mode: 'refresh' });
  }, [searchQuery, sortOption, loadPage]);


  const handleCardPress = useCallback((courseId: number) => {
    router.push(courseDetailRoute(courseId) as never);
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <CourseCard
        course={item}
        onPress={() => handleCardPress(item.id)}
        style={styles.card}
      />
    ),
    [handleCardPress],
  );

  const listHeader = (
    <CoursesListHeader
      enrolledCourses={enrolledCourses}
      bookmarkedCourses={bookmarkedCourses}
      searchQuery={searchInput}
      displayedCount={totalItems}
      isRefreshError={isRefreshError}
      fetchError={fetchError}
      onRetry={handleRefresh}
      onPressCourse={handleCardPress}
      onBookmarkedLayout={handleBookmarkedLayout}
    />
  );


  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Courses</Text>
        </View>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading courses…</Text>
        </View>
      </SafeAreaView>
    );
  }


  if (fetchError && !isRefreshError && courses.length === 0) {
    const isOffline = fetchError.isNetworkError || fetchError.isTimeout;
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Courses</Text>
        </View>
        <View style={styles.centeredState}>
          <Ionicons
            name={isOffline ? 'wifi-outline' : 'cloud-offline-outline'}
            size={52}
            color={COLORS.GRAY_300}
          />
          <Text style={styles.errorTitle}>
            {isOffline ? 'No internet connection' : "Couldn't load courses"}
          </Text>
          <Text style={styles.emptySubtitle}>{fetchError.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              loadPage(1, { search: searchQuery, sort: sortOption, mode: 'initial' })
            }
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Courses</Text>
        <Text style={styles.screenSubtitle}>
          {totalItems} course{totalItems !== 1 ? 's' : ''} available
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.GRAY_400}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, instructor or category…"
            placeholderTextColor={COLORS.GRAY_400}
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FilterBar value={sortOption} onChange={setSortOption} />

      <FlatList
        ref={flatListRef}
        data={courses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState isSearching={searchInput.trim().length > 0} />
        }
        ListFooterComponent={<FooterLoader isVisible={isLoadingMore} />}
        refreshControl={
          <RefreshControl
            refreshing={loadMode === 'refresh'}
            onRefresh={handleRefresh}
            tintColor={COLORS.PRIMARY}
            colors={[COLORS.PRIMARY]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  header: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
    paddingBottom: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  screenTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
  },
  screenSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },

  searchContainer: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_100,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.SM,
    height: 40,
    ...SHADOWS.SM,
  },
  searchIcon: {
    marginRight: SPACING.XS,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    height: '100%',
    paddingVertical: 0,
  },

  listContent: {
    padding: SPACING.MD,
    gap: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  card: {
  },

  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
    gap: SPACING.SM,
  },
  loadingText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SM,
  },
  errorTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MD,
  },
  retryButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XXL,
    paddingHorizontal: SPACING.XL,
    gap: SPACING.SM,
  },
  emptyTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: FONT_SIZES.SM * 1.6,
  },
});


const sharedStyles = StyleSheet.create({
  horizontalSeparator: {
    width: SPACING.MD,
  },
});


const footerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    gap: SPACING.SM,
  },
  text: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
});


const bookmarkedStyles = StyleSheet.create({
  section: {
    paddingTop: SPACING.MD,
    paddingBottom: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
    gap: SPACING.SM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    gap: SPACING.XS,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  countBadge: {
    backgroundColor: COLORS.ACCENT + '22',
    borderRadius: BORDER_RADIUS.FULL,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 1,
  },
  countText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.ACCENT,
  },
  list: {
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XS,
  },
  card: {
    width: BOOKMARKED_CARD_WIDTH,
  },
});


const myCoursesStyles = StyleSheet.create({
  section: {
    paddingTop: SPACING.MD,
    paddingBottom: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
    gap: SPACING.SM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    gap: SPACING.XS,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  countBadge: {
    backgroundColor: COLORS.PRIMARY + '18',
    borderRadius: BORDER_RADIUS.FULL,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 1,
  },
  countText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
  },
  list: {
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XS,
  },

  allCoursesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  allCoursesTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  allCoursesCount: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
});


const bannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    gap: SPACING.XS,
  },
  offline: {
    backgroundColor: COLORS.WARNING_LIGHT,
    borderColor: COLORS.WARNING,
  },
  error: {
    backgroundColor: COLORS.ERROR_LIGHT,
    borderColor: COLORS.ERROR,
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: FONT_SIZES.SM * 1.5,
  },
  retry: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    flexShrink: 0,
  },
});
