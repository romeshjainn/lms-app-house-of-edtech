import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Image } from 'expo-image';

import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { FONTS, ROUTES } from '@/constants';
import { ANALYTICS_EVENTS, getAnalytics } from '@/services/analytics.service';
import { authService } from '@/services/api/modules/auth.service';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, mergeProfileImage } from '@/store/slices/auth.slice';
import { useTheme } from '@/theme/ThemeContext';
import { clearAppStorage } from '@/utils/storage.utils';
import { showToast } from '@/utils/toast';
import { useCallback, useState } from 'react';

interface MenuRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
  danger?: boolean;
  last?: boolean;
}

function MenuRow({
  icon,
  label,
  sublabel,
  onPress,
  iconBg,
  iconColor,
  danger = false,
  last = false,
}: MenuRowProps) {
  const { colors } = useTheme();
  const bg = iconBg ?? colors.SECONDARY_LIGHT;
  const ic = iconColor ?? colors.SECONDARY;

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        onPress={onPress}
        activeOpacity={0.65}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            backgroundColor: danger ? colors.ERROR_LIGHT : bg,
          }}
        >
          <Ionicons name={icon} size={18} color={danger ? colors.ERROR : ic} />
        </View>

        <View style={{ flex: 1 }}>
          <CustomText
            style={{
              fontFamily: FONTS.MEDIUM,
              fontSize: 14,
              color: danger ? colors.ERROR : colors.TEXT_PRIMARY,
            }}
          >
            {label}
          </CustomText>
          {sublabel && (
            <CustomText style={{ fontSize: 12, marginTop: 2, color: colors.TEXT_SECONDARY }}>
              {sublabel}
            </CustomText>
          )}
        </View>

        {!danger && <Ionicons name="chevron-forward" size={15} color={colors.GRAY_300} />}
      </TouchableOpacity>

      {!last && (
        <View
          style={{ height: 1, marginLeft: 62, marginRight: 16, backgroundColor: colors.BORDER }}
        />
      )}
    </>
  );
}

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

function StatItem({
  label,
  value,
  color,
  showDivider,
}: {
  label: string;
  value: string | number;
  color: string;
  showDivider: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 24, color }}>{value}</CustomText>
      <CustomText style={{ fontSize: 12, color: colors.TEXT_SECONDARY }}>{label}</CustomText>
      {showDivider && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 6,
            bottom: 6,
            width: 1,
            backgroundColor: colors.BORDER,
          }}
        />
      )}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
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

