import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '@/constants';
import { FONT_SIZES, SPACING } from '@/theme';

export default function MyCourseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Courses</Text>
        <Text style={styles.subtitle}>My courses</Text>
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
    gap: SPACING.XS,
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
