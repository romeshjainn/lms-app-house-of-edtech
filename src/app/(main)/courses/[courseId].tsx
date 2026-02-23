import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { BookmarkButton } from '@/components/course/BookmarkButton';
import { EnrollButton } from '@/components/course/EnrollButton';
import { ImageSlider } from '@/components/course/ImageSlider';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { FONTS } from '@/constants';
import ROUTES from '@/constants/routes';
import { handleApiError } from '@/services/api/error-handler';
import { courseService } from '@/services/api/modules/course.service';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { AppColors } from '@/theme/ThemeContext';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseDetail } from '@/types/course.types';

function RatingStars({ rating, colors }: { rating: number; colors: AppColors }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={14} color={colors.ACCENT} />
      ))}
      {half && <Ionicons name="star-half" size={14} color={colors.ACCENT} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color={colors.ACCENT} />
      ))}
      <CustomText style={{ fontFamily: FONTS.MEDIUM, fontSize: FONT_SIZES.SM, color: colors.TEXT_SECONDARY, marginLeft: SPACING.XS }}>
        {rating.toFixed(1)}
      </CustomText>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container:   { flex: 1, backgroundColor: colors.BACKGROUND },
    navBar: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.WHITE, borderBottomWidth: 1, borderBottomColor: colors.BORDER,
      paddingRight: SPACING.SM,
    },
    backButton:  { padding: SPACING.SM, marginLeft: SPACING.XS },
    scroll:      { flex: 1 },
    scrollContent: { paddingBottom: SPACING.MD },
    heroWrap: { width: '100%', height: HERO_HEIGHT },
    categoryTag: {
      position: 'absolute', bottom: SPACING.SM, left: SPACING.MD,
      backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: SPACING.SM,
      paddingVertical: 3, borderRadius: BORDER_RADIUS.FULL,
    },
    section:     { padding: SPACING.MD, gap: SPACING.SM, backgroundColor: colors.WHITE },
    divider:     { height: SPACING.SM, backgroundColor: colors.BACKGROUND },
    instructorCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.MD,
      padding: SPACING.MD, backgroundColor: colors.GRAY_50,
      borderRadius: BORDER_RADIUS.LG, borderWidth: 1, borderColor: colors.BORDER, ...SHADOWS.SM,
    },
    instructorAvatar: {
      width: INSTRUCTOR_AVATAR_SIZE, height: INSTRUCTOR_AVATAR_SIZE,
      borderRadius: INSTRUCTOR_AVATAR_SIZE / 2, backgroundColor: colors.GRAY_200,
    },
    instructorAvatarFallback: { alignItems: 'center', justifyContent: 'center' },
    instructorInfo: { flex: 1, gap: SPACING.XS },
    discountBadge: {
      backgroundColor: colors.SUCCESS_LIGHT, paddingHorizontal: SPACING.SM,
      paddingVertical: 2, borderRadius: BORDER_RADIUS.SM,
    },
    centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.XL, gap: SPACING.SM },
    retryButton: {
      marginTop: SPACING.SM, paddingHorizontal: SPACING.LG, paddingVertical: SPACING.SM,
      backgroundColor: colors.PRIMARY, borderRadius: BORDER_RADIUS.MD,
    },
    ctaBar: {
      flexDirection: 'row', padding: SPACING.MD, gap: SPACING.SM,
      backgroundColor: colors.WHITE, borderTopWidth: 1, borderTopColor: colors.BORDER, ...SHADOWS.MD,
    },
    contentButton: {
      flexDirection: 'row', alignItems: 'center', gap: SPACING.XS,
      backgroundColor: colors.SECONDARY, borderRadius: BORDER_RADIUS.MD,
      paddingHorizontal: SPACING.MD, height: 48,
    },
  });
}

const HERO_HEIGHT = 220;
const INSTRUCTOR_AVATAR_SIZE = 64;

