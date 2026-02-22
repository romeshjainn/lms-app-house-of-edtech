import { memo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { COLORS, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { CourseListItem } from '@/types/course.types';
import { BookmarkButton } from './BookmarkButton';

interface CourseCardProps {
  course: CourseListItem;
  onPress: () => void;
  style?: ViewStyle;
}

export const CourseCard = memo(function CourseCard({ course, onPress, style }: CourseCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: course.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.bookmarkOverlay}>
          <BookmarkButton courseId={course.id} size={20} variant="circle" />
        </View>

        <View style={styles.categoryTag}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {course.category.replace(/-/g, ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={styles.instructorRow}>
          {course.instructor.avatarUrl ? (
            <Image
              source={{ uri: course.instructor.avatarUrl }}
              style={styles.instructorAvatar}
            />
          ) : (
            <View style={styles.instructorAvatarFallback} />
          )}
          <Text style={styles.instructorName} numberOfLines={1}>
            {course.instructor.name}
          </Text>
        </View>

        <Text style={styles.price}>${course.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
});

const THUMBNAIL_HEIGHT = 160;
const AVATAR_SIZE = 24;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
    ...SHADOWS.MD,
  },

  imageWrap: {
    width: '100%',
    height: THUMBNAIL_HEIGHT,
    backgroundColor: COLORS.GRAY_100,
  },
  image: {
    width: '100%',
    height: '100%',
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

  content: {
    padding: SPACING.MD,
    gap: SPACING.XS,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: FONT_SIZES.BASE * 1.4,
  },

  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    marginTop: 2,
  },
  instructorAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.GRAY_200,
  },
  instructorAvatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.GRAY_200,
  },
  instructorName: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },

  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.PRIMARY,
    marginTop: 2,
  },
});
