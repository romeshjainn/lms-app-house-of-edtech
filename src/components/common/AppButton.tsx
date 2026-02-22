import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';


type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}


export function AppButton({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  leftIcon,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        variantStyles[variant].button,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? COLORS.SECONDARY
              : COLORS.WHITE
          }
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={18}
              color={variantStyles[variant].iconColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, variantStyles[variant].label]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}


const variantStyles = {
  primary: {
    button: {
      backgroundColor: COLORS.PRIMARY,
      ...SHADOWS.MD,
    },
    label: { color: COLORS.WHITE },
    iconColor: COLORS.WHITE,
  },
  secondary: {
    button: {
      backgroundColor: COLORS.SECONDARY,
      ...SHADOWS.MD,
    },
    label: { color: COLORS.WHITE },
    iconColor: COLORS.WHITE,
  },
  outline: {
    button: {
      backgroundColor: COLORS.WHITE,
      borderWidth: 1.5,
      borderColor: COLORS.SECONDARY,
    },
    label: { color: COLORS.SECONDARY },
    iconColor: COLORS.SECONDARY,
  },
  ghost: {
    button: {
      backgroundColor: COLORS.TRANSPARENT,
      borderWidth: 1.5,
      borderColor: COLORS.BORDER,
    },
    label: { color: COLORS.GRAY_500 },
    iconColor: COLORS.GRAY_500,
  },
} as const;


const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.MD,
  },
  disabled: {
    opacity: 0.55,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: SPACING.SM,
  },
  label: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    letterSpacing: 0.3,
  },
});
