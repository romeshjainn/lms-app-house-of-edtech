import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookmarkButton } from '@/components/course/BookmarkButton';
import { EnrollButton } from '@/components/course/EnrollButton';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { COLORS, FONTS } from '@/constants';
import ROUTES from '@/constants/routes';
import { handleApiError } from '@/services/api/error-handler';
import { courseService } from '@/services/api/modules/course.service';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { CourseDetail } from '@/types/course.types';

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: full }).map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={14} color={COLORS.ACCENT} />
      ))}
      {half && <Ionicons name="star-half" size={14} color={COLORS.ACCENT} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color={COLORS.ACCENT} />
      ))}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const id = parseInt(courseId ?? '0', 10);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading course…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredState}>
          <Ionicons name="wifi-outline" size={52} color={COLORS.GRAY_300} />
          <Text style={styles.errorTitle}>Could not load course</Text>
          <Text style={styles.errorSubtitle}>{error ?? 'Unknown error'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
            <Text style={styles.retryText}>Try Again</Text>
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>

        <Breadcrumb items={[{ label: 'Courses', href: ROUTES.COURSES }, { label: course.title }]} />

        <BookmarkButton courseId={course.id} size={22} variant="plain" />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >   
        <View style={styles.heroWrap}>
          <Image source={{ uri: course.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{course.category.replace(/-/g, ' ')}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>{course.title}</Text>
          <View style={styles.metaRow}>
            <RatingStars rating={course.rating} />
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>
              {course.stock} seat{course.stock !== 1 ? 's' : ''} left
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${course.price.toFixed(2)}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>${originalPrice}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(course.discountPercentage)}% off
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About this course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Your instructor</Text>
          <View style={styles.instructorCard}>
            {course.instructor.avatarUrl ? (
              <Image
                source={{ uri: course.instructor.avatarUrl }}
                style={styles.instructorAvatar}
              />
            ) : (
              <View style={[styles.instructorAvatar, styles.instructorAvatarFallback]}>
                <Ionicons name="person" size={28} color={COLORS.GRAY_400} />
              </View>
            )}
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{course.instructor.name}</Text>
              {course.instructor.location ? (
                <View style={styles.instructorMeta}>
                  <Ionicons name="location-outline" size={13} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.instructorMetaText}>{course.instructor.location}</Text>
                </View>
              ) : null}
              {course.instructor.email ? (
                <View style={styles.instructorMeta}>
                  <Ionicons name="mail-outline" size={13} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.instructorMetaText}>{course.instructor.email}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.bottomPad} />
      </ScrollView>

      <View style={styles.ctaBar}>
        <EnrollButton courseId={course.id} style={styles.enrollButton} />
        <TouchableOpacity
          style={styles.contentButton}
          onPress={() => router.push(`/courses/content/${course.id}` as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.contentButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const HERO_HEIGHT = 220;
const INSTRUCTOR_AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingRight: SPACING.SM,
  },
  backButton: {
    padding: SPACING.SM,
    marginLeft: SPACING.XS,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.MD,
  },
  heroWrap: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: COLORS.GRAY_100,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: SPACING.SM,
    left: SPACING.MD,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.FULL,
  },
  categoryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.WHITE,
    textTransform: 'capitalize',
  },
  section: {
    padding: SPACING.MD,
    gap: SPACING.SM,
    backgroundColor: COLORS.WHITE,
  },
  sectionHeading: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
  },
  divider: {
    height: SPACING.SM,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: FONT_SIZES.XL * 1.35,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    flexWrap: 'wrap',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.XS,
  },
  metaDot: {
    color: COLORS.GRAY_400,
    fontSize: FONT_SIZES.SM,
  },
  metaText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    flexWrap: 'wrap',
  },
  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.GRAY_400,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
  },
  discountText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.SUCCESS,
  },
  description: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: FONT_SIZES.BASE * 1.6,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.MD,
    padding: SPACING.MD,
    backgroundColor: COLORS.GRAY_50,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  instructorAvatar: {
    width: INSTRUCTOR_AVATAR_SIZE,
    height: INSTRUCTOR_AVATAR_SIZE,
    borderRadius: INSTRUCTOR_AVATAR_SIZE / 2,
    backgroundColor: COLORS.GRAY_200,
  },
  instructorAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorInfo: {
    flex: 1,
    gap: SPACING.XS,
  },
  instructorName: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  instructorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  instructorMetaText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
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
  errorSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: FONT_SIZES.SM * 1.6,
  },
  retryButton: {
    marginTop: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MD,
  },
  retryText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
  ctaBar: {
    flexDirection: 'row',
    padding: SPACING.MD,
    gap: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  contentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    height: 48,
  },
  contentButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
  enrollButton: {},
  bottomPad: {
    height: SPACING.MD,
  },
});
