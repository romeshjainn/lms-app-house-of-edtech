import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import type { CourseListItem } from '@/types/course.types';

export const MINI_CARD_WIDTH   = 168;
export const MINI_THUMB_HEIGHT = 96;

export interface MiniCourseCardProps {
  course: CourseListItem;
  onPress: () => void;
}

export function MiniCourseCard({ course, onPress }: MiniCourseCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: course.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {course.category}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.instructor} numberOfLines={1}>
          {course.instructor.name}
        </Text>
        <Text style={styles.price}>${course.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: MINI_CARD_WIDTH,
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
    ...SHADOWS.SM,
  },
  thumbnail: {
    width: MINI_CARD_WIDTH,
    height: MINI_THUMB_HEIGHT,
    backgroundColor: COLORS.GRAY_100,
  },
  body: {
    padding: SPACING.SM,
    gap: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.PRIMARY + '18',
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS - 1,
    color: COLORS.PRIMARY,
    textTransform: 'capitalize',
  },
  title: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: FONT_SIZES.SM * 1.35,
    marginTop: 2,
  },
  instructor: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.SECONDARY,
    marginTop: 2,
  },
});
