import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
import { courseDetailRoute } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectBookmarkedCoursesData, toggleBookmark } from '@/store/slices/course.slice';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseListItem } from '@/types/course.types';
import { Image } from 'expo-image';

const keyExtractor = (item: CourseListItem) => String(item.id);

function BookmarkRow({ item, index }: { item: CourseListItem; index: number }) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const [imgError, setImgError] = useState(false);

  return (
    <Animated.View entering={FadeInDown.duration(280).delay(index * 40)}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.WHITE, borderColor: colors.BORDER }]}
        onPress={() => router.push(courseDetailRoute(item.id) as never)}
        activeOpacity={0.78}
      >
        <View style={[styles.thumb, { backgroundColor: colors.GRAY_100 }]}>
          {!imgError && item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgError(true)}
              contentFit="cover"
              cachePolicy="disk"
              transition={200}
            />
          ) : (
            <Ionicons name="image-outline" size={22} color={colors.GRAY_400} />
          )}
          <View style={[styles.categoryTag, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
            <CustomText style={styles.categoryText} numberOfLines={1}>
              {item.category.replace(/-/g, ' ')}
            </CustomText>
          </View>
        </View>

        <View style={styles.rowBody}>
          <CustomText style={[styles.rowTitle, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
            {item.title}
          </CustomText>
          <CustomText
            style={[styles.rowInstructor, { color: colors.TEXT_SECONDARY }]}
            numberOfLines={1}
          >
            {item.instructor.name}
          </CustomText>
          <CustomText style={[styles.rowPrice, { color: colors.PRIMARY }]}>
            ${item.price.toFixed(2)}
          </CustomText>
        </View>

        <TouchableOpacity
          style={[styles.unbookmarkBtn, { backgroundColor: colors.ERROR_LIGHT }]}
          onPress={() => dispatch(toggleBookmark(item.id))}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="bookmark" size={16} color={colors.ERROR} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState() {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyWrap}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.GRAY_100 }]}>
        <Ionicons name="bookmark-outline" size={36} color={colors.GRAY_400} />
      </View>
      <CustomText style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
        No bookmarks yet
      </CustomText>
      <CustomText style={[styles.emptySub, { color: colors.TEXT_SECONDARY }]}>
        Tap the bookmark icon on any course to save it here for later.
      </CustomText>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: colors.SECONDARY }]}
        onPress={() => router.push('/courses' as never)}
        activeOpacity={0.85}
      >
        <CustomText style={styles.emptyBtnText}>Browse Courses</CustomText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const renderItem = ({ item, index }: ListRenderItemInfo<CourseListItem>) => (
  <BookmarkRow item={item} index={index} />
);

export default function BookmarksScreen() {
  const { colors } = useTheme();
  const bookmarked = useAppSelector(selectBookmarkedCoursesData);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      edges={['top']}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.header, { backgroundColor: colors.WHITE, borderBottomColor: colors.BORDER }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.GRAY_100 }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <CustomText style={[styles.title, { color: colors.TEXT_PRIMARY }]}>Bookmarks</CustomText>
          {bookmarked.length > 0 && (
            <CustomText style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
              {bookmarked.length} saved
            </CustomText>
          )}
        </View>
      </Animated.View>

      <FlatList
        data={bookmarked}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, bookmarked.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.SM }} />}
        removeClippedSubviews
        initialNumToRender={8}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    gap: SPACING.SM,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.LG },
  subtitle: { fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.SM, marginTop: 1 },
  list: { padding: SPACING.MD },
  listEmpty: { flexGrow: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    padding: SPACING.SM,
    gap: SPACING.SM,
    ...SHADOWS.SM,
  },
  thumb: {
    width: 80,
    height: 72,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 3,
    left: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.SM,
  },
  categoryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS - 2,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: FONTS.MEDIUM, fontSize: FONT_SIZES.SM, lineHeight: FONT_SIZES.SM * 1.4 },
  rowInstructor: { fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.XS },
  rowPrice: { fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.SM, marginTop: 2 },

  unbookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
    gap: SPACING.MD,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XS,
  },
  emptyTitle: { fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.LG, textAlign: 'center' },
  emptySub: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    textAlign: 'center',
    lineHeight: FONT_SIZES.SM * 1.6,
  },
  emptyBtn: {
    marginTop: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM + 2,
    borderRadius: BORDER_RADIUS.LG,
  },
  emptyBtnText: { fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.BASE, color: '#FFFFFF' },
});
