import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
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
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <View
      style={[styles.card, { backgroundColor: colors.WHITE, borderColor: colors.BORDER }, style]}
    >
      <TouchableOpacity onPress={onImagePress ?? onPress} activeOpacity={0.88}>
        <View style={[styles.imageWrap, { backgroundColor: colors.GRAY_100 }]}>
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

      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
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

const THUMBNAIL_HEIGHT = 160;
const AVATAR_SIZE = 24;

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.MD,
  },

  imageWrap: {
    width: '100%',
    height: THUMBNAIL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
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
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  content: {
    padding: SPACING.MD,
    gap: SPACING.XS,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
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
  },
  instructorName: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    flex: 1,
  },

  price: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.MD,
    marginTop: 2,
  },
});
