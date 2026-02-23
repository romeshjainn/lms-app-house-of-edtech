import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';
import type { SortOption } from '@/types/course.types';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface ChipDef {
  value: SortOption;
  label: string;
  icon: IoniconsName;
}

const CHIPS: ChipDef[] = [
  { value: 'az', label: 'A → Z', icon: 'text-outline' },
  { value: 'za', label: 'Z → A', icon: 'text-outline' },
  { value: 'price-asc', label: 'Price ↑', icon: 'arrow-up-outline' },
  { value: 'price-desc', label: 'Price ↓', icon: 'arrow-down-outline' },
];

interface FilterBarProps {
  value: SortOption | null;
  onChange: (option: SortOption | null) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: colors.BORDER,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: SPACING.MD,
          paddingVertical: SPACING.SM,
          gap: SPACING.SM,
        }}
      >
        {CHIPS.map((chip) => {
          const active = value === chip.value;

          return (
            <TouchableOpacity
              key={chip.value}
              activeOpacity={0.8}
              onPress={() => onChange(active ? null : chip.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.SM,
                paddingVertical: 6,
                borderRadius: BORDER_RADIUS.FULL,
                backgroundColor: active ? colors.PRIMARY : isDark ? colors.WHITE : colors.GRAY_100,
                borderWidth: 1,
                borderColor: active ? colors.PRIMARY : colors.BORDER,
              }}
            >
              <Ionicons
                name={chip.icon}
                size={13}
                color={active ? colors.WHITE : colors.TEXT_PRIMARY}
                style={{ marginRight: 4 }}
              />

              <CustomText
                style={{
                  fontFamily: FONTS.MEDIUM,
                  fontSize: FONT_SIZES.SM,
                  color: active ? colors.WHITE : colors.TEXT_PRIMARY,
                }}
              >
                {chip.label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
