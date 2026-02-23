import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseListItem } from '@/types/course.types';

export const MINI_CARD_WIDTH = 168;
export const MINI_THUMB_HEIGHT = 96;

export interface MiniCourseCardProps {
  course: CourseListItem;
  onPress: () => void;
}

export const MiniCourseCard = memo(function MiniCourseCard({
  course,
  onPress,
}: MiniCourseCardProps) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.WHITE, borderColor: colors.BORDER }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.thumbWrap, { backgroundColor: colors.GRAY_100 }]}>
        {(loading || imgError || !course.thumbnail) && (
          <Ionicons name="image-outline" size={24} color={colors.GRAY_400} />
        )}

        {course.thumbnail && !imgError && (
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setImgError(true);
            }}
          />
        )}
      </View>
      <View style={styles.body}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.PRIMARY + '18' }]}>
          <CustomText style={[styles.categoryText, { color: colors.PRIMARY }]} numberOfLines={1}>
            {course.category}
          </CustomText>
        </View>
        <CustomText style={[styles.title, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
          {course.title}
        </CustomText>
        <CustomText style={[styles.instructor, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
          {course.instructor.name}
        </CustomText>
        <CustomText style={[styles.price, { color: colors.SECONDARY }]}>
          ${course.price.toFixed(2)}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: MINI_CARD_WIDTH,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.SM,
  },
  thumbWrap: {
    width: MINI_CARD_WIDTH,
    height: MINI_THUMB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  body: {
    padding: SPACING.SM,
    gap: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS - 1,
    textTransform: 'capitalize',
  },
  title: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    lineHeight: FONT_SIZES.SM * 1.35,
    marginTop: 2,
  },
  instructor: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    marginTop: 2,
  },
});
