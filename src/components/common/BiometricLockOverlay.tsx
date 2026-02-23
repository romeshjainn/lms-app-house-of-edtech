import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/base/AppText';
import { COLORS, FONTS } from '@/constants';
import { biometricService } from '@/services/biometric.service';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/auth.slice';
import { selectBiometricEnabled, selectBiometricSupported } from '@/store/slices/preferences.slice';

const MAX_FAIL_COUNT = 5;
const AUTH_PROMPT_TEXT = 'Verify your identity to access the app';

export function BiometricLockOverlay(): ReactElement | null {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);
  const biometricEnabled = useAppSelector(selectBiometricEnabled);
  const biometricSupported = useAppSelector(selectBiometricSupported);

  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const initializedRef = useRef(false);
  const isAuthenticatingRef = useRef(false);
  const failCountRef = useRef(0);

  async function triggerAuth(): Promise<void> {
    if (isAuthenticatingRef.current) return;

    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);
    setHasFailed(false);

    const result = await biometricService.authenticate(AUTH_PROMPT_TEXT);

    isAuthenticatingRef.current = false;
    setIsAuthenticating(false);

    if (result.success) {
      failCountRef.current = 0;
      setIsLocked(false);
      return;
    }

    if (result.cancelled) return;

    failCountRef.current += 1;
    setHasFailed(true);

    if (failCountRef.current >= MAX_FAIL_COUNT) {
      handleForceLogout();
    }
  }

  function handleForceLogout(): void {
    Alert.alert(
      'Too many attempts',
      'You have been logged out for security. Please sign in again.',
      [{ text: 'OK', onPress: () => dispatch(logout()) }],
      { cancelable: false },
    );
  }

  function confirmLogout(): void {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  }

  useEffect(() => {
    if (!isHydrated || initializedRef.current) return;
    initializedRef.current = true;

    if (isAuthenticated && biometricEnabled && biometricSupported) {
      setIsLocked(true);
    }
  }, [isHydrated, isAuthenticated, biometricEnabled, biometricSupported]);

  useEffect(() => {
    if (!isLocked) return;

    const timer = setTimeout(() => {
      triggerAuth();
    }, 350);

    return () => clearTimeout(timer);
  }, [isLocked]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLocked(false);
      failCountRef.current = 0;
    }
  }, [isAuthenticated]);

  if (!isLocked || !isAuthenticated) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={styles.backdrop} pointerEvents="auto">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.iconRing}>
              <Ionicons name="shield-checkmark" size={38} color={COLORS.SECONDARY} />
            </View>

            <CustomText style={styles.appName}>House of EdTech</CustomText>
            <CustomText style={styles.tagline}>Learning Platform</CustomText>
          </View>

          <View style={styles.body}>
            <View style={styles.fingerprintRing}>
              {isAuthenticating ? (
                <ActivityIndicator size="large" color={COLORS.SECONDARY} />
              ) : (
                <Ionicons
                  name={hasFailed ? 'finger-print' : 'finger-print'}
                  size={52}
                  color={hasFailed ? COLORS.ERROR : COLORS.SECONDARY}
                />
              )}
            </View>

            <CustomText style={styles.lockTitle}>
              {isAuthenticating ? 'Verifying…' : 'App Locked'}
            </CustomText>

            <CustomText style={[styles.lockSubtitle, hasFailed && styles.lockSubtitleError]}>
              {isAuthenticating
                ? 'Scan your fingerprint or use your passcode'
                : hasFailed
                  ? `Authentication failed. ${MAX_FAIL_COUNT - failCountRef.current} attempt${MAX_FAIL_COUNT - failCountRef.current === 1 ? '' : 's'} remaining.`
                  : 'Use your fingerprint or passcode to unlock'}
            </CustomText>

            {failCountRef.current > 0 && (
              <View style={styles.dotsRow}>
                {Array.from({ length: MAX_FAIL_COUNT }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i < failCountRef.current && styles.dotFilled]}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={triggerAuth}
              activeOpacity={0.82}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color={COLORS.WHITE} size="small" />
              ) : (
                <>
                  <Ionicons name="finger-print" size={18} color={COLORS.WHITE} />
                  <CustomText style={styles.btnPrimaryText}>
                    {hasFailed ? 'Try Again' : 'Unlock'}
                  </CustomText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={confirmLogout}
              activeOpacity={0.75}
              disabled={isAuthenticating}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.ERROR} />
              <CustomText style={styles.btnSecondaryText}>Log Out</CustomText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    gap: 8,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.SECONDARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    fontFamily: FONTS.BOLD,
    fontSize: 22,
    color: COLORS.TEXT_PRIMARY,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },

  body: {
    alignItems: 'center',
    gap: 16,
  },
  fingerprintRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.SECONDARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY + '33',
  },
  lockTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  lockSubtitleError: {
    color: COLORS.ERROR,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.GRAY_200,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
  },
  dotFilled: {
    backgroundColor: COLORS.ERROR,
    borderColor: COLORS.ERROR,
  },

  actions: {
    width: '100%',
    gap: 12,
  },
  btn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.SECONDARY,
    shadowColor: COLORS.SECONDARY,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnPrimaryText: {
    fontFamily: FONTS.BOLD,
    fontSize: 15,
    color: COLORS.WHITE,
  },
  btnSecondary: {
    backgroundColor: COLORS.ERROR_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.ERROR + '33',
  },
  btnSecondaryText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 15,
    color: COLORS.ERROR,
  },
});
