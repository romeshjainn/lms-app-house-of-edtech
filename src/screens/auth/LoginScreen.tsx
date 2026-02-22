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
import { enterGuestMode, loginSuccess } from '@/store/slices/auth.slice';
import { useOrientation } from '@/hooks/use-orientation';
import { authService } from '@/services/api/modules/auth.service';
import { handleApiError } from '@/services/api/error-handler';
import { loginSchema } from '@/utils/validation/authSchemas';
import { showToast } from '@/utils/toast';
import { FormInput } from '@/components/form/FormInput';
import { SubmitButton } from '@/components/form/SubmitButton';
import { AppButton } from '@/components/common/AppButton';
import type { LoginFormValues } from '@/utils/validation/authSchemas';

const CARD_RADIUS = 36;
const ICON_SIZE = 18;

interface FloatingBadgeProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  style: object;
  size?: number;
  rotate?: string;
}

function FloatingBadge({ icon, style, size = 18, rotate = '0deg' }: FloatingBadgeProps) {
  return (
    <View style={[styles.badge, { transform: [{ rotate }] }, style]}>
      <Ionicons name={icon} size={size} color={COLORS.WHITE} />
    </View>
  );
}

function IllustrationSection({ landscape }: { landscape: boolean }) {
  return (
    <View style={[styles.illustrationSection, landscape && styles.illustrationSectionLandscape]}>
      <View style={styles.glow} />
      <FloatingBadge icon="book"   style={styles.badgeTopLeft}    rotate="-12deg" />
      <FloatingBadge icon="laptop" style={styles.badgeTopRight}   rotate="10deg" size={16} />
      <FloatingBadge icon="bulb"   style={styles.badgeMidRight}   rotate="8deg"  size={14} />
      <FloatingBadge icon="star"   style={styles.badgeBottomLeft} rotate="-8deg" size={14} />
      <View style={styles.illustrationPlaceholder}>
        <View style={styles.placeholderInner}>
          <Ionicons name="person" size={72} color="rgba(255,255,255,0.35)" />
        </View>
      </View>
    </View>
  );
}

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLandscape } = useOrientation();

  const formik = useFormik<LoginFormValues>({
    initialValues: { username: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const response = await authService.login(values);
        console.log(response, 'login-resoponse')

        await dispatch(
          loginSuccess({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );

        showToast.success('Welcome back!', 'Login successful');
      } catch (error) {
        const appError = handleApiError(error);
        showToast.error(appError.message);
      }
    },
  });

  function handleGuestMode() {
    dispatch(enterGuestMode());
  }

  const form = (
    <>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Welcome Back!</Text>
        <Text style={styles.formSubtitle}>
          Sign in to continue your learning journey
        </Text>
      </View>

      <FormInput
        label="Username"
        leadIcon="person-outline"
        placeholder="Enter your username"
        autoCapitalize="none"
        returnKeyType="next"
        value={formik.values.username}
        onChangeText={formik.handleChange('username')}
        onBlur={formik.handleBlur('username')}
        error={formik.errors.username}
        touched={formik.touched.username}
      />

      <FormInput
        label="Password"
        leadIcon="lock-closed-outline"
        placeholder="Enter your password"
        isPassword
        returnKeyType="done"
        onSubmitEditing={() => formik.handleSubmit()}
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        onBlur={formik.handleBlur('password')}
        error={formik.errors.password}
        touched={formik.touched.password}
      />

      <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <SubmitButton
        label="Login"
        onPress={() => formik.handleSubmit()}
        isLoading={formik.isSubmitting}
        disabled={formik.isSubmitting}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <AppButton
        variant="ghost"
        label="Continue without login"
        leftIcon="person-outline"
        onPress={handleGuestMode}
      />

      <View style={styles.registerRow}>
        <Text style={styles.registerPrompt}>Don&apos;t have an account?</Text>
        <TouchableOpacity
          onPress={() => router.push(ROUTES.REGISTER as never)}
          activeOpacity={0.7}
        >
          <Text style={styles.registerLink}> Register</Text>
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
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationSectionLandscape: {
    flex: 45,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.SM,
  },
  badgeTopLeft: { top: SPACING.XL, left: SPACING.XL },
  badgeTopRight: { top: SPACING.LG, right: SPACING.XL },
  badgeMidRight: { bottom: SPACING.XXL, right: SPACING.MD, width: 38, height: 38 },
  badgeBottomLeft: { bottom: SPACING.XL, left: SPACING.LG, width: 36, height: 36 },
  illustrationPlaceholder: {
    alignItems: 'center',
    gap: SPACING.SM,
  },
  placeholderInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    flex: 55,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    ...SHADOWS.XL,
  },
  cardLandscape: {
    flex: 55,
    borderTopLeftRadius: CARD_RADIUS,
    borderBottomLeftRadius: CARD_RADIUS,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContent: {
    padding: SPACING.LG,
    paddingTop: SPACING.XL,
    gap: SPACING.MD,
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

  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.XS,
  },
  forgotText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.SECONDARY,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dividerLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.XS,
  },
  registerPrompt: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  registerLink: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.SECONDARY,
  },
});
