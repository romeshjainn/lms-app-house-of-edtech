import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  StyleProp,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';
import { FormLabel } from './FormLabel';


interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  leadIcon?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string;
  touched?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

const ICON_SIZE = 20;


export function FormInput({
  label,
  required = false,
  leadIcon,
  error,
  touched,
  containerStyle,
  isPassword = false,
  ...textInputProps
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const hasError = touched && !!error;
  const showError = hasError;

  const wrapperStyle = [
    styles.inputWrapper,
    isFocused && styles.inputWrapperFocused,
    showError && styles.inputWrapperError,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      <FormLabel label={label} required={required} />

      <View style={wrapperStyle}>
        {leadIcon && (
          <Ionicons
            name={leadIcon}
            size={ICON_SIZE}
            color={
              showError
                ? COLORS.ERROR
                : isFocused
                  ? COLORS.SECONDARY
                  : COLORS.GRAY_400
            }
            style={styles.leadIcon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.GRAY_400}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={isPassword && !isVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            style={styles.eyeBtn}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isVisible ? 'eye-off-outline' : 'eye-outline'}
              size={ICON_SIZE}
              color={COLORS.GRAY_400}
            />
          </TouchableOpacity>
        )}
      </View>

      {showError && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={12}
            color={COLORS.ERROR}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    gap: SPACING.XS,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.GRAY_50,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
  },
  inputWrapperFocused: {
    borderColor: COLORS.SECONDARY,
    backgroundColor: COLORS.SECONDARY_LIGHT,
  },
  inputWrapperError: {
    borderColor: COLORS.ERROR,
    backgroundColor: COLORS.ERROR_LIGHT,
  },
  leadIcon: {
    marginRight: SPACING.SM,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    height: '100%',
  },
  eyeBtn: {
    paddingLeft: SPACING.SM,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  errorText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: COLORS.ERROR,
  },
});
