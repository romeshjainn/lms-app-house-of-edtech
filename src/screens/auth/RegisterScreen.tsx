import { router } from 'expo-router';
import { useFormik } from 'formik';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { COLORS, FONTS, ROUTES } from '@/constants';
import { handleApiError } from '@/services/api/error-handler';
import { authService } from '@/services/api/modules/auth.service';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginSuccess } from '@/store/slices/auth.slice';
import { selectBiometricSupported, setBiometricEnabled } from '@/store/slices/preferences.slice';
import { showToast } from '@/utils/toast';
import type { RegisterFormValues } from '@/utils/validation/authSchemas';
import { registerSchema } from '@/utils/validation/authSchemas';

export function RegisterScreen() {
  const dispatch = useAppDispatch();
  const biometricSupported = useAppSelector(selectBiometricSupported);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleBiometric(value: boolean): void {
    if (!biometricSupported) return;
    dispatch(setBiometricEnabled(value));
  }

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      username: 'aaaa',
      email: 'a@gmail.com',
      password: 'a@gmail.comA1',
      confirmPassword: 'a@gmail.comA1',
      profileImageUri: null,
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        await authService.register({
          username: values.username,
          email: values.email,
          password: values.password,
        });

        const loginResponse = await authService.login({
          username: values.username,
          password: values.password,
        });

        await dispatch(
          loginSuccess({
            accessToken: loginResponse.data.accessToken,
            refreshToken: loginResponse.data.refreshToken,
            profileImageUri: values.profileImageUri ?? null,
          }),
        );
        handleBiometric(true);
        showToast.success('Welcome aboard 🎉', 'Account created successfully');
      } catch (error) {
        const appError = handleApiError(error);
        showToast.error(appError.message);
      }
    },
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.WHITE }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-10">
            <View className="mb-8">
              <CustomText
                className="text-3xl"
                style={{ fontFamily: FONTS.BOLD, color: COLORS.TEXT_PRIMARY }}
              >
                Create
              </CustomText>
              <CustomText
                className="text-3xl"
                style={{ fontFamily: FONTS.BOLD, color: COLORS.SECONDARY }}
              >
                Account
              </CustomText>
              <CustomText className="mt-2" style={{ color: COLORS.TEXT_SECONDARY }}>
                Sign up to start learning today
              </CustomText>
            </View>

            <View className="items-center mb-8">
              <AvatarPicker
                uri={formik.values.profileImageUri ?? null}
                onPick={(uri) => formik.setFieldValue('profileImageUri', uri)}
                onRemove={() => formik.setFieldValue('profileImageUri', null)}
              />
            </View>

            <View className="mb-4">
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: COLORS.GRAY_100 }}
              >
                <CustomText className="mr-3" style={{ color: COLORS.GRAY_400 }}>
                  👤
                </CustomText>
                <TextInput
                  placeholder="Choose a username"
                  placeholderTextColor={COLORS.GRAY_400}
                  className="flex-1"
                  style={{ fontFamily: FONTS.REGULAR, color: COLORS.TEXT_PRIMARY }}
                  autoCapitalize="none"
                  returnKeyType="next"
                  value={formik.values.username}
                  onChangeText={formik.handleChange('username')}
                  onBlur={formik.handleBlur('username')}
                />
              </View>
              {formik.touched.username && formik.errors.username && (
                <CustomText className="text-sm mt-1 ml-1" style={{ color: COLORS.ERROR }}>
                  {formik.errors.username}
                </CustomText>
              )}
            </View>

            <View className="mb-4">
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: COLORS.GRAY_100 }}
              >
                <CustomText className="mr-3" style={{ color: COLORS.GRAY_400 }}>
                  📧
                </CustomText>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.GRAY_400}
                  className="flex-1"
                  style={{ fontFamily: FONTS.REGULAR, color: COLORS.TEXT_PRIMARY }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  value={formik.values.email}
                  onChangeText={formik.handleChange('email')}
                  onBlur={formik.handleBlur('email')}
                />
              </View>
              {formik.touched.email && formik.errors.email && (
                <CustomText className="text-sm mt-1 ml-1" style={{ color: COLORS.ERROR }}>
                  {formik.errors.email}
                </CustomText>
              )}
            </View>

            <View className="mb-4">
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: COLORS.GRAY_100 }}
              >
                <CustomText className="mr-3" style={{ color: COLORS.GRAY_400 }}>
                  🔒
                </CustomText>
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor={COLORS.GRAY_400}
                  secureTextEntry={!showPassword}
                  className="flex-1"
                  style={{ fontFamily: FONTS.REGULAR, color: COLORS.TEXT_PRIMARY }}
                  returnKeyType="next"
                  value={formik.values.password}
                  onChangeText={formik.handleChange('password')}
                  onBlur={formik.handleBlur('password')}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <CustomText className="ml-2" style={{ color: COLORS.GRAY_400 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </CustomText>
                </TouchableOpacity>
              </View>
              {formik.touched.password && formik.errors.password && (
                <CustomText className="text-sm mt-1 ml-1" style={{ color: COLORS.ERROR }}>
                  {formik.errors.password}
                </CustomText>
              )}
            </View>

            <View className="mb-8">
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: COLORS.GRAY_100 }}
              >
                <CustomText className="mr-3" style={{ color: COLORS.GRAY_400 }}>
                  🔒
                </CustomText>
                <TextInput
                  placeholder="Repeat your password"
                  placeholderTextColor={COLORS.GRAY_400}
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1"
                  style={{ fontFamily: FONTS.REGULAR, color: COLORS.TEXT_PRIMARY }}
                  returnKeyType="done"
                  onSubmitEditing={() => formik.handleSubmit()}
                  value={formik.values.confirmPassword}
                  onChangeText={formik.handleChange('confirmPassword')}
                  onBlur={formik.handleBlur('confirmPassword')}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <CustomText className="ml-2" style={{ color: COLORS.GRAY_400 }}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </CustomText>
                </TouchableOpacity>
              </View>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <CustomText className="text-sm mt-1 ml-1" style={{ color: COLORS.ERROR }}>
                  {formik.errors.confirmPassword}
                </CustomText>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={formik.isSubmitting}
              onPress={() => formik.handleSubmit()}
              className="rounded-full py-4 items-center mb-5"
              style={{ backgroundColor: COLORS.SECONDARY }}
            >
              <CustomText
                className="text-base"
                style={{ fontFamily: FONTS.MEDIUM, color: COLORS.WHITE }}
              >
                {formik.isSubmitting ? 'Creating account…' : 'Create Account'}
              </CustomText>
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <CustomText className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
                Already have an account?
              </CustomText>
              <TouchableOpacity
                className="ml-1"
                activeOpacity={0.7}
                onPress={() => router.replace(ROUTES.LOGIN as never)}
              >
                <CustomText
                  className="text-sm"
                  style={{ fontFamily: FONTS.BOLD, color: COLORS.SECONDARY }}
                >
                  Login
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
