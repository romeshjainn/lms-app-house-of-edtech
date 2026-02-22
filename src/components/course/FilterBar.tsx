import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';
import type { SortOption } from '@/types/course.types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ChipDef {
  value: SortOption;
  label: string;
  icon: IoniconsName;
}

const CHIPS: ChipDef[] = [
  { value: 'az',         label: 'A → Z',       icon: 'text-outline' },
  { value: 'za',         label: 'Z → A',       icon: 'text-outline' },
  { value: 'price-asc',  label: 'Price ↑',     icon: 'arrow-up-outline' },
  { value: 'price-desc', label: 'Price ↓',     icon: 'arrow-down-outline' },
];

interface FilterBarProps {
  value: SortOption | null;
  onChange: (option: SortOption | null) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {CHIPS.map((chip) => {
          const active = value === chip.value;
          return (
            <TouchableOpacity
              key={chip.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(active ? null : chip.value)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={chip.icon}
                size={13}
                color={active ? COLORS.WHITE : COLORS.TEXT_SECONDARY}
                style={styles.chipIcon}
              />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    gap: SPACING.SM,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.FULL,
    backgroundColor: COLORS.GRAY_100,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  chipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  chipLabelActive: {
    color: COLORS.WHITE,
  },
});