function GuestProfile() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <StatusBar style="auto" />
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <View
          style={{
            width: 112,
            height: 112,
            borderRadius: 56,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            backgroundColor: colors.SECONDARY_LIGHT,
          }}
        >
          <Ionicons name="person-outline" size={52} color={colors.SECONDARY} />
        </View>

        <CustomText
          style={{
            fontFamily: FONTS.BOLD,
            fontSize: 24,
            color: colors.TEXT_PRIMARY,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Browsing as Guest
        </CustomText>
        <CustomText
          style={{
            fontSize: 14,
            color: colors.TEXT_SECONDARY,
            lineHeight: 22,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Create an account or log in to access your profile, track your progress, and save your
          courses.
        </CustomText>

        <View style={{ width: '100%', gap: 10 }}>
          <TouchableOpacity
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              backgroundColor: colors.SECONDARY,
            }}
            onPress={() => router.push(ROUTES.LOGIN as never)}
            activeOpacity={0.85}
          >
            <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 16, color: '#FFFFFF' }}>
              Login
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: colors.SECONDARY,
            }}
            onPress={() => router.push(ROUTES.REGISTER as never)}
            activeOpacity={0.85}
          >
            <CustomText style={{ fontFamily: FONTS.MEDIUM, fontSize: 16, color: colors.SECONDARY }}>
              Create Account
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { user, isGuest } = useAppSelector((state) => state.auth);

  const [analyticsStats, setAnalyticsStats] = useState<
    { label: string; value: number; color: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadAnalytics() {
        const analytics = await getAnalytics();

        if (!isActive) return;

        setAnalyticsStats([
          {
            label: 'AI Questions',
            value: analytics[ANALYTICS_EVENTS.AI_QUESTION] ?? 0,
            color: colors.ACCENT,
          },
          {
            label: 'App Opens',
            value: analytics[ANALYTICS_EVENTS.APP_OPEN] ?? 0,
            color: colors.INFO,
          },
          {
            label: 'Bookmarks Added',
            value: analytics[ANALYTICS_EVENTS.BOOKMARK_ADDED] ?? 0,
            color: colors.SECONDARY,
          },
          {
            label: 'Enroll Actions',
            value: analytics[ANALYTICS_EVENTS.ENROLLMENT_ADDED] ?? 0,
            color: colors.PRIMARY,
          },
        ]);
      }

      loadAnalytics();

      return () => {
        isActive = false;
      };
    }, [colors]),
  );
  if (isGuest || !user) return <GuestProfile />;

  const avatarSource = user.profileImageUri || user.avatarUrl;
  const initials = user.username
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleBadgeColor =
    user.role === 'ADMIN'
      ? colors.ERROR
      : user.role === 'instructor'
        ? colors.ACCENT
        : colors.SUCCESS;

  async function handlePickImage() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permission required',
        'Allow access to your photo library to change your profile picture.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await dispatch(mergeProfileImage(result.assets[0].uri));
      showToast.success('Profile photo updated.');
    }
  }

  function confirmLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: handleLogout },
    ]);
  }

  async function handleLogout() {
    try {
      await authService.logoutSession();
    } catch {}

    await clearAppStorage();
    await dispatch(logout());

    showToast.success('You have been logged out.', 'Goodbye!');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.BACKGROUND }} edges={['top']}>
      <StatusBar style="auto" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 56 }}
      >
        <View
          style={{
            alignItems: 'center',
            paddingTop: 40,
            paddingBottom: 32,
            paddingHorizontal: 20,
            backgroundColor: colors.WHITE,
          }}
        >
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.88}
            style={{ marginBottom: 18 }}
          >
            {avatarSource ? (
              <Image
                source={{ uri: avatarSource }}
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: 54,
                  borderWidth: 3.5,
                  borderColor: colors.SECONDARY_LIGHT,
                }}
                contentFit="cover"
                cachePolicy="disk"
                transition={200}
              />
            ) : (
              <View
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: 54,
                  backgroundColor: colors.SECONDARY,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 36, color: '#FFFFFF' }}>
                  {initials}
                </CustomText>
              </View>
            )}

            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.SECONDARY,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2.5,
                borderColor: colors.WHITE,
              }}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <CustomText style={{ fontFamily: FONTS.BOLD, fontSize: 22, color: colors.TEXT_PRIMARY }}>
            {user.username}
          </CustomText>
          <CustomText style={{ color: colors.TEXT_SECONDARY, fontSize: 13, marginTop: 4 }}>
            {user.email}
          </CustomText>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 99,
                backgroundColor: roleBadgeColor + '1A',
              }}
            >
              <CustomText
                style={{
                  fontFamily: FONTS.MEDIUM,
                  fontSize: 12,
                  color: roleBadgeColor,
                  letterSpacing: 0.5,
                }}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
              </CustomText>
            </View>

            {user.isEmailVerified && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color={colors.SUCCESS} />
                <CustomText style={{ fontSize: 12, color: colors.SUCCESS }}>Verified</CustomText>
              </View>
            )}
          </View>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <SectionLabel title="Your Analytics" />
          <Card>
            <View style={styles.statsGrid}>
              {analyticsStats.map((item, index) => (
                <View key={item.label} style={styles.statWrapper}>
                  <StatItem
                    label={item.label}
                    value={item.value}
                    color={item.color}
                    showDivider={false}
                  />
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 28 }}>
          <SectionLabel title="Account" />
          <Card>
            <MenuRow
              icon="book-outline"
              label="My Courses"
              sublabel="View enrolled courses"
              onPress={() => router.push(ROUTES.MY_COURSES as never)}
              iconBg={colors.PRIMARY + '18'}
              iconColor={colors.PRIMARY}
            />
            <MenuRow
              icon="bookmark-outline"
              label="Bookmarks"
              sublabel="Saved for later"
              onPress={() => router.push(ROUTES.BOOKMARKS as never)}
              iconBg={colors.ACCENT + '18'}
              iconColor={colors.ACCENT}
            />
            <MenuRow
              icon="settings-outline"
              label="Settings"
              sublabel="App preferences"
              onPress={() => router.push(ROUTES.SETTINGS as never)}
              last
            />
          </Card>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Card>
            <MenuRow icon="log-out-outline" label="Log out" onPress={confirmLogout} danger last />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  statWrapper: {
    width: '48%', // 2 columns
    marginBottom: 16,
  },
});
