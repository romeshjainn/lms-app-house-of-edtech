import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { COLORS } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectIsBookmarked, toggleBookmark } from '@/store/slices/course.slice';

interface BookmarkButtonProps {
  courseId: number;
  size?: number;
  variant?: 'plain' | 'circle';
}

export function BookmarkButton({
  courseId,
  size = 22,
  variant = 'plain',
}: BookmarkButtonProps) {
  const dispatch = useAppDispatch();
  const isBookmarked = useAppSelector(selectIsBookmarked(courseId));
  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    if (isPending) return;
    setIsPending(true);
    await dispatch(toggleBookmark(courseId));
    setIsPending(false);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={variant === 'circle' ? styles.circle : undefined}
    >
      {isPending ? (
        <ActivityIndicator
          size="small"
          color={isBookmarked ? COLORS.PRIMARY : COLORS.GRAY_400}
        />
      ) : (
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={size}
          color={isBookmarked ? COLORS.PRIMARY : COLORS.GRAY_400}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
