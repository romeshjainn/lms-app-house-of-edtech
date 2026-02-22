import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '@/theme';

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace(ROUTES.HOME)}
        >
          <Text style={styles.primaryButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push(ROUTES.LOGIN)}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
});
