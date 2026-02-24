import { memo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';

import CustomText from '@/components/base/AppText';
import { DEFAULT_COURSE_IMAGE, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseListItem } from '@/types/course.types';
import { BookmarkButton } from './BookmarkButton';

interface CourseCardProps {
  course: CourseListItem;
  onPress: () => void;
  onImagePress?: () => void;
  style?: ViewStyle;
}

export const CourseCard = memo(function CourseCard({
  course,
  onPress,
  onImagePress,
  style,
}: CourseCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.WHITE,
          borderColor: colors.BORDER,
        },
        style,
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onImagePress ?? onPress}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: DEFAULT_COURSE_IMAGE,
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          <View style={styles.overlay} />

          <View style={styles.bookmarkOverlay}>
            <BookmarkButton courseId={course.id} size={20} variant="circle" />
          </View>

          <View style={styles.categoryTag}>
            <CustomText style={styles.categoryText} numberOfLines={1}>
              {course.category.replace(/-/g, ' ')}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <View style={styles.content}>
          <CustomText style={[styles.title, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
            {course.title}
          </CustomText>

          <View style={styles.instructorRow}>
            {course.instructor.avatarUrl ? (
              <Image
                source={{ uri: encodeURI(course.instructor.avatarUrl) }}
                style={[styles.instructorAvatar, { backgroundColor: colors.GRAY_200 }]}
              />
            ) : (
              <View style={[styles.instructorAvatar, { backgroundColor: colors.GRAY_200 }]} />
            )}

            <CustomText
              style={[styles.instructorName, { color: colors.TEXT_SECONDARY }]}
              numberOfLines={1}
            >
              {course.instructor.name}
            </CustomText>
          </View>

          <CustomText style={[styles.price, { color: colors.PRIMARY }]}>
            ${course.price.toFixed(2)}
          </CustomText>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const THUMBNAIL_HEIGHT = 180;
const AVATAR_SIZE = 28;

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.MD,
  },

  imageContainer: {
    width: '100%',
    height: THUMBNAIL_HEIGHT,
    position: 'relative',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  bookmarkOverlay: {
    position: 'absolute',
    top: SPACING.SM,
    right: SPACING.SM,
  },

  categoryTag: {
    position: 'absolute',
    bottom: SPACING.SM,
    left: SPACING.SM,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    borderRadius: 50,
  },

  categoryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  content: {
    padding: SPACING.MD,
  },

  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    lineHeight: FONT_SIZES.BASE * 1.4,
    marginBottom: 6,
  },

  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  instructorAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: SPACING.SM,
  },

  instructorName: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    flex: 1,
  },

  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.MD,
  },
});
