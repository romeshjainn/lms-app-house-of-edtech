import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { ToggleRow } from '@/components/common/ToggleRow';
import { FONTS } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  requestNotificationAccess,
  selectBiometricEnabled,
  selectBiometricSupported,
  selectDarkMode,
  selectInactivityReminder,
  selectNotificationPerm,
  selectNotificationsEnabled,
  setBiometricEnabled,
  setDarkMode,
  setInactivityReminder,
  setNotificationsEnabled,
} from '@/store/slices/preferences.slice';
import { useTheme } from '@/theme/ThemeContext';

const APP_VERSION = '1.0.0';
const DEVELOPER = 'Romesh Jain';
const LINKEDIN_URL = 'https://www.linkedin.com/in/romeshjain/';

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <CustomText
      style={{
        fontFamily: FONTS.MEDIUM,
        fontSize: 11,
        paddingHorizontal: 4,
        marginBottom: 10,
        color: colors.TEXT_SECONDARY,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}
    >
      {title}
    </CustomText>
  );
}

interface InfoRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  last?: boolean;
  onPress?: () => void;
}

function InfoRow({ icon, iconBg, iconColor, label, value, last = false, onPress }: InfoRowProps) {
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity activeOpacity={onPress ? 0.6 : 1} onPress={onPress} disabled={!onPress}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 16,
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

          <CustomText
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: FONTS.MEDIUM,
              color: colors.TEXT_PRIMARY,
            }}
          >
            {label}
          </CustomText>

          <CustomText
            style={{
              fontSize: 14,
              color: onPress ? colors.PRIMARY : colors.TEXT_SECONDARY,
              fontFamily: onPress ? FONTS.MEDIUM : FONTS.REGULAR,
            }}
          >
            {value}
          </CustomText>
        </View>
      </TouchableOpacity>

      {!last && (
        <View
          style={{
            height: 1,
            marginLeft: 62,
            marginRight: 16,
            backgroundColor: colors.BORDER,
          }}
        />
      )}
    </>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: colors.BORDER,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector(selectDarkMode);
  const notificationsEnabled = useAppSelector(selectNotificationsEnabled);
  const notificationPerm = useAppSelector(selectNotificationPerm);
  const inactivityReminder = useAppSelector(selectInactivityReminder);
  const biometricEnabled = useAppSelector(selectBiometricEnabled);
  const biometricSupported = useAppSelector(selectBiometricSupported);

  function handleDarkMode(value: boolean): void {
    dispatch(setDarkMode(value));
  }

  async function handleNotifications(value: boolean): Promise<void> {
    if (!value) {
      dispatch(setInactivityReminder(value));
      dispatch(setNotificationsEnabled(false));
      return;
    }
    if (notificationPerm === 'granted') {
      dispatch(setNotificationsEnabled(true));
      return;
    }
    if (notificationPerm === 'denied') {
      Alert.alert(
        'Permission Required',
        'Notifications are blocked. To enable them, go to your device Settings and allow notifications for this app.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    await dispatch(requestNotificationAccess());
  }

  function handleInactivityReminder(value: boolean): void {
    dispatch(setInactivityReminder(value));
  }

  function handleBiometric(value: boolean): void {
    if (!biometricSupported) return;
    dispatch(setBiometricEnabled(value));
  }

  function getNotificationSublabel(): string {
    if (notificationPerm === 'denied') return 'Permission denied · Open Settings to enable';
    if (notificationPerm === 'undetermined') return 'Tap to allow notification access';
    return notificationsEnabled
      ? 'Bookmark course notification'
      : 'Notifications are currently paused';
  }

  function getBiometricSublabel(): string {
    if (!biometricSupported) return 'Not supported on this device';
    return biometricEnabled
      ? 'App will prompt biometrics on launch'
      : 'Use biometrics to unlock the app';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.BACKGROUND }} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: colors.WHITE,
          borderBottomWidth: 1,
          borderBottomColor: colors.BORDER,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: colors.GRAY_100,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>

        <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 18, color: colors.TEXT_PRIMARY }}>
          Settings
        </CustomText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 56 }}
      >
        <View style={{ marginBottom: 24 }}>
          <SectionLabel title="Appearance" />
          <SettingsCard>
            <ToggleRow
              icon="moon-outline"
              iconBg={colors.SECONDARY_LIGHT}
              iconColor={colors.SECONDARY}
              label="Dark Mode"
              sublabel="Switch to dark theme"
              value={darkMode}
              onToggle={handleDarkMode}
              last
            />
          </SettingsCard>
        </View>

        <View style={{ marginBottom: 24 }}>
          <SectionLabel title="Notifications" />
          <SettingsCard>
            <ToggleRow
              icon="notifications-outline"
              iconBg={colors.PRIMARY + '18'}
              iconColor={colors.PRIMARY}
              label="Enable Notifications"
              sublabel={getNotificationSublabel()}
              value={notificationsEnabled && notificationPerm === 'granted'}
              onToggle={handleNotifications}
            />
            <ToggleRow
              icon="alarm-outline"
              iconBg={colors.ACCENT + '18'}
              iconColor={colors.ACCENT}
              label="Inactivity Reminder"
              sublabel="Remind me after 24 hours of inactivity"
              value={inactivityReminder}
              onToggle={handleInactivityReminder}
              disabled={!notificationsEnabled || notificationPerm !== 'granted'}
              last
            />
          </SettingsCard>
        </View>

        <View style={{ marginBottom: 24 }}>
          <SectionLabel title="Security" />
          <SettingsCard>
            <ToggleRow
              icon="finger-print-outline"
              iconBg={colors.SUCCESS + '18'}
              iconColor={colors.SUCCESS}
              label="Fingerprint Unlock"
              sublabel={getBiometricSublabel()}
              value={biometricEnabled}
              onToggle={handleBiometric}
              disabled={!biometricSupported}
              last
            />
          </SettingsCard>
        </View>

        <View style={{ marginBottom: 8 }}>
          <SectionLabel title="About" />
          <SettingsCard>
            <InfoRow
              icon="phone-portrait-outline"
              iconBg={colors.INFO_LIGHT}
              iconColor={colors.INFO}
              label="App Version"
              value={`v${APP_VERSION}`}
            />
            <InfoRow
              icon="code-slash-outline"
              iconBg={colors.GRAY_100}
              iconColor={colors.GRAY_500}
              label="Developer"
              value={DEVELOPER}
              onPress={async () => {
                const url = LINKEDIN_URL;
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  Linking.openURL(url);
                }
              }}
              last
            />
          </SettingsCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
