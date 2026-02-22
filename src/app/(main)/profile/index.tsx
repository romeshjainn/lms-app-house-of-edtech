import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { BORDER_RADIUS, FONT_SIZES, SHADOWS, SPACING } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/auth.slice';
import { authService } from '@/services/api/modules/auth.service';
import { showToast } from '@/utils/toast';
import { AppButton } from '@/components/common/AppButton';

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 100;

interface AvatarProps {
  profileImageUri: string | null;
  avatarUrl: string | null;
  username: string;
}

function Avatar({ profileImageUri, avatarUrl, username }: AvatarProps) {
  const uri = profileImageUri ?? (avatarUrl || null);

  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} />;
  }

  // Initials fallback
  const initials = username
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

// ─── Row Item ────────────────────────────────────────────────────────────────

interface RowItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function RowItem({ icon, label, onPress, danger = false }: RowItemProps) {
  return (
    <TouchableOpacity style={styles.rowItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIconWrap, danger && styles.rowIconWrapDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? COLORS.ERROR : COLORS.SECONDARY}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.GRAY_400} />
      )}
    </TouchableOpacity>
  );
}

// ─── Guest view ───────────────────────────────────────────────────────────────

function GuestProfile() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guestContainer}>
        <View style={styles.guestIconWrap}>
          <Ionicons name="person-outline" size={56} color={COLORS.GRAY_300} />
        </View>
        <Text style={styles.guestTitle}>Browsing as Guest</Text>
        <Text style={styles.guestSubtitle}>
          Create an account or log in to access your profile, track progress, and
          save your courses.
        </Text>
        <View style={styles.guestActions}>
          <AppButton
            label="Login"
            variant="secondary"
            onPress={() => router.push(ROUTES.LOGIN as never)}
          />
          <AppButton
            label="Create Account"
            variant="outline"
            onPress={() => router.push(ROUTES.REGISTER as never)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, isGuest } = useAppSelector((state) => state.auth);

  if (isGuest || !user) {
    return <GuestProfile />;
  }

  function confirmLogout() {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: handleLogout },
      ],
    );
  }

  async function handleLogout() {
    try {
      // Best-effort server-side session invalidation
      await authService.logoutSession();
    } catch {
      // Ignore — we always clear local state regardless
    }

    await dispatch(logout());
    showToast.success('You have been logged out.', 'Goodbye!');
    // NavigationGuard redirects to login automatically
  }

  const roleBadgeColor =
    user.role === 'ADMIN'
      ? COLORS.ERROR
      : user.role === 'instructor'
        ? COLORS.ACCENT
        : COLORS.SUCCESS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Avatar
            profileImageUri={user.profileImageUri}
            avatarUrl={user.avatarUrl}
            username={user.username}
          />

          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={[styles.roleBadge, { backgroundColor: roleBadgeColor + '22' }]}>
            <Text style={[styles.roleText, { color: roleBadgeColor }]}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
            </Text>
          </View>

          {user.isEmailVerified && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.SUCCESS} />
              <Text style={styles.verifiedText}>Email verified</Text>
            </View>
          )}
        </View>

        {/* ── Account section ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <RowItem
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push(ROUTES.SETTINGS as never)}
            />
          </View>
        </View>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <RowItem
              icon="log-out-outline"
              label="Log out"
              onPress={confirmLogout}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scroll: {
    paddingBottom: SPACING.XXL,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: SPACING.XL,
    paddingBottom: SPACING.LG,
    paddingHorizontal: SPACING.LG,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: SPACING.XS,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.SECONDARY_LIGHT,
    marginBottom: SPACING.SM,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  avatarInitials: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: COLORS.WHITE,
  },
  username: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
  },
  email: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  roleBadge: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS / 2,
    borderRadius: BORDER_RADIUS.FULL,
    marginTop: SPACING.XS,
  },
  roleText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    letterSpacing: 0.5,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.XS,
  },
  verifiedText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: COLORS.SUCCESS,
  },

  // ── Sections ────────────────────────────────────────────────────────────────
  section: {
    marginTop: SPACING.LG,
    paddingHorizontal: SPACING.LG,
    gap: SPACING.SM,
  },
  sectionTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
    ...SHADOWS.SM,
  },

  // ── Row items ────────────────────────────────────────────────────────────────
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    gap: SPACING.MD,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.SECONDARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconWrapDanger: {
    backgroundColor: COLORS.ERROR_LIGHT,
  },
  rowLabel: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  rowLabelDanger: {
    color: COLORS.ERROR,
  },

  // ── Guest ───────────────────────────────────────────────────────────────────
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
    gap: SPACING.MD,
  },
  guestIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  guestTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: FONT_SIZES.SM * 1.6,
  },
  guestActions: {
    width: '100%',
    gap: SPACING.SM,
    marginTop: SPACING.SM,
  },
});
