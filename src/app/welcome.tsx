import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '@/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Your learning journey starts here.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push(ROUTES.LOGIN)}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push(ROUTES.REGISTER)}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.SM,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.HERO,
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
  },
  actions: {
    gap: SPACING.SM,
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
  secondaryButton: {
    backgroundColor: COLORS.TRANSPARENT,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  secondaryButtonText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.PRIMARY,
  },
});
