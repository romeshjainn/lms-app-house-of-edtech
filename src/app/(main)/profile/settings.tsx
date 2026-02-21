import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { COLORS, FONTS } from '@/constants';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '@/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App settings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    gap: SPACING.MD,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: BORDER_RADIUS.SM,
  },
  backText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
});