export default function CourseDetailScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const id = parseInt(courseId ?? '0', 10);

  const [course, setCourse]   = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await courseService.getCourseDetail(id);
      setCourse(data);
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.BASE, color: colors.TEXT_SECONDARY, marginTop: SPACING.SM }}>
            Loading course…
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredState}>
          <Ionicons name="wifi-outline" size={52} color={colors.GRAY_300} />
          <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.LG, color: colors.TEXT_PRIMARY, textAlign: 'center' }}>
            Could not load course
          </CustomText>
          <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.SM, color: colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: FONT_SIZES.SM * 1.6 }}>
            {error ?? 'Unknown error'}
          </CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
            <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.BASE, color: '#FFFFFF' }}>
              Try Again
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const originalPrice = (course.price / (1 - course.discountPercentage / 100)).toFixed(2);
  const hasDiscount = course.discountPercentage > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>

        <Breadcrumb items={[{ label: 'Courses', href: ROUTES.COURSES }, { label: course.title }]} />

        <BookmarkButton courseId={course.id} size={22} variant="plain" />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <ImageSlider
            images={
              course.images.length > 0
                ? course.images
                : course.thumbnail
                  ? [course.thumbnail]
                  : []
            }
            height={HERO_HEIGHT}
          />
          <View style={styles.categoryTag}>
            <CustomText style={{ fontFamily: FONTS.MEDIUM, fontSize: FONT_SIZES.XS, color: '#FFFFFF', textTransform: 'capitalize' }}>
              {course.category.replace(/-/g, ' ')}
            </CustomText>
          </View>
        </View>

        <View style={styles.section}>
          <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.XL, color: colors.TEXT_PRIMARY, lineHeight: FONT_SIZES.XL * 1.35 }}>
            {course.title}
          </CustomText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.XS, flexWrap: 'wrap' }}>
            <RatingStars rating={course.rating} colors={colors} />
            <CustomText style={{ color: colors.GRAY_400, fontSize: FONT_SIZES.SM }}>·</CustomText>
            <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.SM, color: colors.TEXT_SECONDARY }}>
              {course.stock} seat{course.stock !== 1 ? 's' : ''} left
            </CustomText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, flexWrap: 'wrap' }}>
            <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.XXL, color: colors.PRIMARY }}>
              ${course.price.toFixed(2)}
            </CustomText>
            {hasDiscount && (
              <>
                <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.BASE, color: colors.GRAY_400, textDecorationLine: 'line-through' }}>
                  ${originalPrice}
                </CustomText>
                <View style={styles.discountBadge}>
                  <CustomText style={{ fontFamily: FONTS.MEDIUM, fontSize: FONT_SIZES.XS, color: colors.SUCCESS }}>
                    {Math.round(course.discountPercentage)}% off
                  </CustomText>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.MD, color: colors.TEXT_PRIMARY }}>
            About this course
          </CustomText>
          <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.BASE, color: colors.TEXT_SECONDARY, lineHeight: FONT_SIZES.BASE * 1.6 }}>
            {course.description}
          </CustomText>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.MD, color: colors.TEXT_PRIMARY }}>
            Your instructor
          </CustomText>
          <View style={styles.instructorCard}>
            {course.instructor.avatarUrl ? (
              <Image source={{ uri: course.instructor.avatarUrl }} style={styles.instructorAvatar} />
            ) : (
              <View style={[styles.instructorAvatar, styles.instructorAvatarFallback]}>
                <Ionicons name="person" size={28} color={colors.GRAY_400} />
              </View>
            )}
            <View style={styles.instructorInfo}>
              <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.BASE, color: colors.TEXT_PRIMARY }}>
                {course.instructor.name}
              </CustomText>
              {course.instructor.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.XS }}>
                  <Ionicons name="location-outline" size={13} color={colors.TEXT_SECONDARY} />
                  <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.SM, color: colors.TEXT_SECONDARY, flex: 1 }}>
                    {course.instructor.location}
                  </CustomText>
                </View>
              ) : null}
              {course.instructor.email ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.XS }}>
                  <Ionicons name="mail-outline" size={13} color={colors.TEXT_SECONDARY} />
                  <CustomText style={{ fontFamily: FONTS.REGULAR, fontSize: FONT_SIZES.SM, color: colors.TEXT_SECONDARY, flex: 1 }}>
                    {course.instructor.email}
                  </CustomText>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={{ height: SPACING.MD }} />
      </ScrollView>

      <View style={styles.ctaBar}>
        <EnrollButton courseId={course.id} style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.contentButton}
          onPress={() => router.push(`/courses/content/${course.id}` as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
          <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: FONT_SIZES.BASE, color: '#FFFFFF' }}>
            View
          </CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
