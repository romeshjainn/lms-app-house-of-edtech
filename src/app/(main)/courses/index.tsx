import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { CourseCard } from '@/components/course/CourseCard';
import { FilterBar } from '@/components/course/FilterBar';
import { ImageSlider } from '@/components/course/ImageSlider';
import { FONTS, STORAGE_KEYS } from '@/constants';
import ROUTES, { courseDetailRoute } from '@/constants/routes';
import type { AppError } from '@/services/api/error-handler';
import { handleApiError } from '@/services/api/error-handler';
import { courseService } from '@/services/api/modules/course.service';
import { asyncStorage } from '@/services/storage/async-storage';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchAllCourses,
  selectBookmarkedCoursesData,
  selectEnrolledCount,
} from '@/store/slices/course.slice';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { AppColors } from '@/theme/ThemeContext';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseListItem, SortOption } from '@/types/course.types';

const PAGE_SIZE = 10;

type LoadMode = 'initial' | 'refresh' | 'more';

type StatItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  hide: boolean;
  onPress?: () => void;
};

function sortToApiParams(sort: SortOption | null): { sortBy?: string; sortType?: 'asc' | 'desc' } {
  if (!sort) return {};
  switch (sort) {
    case 'az':
      return { sortBy: 'title', sortType: 'asc' };
    case 'za':
      return { sortBy: 'title', sortType: 'desc' };
    case 'price-asc':
      return { sortBy: 'price', sortType: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortType: 'desc' };
  }
}

function sortCourses(list: CourseListItem[], sort: SortOption | null): CourseListItem[] {
  if (!sort) return list;
  const copy = [...list];
  switch (sort) {
    case 'az':
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'za':
      copy.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'price-asc':
      copy.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      copy.sort((a, b) => b.price - a.price);
      break;
  }
  return copy;
}

const keyExtractor = (item: CourseListItem): string => String(item.id);

function FooterLoader({ isVisible, colors }: { isVisible: boolean; colors: AppColors }) {
  if (!isVisible) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.MD,
        gap: SPACING.SM,
      }}
    >
      <ActivityIndicator size="small" color={colors.PRIMARY} />
      <CustomText
        style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.SM, color: colors.TEXT_SECONDARY }}
      >
        Loading more…
      </CustomText>
    </View>
  );
}

function RefreshErrorBanner({
  error,
  onRetry,
  colors,
}: {
  error: AppError;
  onRetry: () => void;
  colors: AppColors;
}) {
  const isOffline = error.isNetworkError || error.isTimeout;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.MD,
          paddingVertical: SPACING.SM,
          marginBottom: SPACING.SM,
          borderRadius: BORDER_RADIUS.MD,
          borderWidth: 1,
          gap: SPACING.XS,
        },
        isOffline
          ? { backgroundColor: colors.WARNING_LIGHT, borderColor: colors.WARNING }
          : { backgroundColor: colors.ERROR_LIGHT, borderColor: colors.ERROR },
      ]}
    >
      <Ionicons
        name={isOffline ? 'wifi-outline' : 'warning-outline'}
        size={15}
        color={isOffline ? colors.WARNING : colors.ERROR}
      />
      <CustomText
        style={{
          flex: 1,
          fontFamily: FONTS.REGULAR,
          fontSize: FONT_SIZES.SM,
          color: colors.TEXT_PRIMARY,
          lineHeight: FONT_SIZES.SM * 1.5,
        }}
        numberOfLines={2}
      >
        {isOffline
          ? "You're offline — showing cached content."
          : `Couldn't refresh: ${error.message}`}
      </CustomText>
      <TouchableOpacity onPress={onRetry} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <CustomText
          style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.SM, color: colors.PRIMARY }}
        >
          Retry
        </CustomText>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ isSearching, colors }: { isSearching: boolean; colors: AppColors }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.XXL,
        paddingHorizontal: SPACING.XL,
        gap: SPACING.SM,
      }}
    >
      <Ionicons
        name={isSearching ? 'search-outline' : 'school-outline'}
        size={52}
        color={colors.GRAY_300}
      />
      <CustomText
        style={{
          fontFamily: FONTS.BOLD,
          fontSize: FONT_SIZES.LG,
          color: colors.TEXT_PRIMARY,
          textAlign: 'center',
        }}
      >
        {isSearching ? 'No results found' : 'No courses available'}
      </CustomText>
      <CustomText
        style={{
          fontFamily: FONTS.REGULAR,
          fontSize: FONT_SIZES.SM,
          color: colors.TEXT_SECONDARY,
          textAlign: 'center',
          lineHeight: FONT_SIZES.SM * 1.6,
        }}
      >
        {isSearching
          ? 'Try a different search term or remove filters.'
          : 'Pull down to refresh and try again.'}
      </CustomText>
    </View>
  );
}

