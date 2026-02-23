import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { COLORS, FONTS } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectIsEnrolled, toggleEnrollment } from '@/store/slices/course.slice';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';
import { showToast } from '@/utils/toast';

interface EnrollButtonProps {
  courseId: number;
  style?: ViewStyle;
}

export function EnrollButton({ courseId, style }: EnrollButtonProps) {
  const dispatch = useAppDispatch();
  const isEnrolled = useAppSelector(selectIsEnrolled(courseId));
  const { isGuest } = useAppSelector((state) => state.auth);
  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    if (isGuest) {
      showToast.error('Please log in to enroll in courses.', 'Login Required');
      return;
    }

    if (isPending) return;

    setIsPending(true);
    await dispatch(toggleEnrollment(courseId));
    setIsPending(false);
  }

  const enrolled = isEnrolled;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={isPending}
      style={[
        styles.button,
        enrolled ? styles.enrolledButton : isGuest ? styles.guestButton : styles.enrollButton,
        style,
      ]}
    >
      {isPending ? (
        <ActivityIndicator size="small" color={COLORS.WHITE} />
      ) : (
        <View style={styles.inner}>
          {enrolled && (
            <Ionicons name="checkmark-circle" size={18} color={COLORS.WHITE} style={styles.icon} />
          )}
          <Text style={styles.label}>{enrolled ? 'Enrolled' : 'Enroll Now'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
  },
  enrollButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  enrolledButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  guestButton: {
    backgroundColor: COLORS.GRAY_600,
    opacity: 0.7,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.XS,
  },
  label: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
});
