import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import { FONT_SIZES, SPACING } from '@/theme';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <View key={`${item.label}-${index}`} style={styles.crumb}>
            {!isFirst && (
              <Ionicons
                name="chevron-forward"
                size={12}
                color={COLORS.GRAY_400}
                style={styles.separator}
              />
            )}

            {isLast || !item.href ? (
              <Text style={styles.current} numberOfLines={1}>
                {item.label}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => router.push(item.href as never)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={styles.link}>{item.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  crumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: SPACING.XS,
  },
  link: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
  },
  current: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    maxWidth: 160,
  },
});