interface CoursesListHeaderProps {
  bookmarkedCourses: CourseListItem[];
  searchQuery: string;
  displayedCount: number;
  totalItems: number;
  isRefreshError: boolean;
  fetchError: AppError | null;
  onRetry: () => void;
  onPressCourse: (courseId: number) => void;
  onBookmarkedLayout?: (y: number) => void;
  colors: AppColors;
}

function CoursesListHeader({
  bookmarkedCourses,
  searchQuery,
  displayedCount,
  isRefreshError,
  fetchError,
  onRetry,
  onPressCourse,
  onBookmarkedLayout,
  colors,
  totalItems,
}: CoursesListHeaderProps) {
  const isSearching = searchQuery.trim().length > 0;

  const { isGuest } = useAppSelector((state) => state.auth);
  const enrolledCount = useAppSelector(selectEnrolledCount);

  const stats: StatItem[] = [
    {
      icon: 'book-outline',
      label: 'Total',
      value: totalItems,
      color: colors.PRIMARY,
      hide: false,
    },
    {
      icon: 'checkmark-circle-outline',
      label: 'Enrolled',
      value: enrolledCount,
      color: colors.SUCCESS,
      hide: isGuest,
    },
    {
      icon: 'time-outline',
      label: 'Bookmarked',
      value: bookmarkedCourses.length || 0,
      color: colors.ACCENT,
      hide: false,
      onPress: () => {
        router.push(ROUTES.BOOKMARKS);
      },
    },
  ];

  return (
    <>
      {isRefreshError && fetchError && (
        <RefreshErrorBanner error={fetchError} onRetry={onRetry} colors={colors} />
      )}

      <View
        style={{
          flexDirection: 'row',
          marginBottom: 20,
          marginTop: 10,
          paddingHorizontal: SPACING.MD,
          gap: SPACING.MD,
        }}
      >
        {stats.map((s, i) => {
          if (s.hide) return null;
          return (
            <TouchableOpacity
              key={i}
              style={{ flex: 1, alignItems: 'center' }}
              onPress={s?.onPress}
              disabled={!s.onPress}
            >
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
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.MD,
          paddingVertical: SPACING.SM,
        }}
      >
        <CustomText
          style={{
            fontFamily: FONTS.BOLD,
            fontSize: FONT_SIZES.SM,
            color: colors.TEXT_SECONDARY,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {isSearching ? 'Results' : 'All Courses'}
        </CustomText>
        <CustomText
          style={{
            fontFamily: FONTS.REGULAR,
            fontSize: FONT_SIZES.SM,
            color: colors.TEXT_SECONDARY,
          }}
        >
          {displayedCount}
        </CustomText>
      </View>
    </>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.BACKGROUND },
    header: {
      paddingHorizontal: SPACING.MD,
      paddingTop: SPACING.MD,
      paddingBottom: SPACING.SM,
      backgroundColor: colors.WHITE,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    searchContainer: {
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.SM,
      backgroundColor: colors.WHITE,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.GRAY_100,
      borderRadius: BORDER_RADIUS.MD,
      paddingHorizontal: SPACING.SM,
      height: 40,
      ...SHADOWS.SM,
    },
    searchInput: {
      flex: 1,
      fontFamily: FONTS.REGULAR,
      fontSize: FONT_SIZES.BASE,
      color: colors.TEXT_PRIMARY,
      height: '100%',
      paddingVertical: 0,
    },
    listContent: { padding: SPACING.MD, gap: SPACING.MD, paddingBottom: SPACING.XXL },
    centeredState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.XL,
      gap: SPACING.SM,
    },
    retryButton: {
      marginTop: SPACING.SM,
      paddingHorizontal: SPACING.LG,
      paddingVertical: SPACING.SM,
      backgroundColor: colors.PRIMARY,
      borderRadius: BORDER_RADIUS.MD,
    },
    galleryOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.93)',
      justifyContent: 'center',
    },
    galleryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.MD,
      paddingTop: SPACING.XL,
      paddingBottom: SPACING.SM,
    },
    galleryHint: {
      color: 'rgba(255,255,255,0.45)',
      fontFamily: FONTS.REGULAR,
      fontSize: FONT_SIZES.SM,
      textAlign: 'center',
      marginTop: SPACING.MD,
    },
  });
}

