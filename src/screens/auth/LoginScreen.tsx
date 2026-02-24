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
import { COLORS, FONTS, ROUTES } from '@/constants';
import { handleApiError } from '@/services/api/error-handler';
import { authService } from '@/services/api/modules/auth.service';
import { useAppDispatch, useAppSelector } from '@/store';
import { enterGuestMode, loginSuccess } from '@/store/slices/auth.slice';
import { selectBiometricSupported, setBiometricEnabled } from '@/store/slices/preferences.slice';
import { showToast } from '@/utils/toast';
import type { LoginFormValues } from '@/utils/validation/authSchemas';
import { loginSchema } from '@/utils/validation/authSchemas';

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const biometricSupported = useAppSelector(selectBiometricSupported);

  const [showPassword, setShowPassword] = useState(false);

  function handleBiometric(value: boolean): void {
    if (!biometricSupported) return;
    dispatch(setBiometricEnabled(value));
  }

  const formik = useFormik<LoginFormValues>({
    initialValues: { username: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const response = await authService.login(values);
        await dispatch(
          loginSuccess({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        handleBiometric(true);
        showToast.success('Welcome back!', 'Login successful');
      } catch (error) {
        const appError = handleApiError(error);
        showToast.error(appError.message);
      }
    },
  });

  async function handleGuestMode() {
    await dispatch(enterGuestMode()).unwrap();
    router.replace(ROUTES.HOME as never);
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.WHITE }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center py-10">
            <View className="mb-10">
              <CustomText
                className="text-3xl"
                style={{ fontFamily: FONTS.BOLD, color: COLORS.TEXT_PRIMARY }}
              >
                Welcome
              </CustomText>
              <CustomText
                className="text-3xl"
                style={{ fontFamily: FONTS.BOLD, color: COLORS.PRIMARY }}
              >
                back!
              </CustomText>
              <CustomText className="mt-2" style={{ color: COLORS.TEXT_SECONDARY }}>
                Sign in to access your courses and progress
              </CustomText>
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
                  placeholder="Enter your username"
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

            <View className="mb-10">
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: COLORS.GRAY_100 }}
              >
                <CustomText className="mr-3" style={{ color: COLORS.GRAY_400 }}>
                  🔒
                </CustomText>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.GRAY_400}
                  secureTextEntry={!showPassword}
                  className="flex-1"
                  style={{ fontFamily: FONTS.REGULAR, color: COLORS.TEXT_PRIMARY }}
                  returnKeyType="done"
                  onSubmitEditing={() => formik.handleSubmit()}
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

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={formik.isSubmitting}
              onPress={() => formik.handleSubmit()}
              className="rounded-full py-4 items-center mb-5"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              <CustomText
                className="text-base"
                style={{ fontFamily: FONTS.MEDIUM, color: COLORS.WHITE }}
              >
                {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGuestMode}
              className="items-center mb-4"
            >
              <CustomText
                className="text-sm"
                style={{ fontFamily: FONTS.MEDIUM, color: COLORS.TEXT_SECONDARY }}
              >
                Continue without login
              </CustomText>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
              <CustomText className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
                {"Don't have an account?"}
              </CustomText>
              <TouchableOpacity
                className="ml-1"
                activeOpacity={0.7}
                onPress={() => router.push(ROUTES.REGISTER as never)}
              >
                <CustomText
                  className="text-sm"
                  style={{ fontFamily: FONTS.BOLD, color: COLORS.PRIMARY }}
                >
                  Create an account
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
