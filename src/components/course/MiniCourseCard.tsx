import { memo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import CustomText from '@/components/base/AppText';
import { DEFAULT_COURSE_IMAGE, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';
import type { CourseListItem } from '@/types/course.types';
import { Ionicons } from '@expo/vector-icons';

export interface MiniCourseCardProps {
  course: CourseListItem;
  onPress: () => void;
}
export const MINI_CARD_WIDTH = 178;
export const MINI_THUMB_HEIGHT = 110;

export const MiniCourseCard = memo(function MiniCourseCard({
  course,
  onPress,
}: MiniCourseCardProps) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.WHITE,
          borderColor: colors.BORDER,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {!imgError ? (
          <Image
            source={{ uri: DEFAULT_COURSE_IMAGE }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View
            style={[
              styles.thumbnail,
              {
                backgroundColor: colors.GRAY_100,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Ionicons name="image-outline" size={22} color={colors.GRAY_400} />
          </View>
        )}

        {/* Soft Overlay */}
        <View style={styles.overlay} />

        {/* Category Tag */}
        <View style={styles.categoryTag}>
          <CustomText style={styles.categoryText} numberOfLines={1}>
            {course.category.replace(/-/g, ' ')}
          </CustomText>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.body}>
        <CustomText style={[styles.title, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
          {course.title}
        </CustomText>

        <CustomText style={[styles.instructor, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
          {course.instructor.name}
        </CustomText>

        <CustomText style={[styles.price, { color: colors.PRIMARY }]}>
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
    ...SHADOWS.MD,
  },

  /* IMAGE */
  imageContainer: {
    width: '100%',
    height: MINI_THUMB_HEIGHT,
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

  categoryTag: {
    position: 'absolute',
    bottom: SPACING.SM,
    left: SPACING.SM,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 3,
    borderRadius: 50,
  },

  categoryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  /* BODY */
  body: {
    padding: SPACING.SM,
  },

  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    lineHeight: FONT_SIZES.SM * 1.35,
    marginBottom: 4,
  },

  instructor: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginBottom: 4,
  },

  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
  },
});