export default function CourseListScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const dispatch = useAppDispatch();

  const { section } = useLocalSearchParams<{ section?: string }>();

  const flatListRef = useRef<FlatList<CourseListItem>>(null);
  const bookmarkedYRef = useRef<number | null>(null);

  const bookmarkedCourses = useAppSelector(selectBookmarkedCoursesData);

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadMode, setLoadMode] = useState<LoadMode | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption | null>(null);

  const [fetchError, setFetchError] = useState<AppError | null>(null);
  const [isRefreshError, setIsRefreshError] = useState(false);

  const isInitialLoading = loadMode === 'initial' && courses.length === 0;
  const isLoadingMore = loadMode === 'more';

  const handleBookmarkedLayout = useCallback((y: number) => {
    bookmarkedYRef.current = y;
  }, []);

  useEffect(() => {
    if (section !== 'bookmarked') return;
    const timer = setTimeout(() => {
      if (bookmarkedYRef.current !== null) {
        flatListRef.current?.scrollToOffset({ offset: bookmarkedYRef.current, animated: true });
      }
      router.setParams({ section: undefined });
    }, 150);
    return () => clearTimeout(timer);
  }, [section]);

  const appendCoursesToCache = async (newCourses: CourseListItem[]) => {
    try {
      const existing = await asyncStorage.getItem(STORAGE_KEYS.COURSES_CACHE_KEY);

      let parsed: CourseListItem[] = existing ? JSON.parse(existing) : [];

      const existingIds = new Set(parsed.map((c) => c.id));

      const merged = [...parsed, ...newCourses.filter((c) => !existingIds.has(c.id))];

      await asyncStorage.setItem(STORAGE_KEYS.COURSES_CACHE_KEY, JSON.stringify(merged));
    } catch (e) {}
  };

  const loadPage = useCallback(
    async (pageNum: number, opts: { search: string; sort: SortOption | null; mode: LoadMode }) => {
      setLoadMode(opts.mode);
      setFetchError(null);
      if (opts.mode === 'refresh') setIsRefreshError(false);

      try {
        const result = await courseService.getCoursesPage({
          page: pageNum,
          limit: PAGE_SIZE,
          ...(opts.search.trim() && { query: opts.search.trim() }),
          ...sortToApiParams(opts.sort),
        });

        const sorted = sortCourses(result.courses, opts.sort);
        if (opts.mode === 'more') {
          setCourses((prev) => sortCourses([...prev, ...result.courses], opts.sort));
        } else {
          setCourses(sorted);
        }

        await appendCoursesToCache(result.courses);
        setCurrentPage(result.page);
        setHasMore(result.hasNextPage);
        setTotalItems(result.totalItems);
      } catch (err) {
        const appError = handleApiError(err);
        if (opts.mode !== 'more') {
          setFetchError(appError);
          if (opts.mode === 'refresh') setIsRefreshError(true);
        }

        const cached = await asyncStorage.getItem(STORAGE_KEYS.COURSES_CACHE_KEY);

        if (cached) {
          const parsed = JSON.parse(cached);
          setCourses(parsed);
          setTotalItems(parsed.length);
          setHasMore(false);

          setIsRefreshError(true);
          setFetchError(appError);

          return;
        }
      } finally {
        setLoadMode(null);
      }
    },
    [],
  );

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

  interface GalleryState {
    images: string[];
    title: string;
  }
  const [galleryState, setGalleryState] = useState<GalleryState | null>(null);

  const handleImagePress = useCallback(
    (item: CourseListItem) => {
      const imgs = item.images.length > 0 ? item.images : item.thumbnail ? [item.thumbnail] : [];
      if (imgs.length > 0) {
        setGalleryState({ images: imgs, title: item.title });
      } else {
        handleCardPress(item.id);
      }
    },
    [handleCardPress],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <CourseCard
        course={item}
        onPress={() => handleCardPress(item.id)}
        onImagePress={() => handleImagePress(item)}
      />
    ),
    [handleCardPress, handleImagePress],
  );

  const renderListHeader = useCallback(
    () => (
      <CoursesListHeader
        totalItems={totalItems}
        bookmarkedCourses={bookmarkedCourses}
        searchQuery={searchInput}
        displayedCount={totalItems}
        isRefreshError={isRefreshError}
        fetchError={fetchError}
        onRetry={handleRefresh}
        onPressCourse={handleCardPress}
        onBookmarkedLayout={handleBookmarkedLayout}
        colors={colors}
      />
    ),
    [
      bookmarkedCourses,
      searchInput,
      totalItems,
      isRefreshError,
      fetchError,
      handleRefresh,
      handleCardPress,
      handleBookmarkedLayout,
      colors,
    ],
  );

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <CustomText
            style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.XL, color: colors.TEXT_PRIMARY }}
          >
            Courses
          </CustomText>
        </View>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <CustomText
            style={{
              fontFamily: FONTS.REGULAR,
              fontSize: FONT_SIZES.BASE,
              color: colors.TEXT_SECONDARY,
              marginTop: SPACING.SM,
            }}
          >
            Loading courses…
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError && !isRefreshError && courses.length === 0) {
    const isOffline = fetchError.isNetworkError || fetchError.isTimeout;
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <CustomText
            style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.XL, color: colors.TEXT_PRIMARY }}
          >
            Courses
          </CustomText>
        </View>
        <View style={styles.centeredState}>
          <Ionicons
            name={isOffline ? 'wifi-outline' : 'cloud-offline-outline'}
            size={52}
            color={colors.GRAY_300}
          />
          <CustomText
            style={{
              fontFamily: FONTS.BOLD,
              fontSize: FONT_SIZES.LG,
              color: colors.TEXT_PRIMARY,
              textAlign: 'center',
            }}
          >
            {isOffline ? 'No internet connection' : "Couldn't load courses"}
          </CustomText>
          <CustomText
            style={{
              fontFamily: FONTS.REGULAR,
              fontSize: FONT_SIZES.SM,
              color: colors.TEXT_SECONDARY,
              textAlign: 'center',
              lineHeight: FONT_SIZES.SM * 1.6,
            }}
          >
            {fetchError.message}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadPage(1, { search: searchQuery, sort: sortOption, mode: 'initial' })}
          >
            <CustomText
              style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.BASE, color: '#FFFFFF' }}
            >
              Try Again
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <CustomText
          style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.XL, color: colors.TEXT_PRIMARY }}
        >
          Courses
        </CustomText>
        <CustomText
          style={{
            fontFamily: FONTS.REGULAR,
            fontSize: FONT_SIZES.SM,
            color: colors.TEXT_SECONDARY,
            marginTop: 2,
          }}
        >
          {totalItems} course{totalItems !== 1 ? 's' : ''} available
        </CustomText>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.GRAY_400}
            style={{ marginRight: SPACING.XS }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, instructor or category…"
            placeholderTextColor={colors.GRAY_400}
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
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <EmptyState isSearching={searchInput.trim().length > 0} colors={colors} />
        }
        ListFooterComponent={<FooterLoader isVisible={isLoadingMore} colors={colors} />}
        refreshControl={
          <RefreshControl
            refreshing={loadMode === 'refresh'}
            onRefresh={handleRefresh}
            tintColor={colors.PRIMARY}
            colors={[colors.PRIMARY]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
      />

      <Modal
        visible={galleryState !== null}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setGalleryState(null)}
      >
        <View style={styles.galleryOverlay}>
          <View style={styles.galleryHeader}>
            <CustomText
              style={{ flex: 1, color: '#FFFFFF', fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.MD }}
              numberOfLines={1}
            >
              {galleryState?.title ?? ''}
            </CustomText>
            <TouchableOpacity
              onPress={() => setGalleryState(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {galleryState && <ImageSlider images={galleryState.images} height={380} />}

          <CustomText style={styles.galleryHint}>Swipe to browse all photos</CustomText>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
