import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFormik } from 'formik';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useAppDispatch } from '@/store';
import { loginSuccess } from '@/store/slices/auth.slice';
import { useOrientation } from '@/hooks/use-orientation';
import { authService } from '@/services/api/modules/auth.service';
import { handleApiError } from '@/services/api/error-handler';
import { registerSchema } from '@/utils/validation/authSchemas';
import { showToast } from '@/utils/toast';
import { FormInput } from '@/components/form/FormInput';
import { SubmitButton } from '@/components/form/SubmitButton';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import type { RegisterFormValues } from '@/utils/validation/authSchemas';

const CARD_RADIUS = 36;

function IllustrationSection({ landscape }: { landscape: boolean }) {
  return (
    <View style={[styles.illustrationSection, landscape && styles.illustrationSectionLandscape]}>
      <View style={styles.glow} />

      <View style={[styles.decoBadge, styles.decoTopLeft]}>
        <Ionicons name="school-outline" size={16} color={COLORS.WHITE} />
      </View>
      <View style={[styles.decoBadge, styles.decoTopRight]}>
        <Ionicons name="trophy-outline" size={16} color={COLORS.WHITE} />
      </View>
      <View style={[styles.decoBadge, styles.decoBottomLeft]}>
        <Ionicons name="rocket-outline" size={14} color={COLORS.WHITE} />
      </View>

      <View style={styles.centerIllustration}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <Ionicons name="person-add" size={56} color="rgba(255,255,255,0.4)" />
          </View>
        </View>
        <Text style={styles.illustrationLabel}>Join thousands of learners</Text>
      </View>
    </View>
  );
}

export function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { isLandscape } = useOrientation();

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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

        showToast.success(
          'Your account is ready. Start learning!',
          'Welcome aboard 🎉',
        );
      } catch (error) {
        const appError = handleApiError(error);
        showToast.error(appError.message);
      }
    },
  });

  const form = (
    <>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Create Account</Text>
        <Text style={styles.formSubtitle}>
          Fill in the details below to get started
        </Text>
      </View>

      <AvatarPicker
        uri={formik.values.profileImageUri ?? null}
        onPick={(uri) => formik.setFieldValue('profileImageUri', uri)}
        onRemove={() => formik.setFieldValue('profileImageUri', null)}
      />

      <FormInput
        label="Username"
        leadIcon="person-outline"
        placeholder="Choose a username"
        autoCapitalize="none"
        returnKeyType="next"
        value={formik.values.username}
        onChangeText={formik.handleChange('username')}
        onBlur={formik.handleBlur('username')}
        error={formik.errors.username}
        touched={formik.touched.username}
      />

      <FormInput
        label="Email"
        leadIcon="mail-outline"
        placeholder="Enter your email"
        keyboardType="email-address"
        returnKeyType="next"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        error={formik.errors.email}
        touched={formik.touched.email}
      />

      <FormInput
        label="Password"
        leadIcon="lock-closed-outline"
        placeholder="Create a password"
        isPassword
        returnKeyType="next"
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        onBlur={formik.handleBlur('password')}
        error={formik.errors.password}
        touched={formik.touched.password}
      />

      <FormInput
        label="Confirm Password"
        leadIcon="lock-closed-outline"
        placeholder="Repeat your password"
        isPassword
        returnKeyType="done"
        onSubmitEditing={() => formik.handleSubmit()}
        value={formik.values.confirmPassword}
        onChangeText={formik.handleChange('confirmPassword')}
        onBlur={formik.handleBlur('confirmPassword')}
        error={formik.errors.confirmPassword}
        touched={formik.touched.confirmPassword}
      />

      <SubmitButton
        label="Create Account"
        onPress={() => formik.handleSubmit()}
        isLoading={formik.isSubmitting}
        disabled={formik.isSubmitting}
        style={styles.submitBtn}
      />

      <View style={styles.loginRow}>
        <Text style={styles.loginPrompt}>Already have an account?</Text>
        <TouchableOpacity
          onPress={() => router.replace(ROUTES.LOGIN as never)}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLink}> Login</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {isLandscape ? (
            <View style={styles.landscape}>
              <IllustrationSection landscape />
              <ScrollView
                style={[styles.card, styles.cardLandscape]}
                contentContainerStyle={styles.cardContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <SafeAreaView edges={['bottom', 'right']}>
                  {form}
                </SafeAreaView>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.portrait}>
              <IllustrationSection landscape={false} />
              <ScrollView
                style={styles.card}
                contentContainerStyle={styles.cardContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <SafeAreaView edges={['bottom']}>{form}</SafeAreaView>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  safeArea: {
    flex: 1,
  },
  portrait: {
    flex: 1,
  },
  landscape: {
    flex: 1,
    flexDirection: 'row',
  },

  illustrationSection: {
    flex: 0.38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationSectionLandscape: {
    flex: 42,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decoBadge: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.SM,
  },
  decoTopLeft: { top: SPACING.LG, left: SPACING.XL, transform: [{ rotate: '-10deg' }] },
  decoTopRight: { top: SPACING.MD, right: SPACING.XL, transform: [{ rotate: '12deg' }] },
  decoBottomLeft: { bottom: SPACING.LG, left: SPACING.LG, transform: [{ rotate: '-8deg' }] },
  centerIllustration: {
    alignItems: 'center',
    gap: SPACING.SM,
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
  },

  card: {
    flex: 62,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    ...SHADOWS.XL,
  },
  cardLandscape: {
    flex: 58,
    borderTopLeftRadius: CARD_RADIUS,
    borderBottomLeftRadius: CARD_RADIUS,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContent: {
    padding: SPACING.LG,
    paddingTop: SPACING.XL,
    gap: SPACING.MD,
    paddingBottom: SPACING.XL,
  },

  formHeader: {
    gap: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  formTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: COLORS.TEXT_PRIMARY,
  },
  formSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: FONT_SIZES.SM * 1.6,
  },

  submitBtn: {
    marginTop: SPACING.XS,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.XS,
  },
  loginPrompt: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  loginLink: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.SECONDARY,
  },
});
