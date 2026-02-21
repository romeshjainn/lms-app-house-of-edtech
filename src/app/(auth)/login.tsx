import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '@/theme';
import { useAppDispatch } from '@/store';
import { enterGuestMode } from '@/store/slices/auth.slice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();

  function handleContinueAsGuest() {
    dispatch(enterGuestMode());
    router.replace(ROUTES.HOME);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace(ROUTES.HOME)}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleContinueAsGuest}
        >
          <Text style={styles.guestButtonText}>Continue without login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push(ROUTES.REGISTER)}>
          <Text style={styles.linkText}>Don&apos;t have an account? Register</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.LG,
    justifyContent: 'space-between',
    paddingBottom: SPACING.XL,
  },
  header: {
    marginTop: SPACING.XXL,
    gap: SPACING.XS,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXXL,
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  actions: {
    gap: SPACING.MD,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
  linkText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  guestButton: {
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  guestButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
});
