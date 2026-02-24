import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
import { useAppSelector } from '@/store';
import { selectEnrolledCoursesData, selectIsCompleted } from '@/store/slices/course.slice';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseListItem } from '@/types/course.types';

const keyExtractor = (item: CourseListItem) => String(item.id);

function CourseRow({ item, index }: { item: CourseListItem; index: number }) {
  const { colors } = useTheme();
  const isCompleted = useAppSelector(selectIsCompleted(item.id));
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
            <Ionicons name="book-outline" size={22} color={colors.GRAY_400} />
          )}
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
          <View style={styles.rowFooter}>
            <View
              style={[
                styles.badge,
                { backgroundColor: isCompleted ? colors.SUCCESS_LIGHT : colors.PRIMARY_LIGHT },
              ]}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : 'time-outline'}
                size={12}
                color={isCompleted ? colors.SUCCESS : colors.PRIMARY}
              />
              <CustomText
                style={[styles.badgeText, { color: isCompleted ? colors.SUCCESS : colors.PRIMARY }]}
              >
                {isCompleted ? 'Completed' : 'In Progress'}
              </CustomText>
            </View>
            <CustomText style={[styles.rowPrice, { color: colors.SECONDARY }]}>
              ${item.price.toFixed(2)}
            </CustomText>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.GRAY_300} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState() {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyWrap}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.GRAY_100 }]}>
        <Ionicons name="book-outline" size={36} color={colors.GRAY_400} />
      </View>
      <CustomText style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
        No courses yet
      </CustomText>
      <CustomText style={[styles.emptySub, { color: colors.TEXT_SECONDARY }]}>
        Enrol in a course to start tracking your learning progress.
      </CustomText>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: colors.SECONDARY }]}
        onPress={() => router.push('/courses' as never)}
        activeOpacity={0.85}
      >
        <CustomText
          style={[
            styles.emptyBtnText,
            { color: colors.TEXT_INVERSE === '#111827' ? '#FFFFFF' : colors.TEXT_INVERSE },
          ]}
        >
          Browse Courses
        </CustomText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const renderItem = ({ item, index }: ListRenderItemInfo<CourseListItem>) => (
  <CourseRow item={item} index={index} />
);

export default function MyCoursesScreen() {
  const { colors } = useTheme();
  const enrolled = useAppSelector(selectEnrolledCoursesData);

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
          <CustomText style={[styles.title, { color: colors.TEXT_PRIMARY }]}>My Courses</CustomText>
          {enrolled.length > 0 && (
            <CustomText style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
              {enrolled.length} enrolled
            </CustomText>
          )}
        </View>
      </Animated.View>

      <FlatList
        data={enrolled}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, enrolled.length === 0 && styles.listEmpty]}
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
  list: { padding: SPACING.MD, gap: SPACING.SM },
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
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: FONTS.MEDIUM, fontSize: FONT_SIZES.SM, lineHeight: FONT_SIZES.SM * 1.4 },
  rowInstructor: { fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.XS },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.FULL,
  },
  badgeText: { fontFamily: FONTS.MEDIUM, fontSize: FONT_SIZES.XS - 1 },
  rowPrice: { fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.SM },

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
