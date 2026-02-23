import { Ionicons } from '@expo/vector-icons';
import { Switch, View } from 'react-native';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
import { useTheme } from '@/theme/ThemeContext';

interface ToggleRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}

export function ToggleRow({
  icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  value,
  onToggle,
  disabled = false,
  last = false,
}: ToggleRowProps) {
  const { colors } = useTheme();
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
          opacity: disabled ? 0.48 : 1,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            backgroundColor: iconBg,
          }}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        <View style={{ flex: 1 }}>
          <CustomText
            style={{ fontFamily: FONTS.MEDIUM, fontSize: 14, color: colors.TEXT_PRIMARY }}
          >
            {label}
          </CustomText>
          {sublabel ? (
            <CustomText style={{ fontSize: 12, marginTop: 2, color: colors.TEXT_SECONDARY }}>
              {sublabel}
            </CustomText>
          ) : null}
        </View>

        <Switch
          value={value}
          onValueChange={disabled ? undefined : onToggle}
          disabled={disabled}
          trackColor={{ false: colors.GRAY_200, true: colors.SECONDARY + 'BB' }}
          thumbColor={value ? colors.SECONDARY : colors.WHITE}
          ios_backgroundColor={colors.GRAY_200}
        />
      </View>

      {!last && (
        <View
          style={{ height: 1, marginLeft: 62, marginRight: 16, backgroundColor: colors.BORDER }}
        />
      )}
    </>
  );
}
