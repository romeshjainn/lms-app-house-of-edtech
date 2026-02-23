import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
import { useTheme } from '@/theme/ThemeContext';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface TabDef {
  activeIcon: IoniconsName;
  inactiveIcon: IoniconsName;
  label: string;
}

const TABS: TabDef[] = [
  { activeIcon: 'home', inactiveIcon: 'home-outline', label: 'Home' },
  { activeIcon: 'library', inactiveIcon: 'library-outline', label: 'Courses' },
  { activeIcon: 'person-circle', inactiveIcon: 'person-circle-outline', label: 'Profile' },
  { activeIcon: 'person-circle', inactiveIcon: 'person-circle-outline', label: 'AI' },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-5 pt-2"
      style={{
        paddingBottom: Math.max(insets.bottom, 14),
        backgroundColor: colors.BACKGROUND,
      }}
    >
      <View
        className="rounded-[32px]"
        style={{
          shadowColor: isDark ? colors.PRIMARY : '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.25 : 0.09,
          shadowRadius: 22,
          elevation: 12,
        }}
      >
        <View
          className="flex-row rounded-[32px] overflow-hidden"
          style={{
            backgroundColor: colors.WHITE,
            borderWidth: 1,
            borderColor: isDark ? colors.GRAY_200 : colors.BORDER,
          }}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const tab = TABS[index];
            if (!tab) return null;

            return (
              <Pressable
                key={route.key}
                className="flex-1 items-center justify-center py-3.5"
                android_ripple={{ color: colors.PRIMARY + '28', borderless: false }}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate(route.name as never);
                  }
                }}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              >
                {isFocused && (
                  <View
                    className="absolute rounded-[20px]"
                    style={{
                      top: 6,
                      bottom: 6,
                      left: 10,
                      right: 10,
                      backgroundColor: colors.PRIMARY + '18',
                    }}
                  />
                )}

                <View className="items-center" style={{ gap: 3 }}>
                  <Ionicons
                    name={isFocused ? tab.activeIcon : tab.inactiveIcon}
                    size={22}
                    color={isFocused ? colors.PRIMARY : colors.GRAY_400}
                  />
                  <CustomText
                    style={{
                      fontFamily: isFocused ? FONTS.BOLD : FONTS.REGULAR,
                      fontSize: 10,
                      color: isFocused ? colors.PRIMARY : colors.GRAY_400,
                      letterSpacing: isFocused ? 0.2 : 0,
                    }}
                  >
                    {tab.label}
                  </CustomText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
