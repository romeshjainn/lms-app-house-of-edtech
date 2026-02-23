import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricSupport {
  isSupported: boolean;
  primaryType: BiometricType;
  label: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

function mapAuthenticationType(types: LocalAuthentication.AuthenticationType[]): BiometricType {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'facial';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }
  return 'none';
}

function getLabelForType(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return 'Face ID';
    case 'fingerprint':
      return 'Fingerprint';
    case 'iris':
      return 'Iris Scan';
    default:
      return 'Biometrics';
  }
}

async function checkSupport(): Promise<BiometricSupport> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return { isSupported: false, primaryType: 'none', label: 'Not available' };
    }

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const primaryType = mapAuthenticationType(supportedTypes);
    const label = getLabelForType(primaryType);

    return { isSupported: true, primaryType, label };
  } catch {
    return { isSupported: false, primaryType: 'none', label: 'Not available' };
  }
}

async function authenticate(
  reason = 'Verify your identity to continue',
): Promise<BiometricAuthResult> {
  try {
    const support = await checkSupport();

    if (!support.isSupported) {
      return { success: false, error: 'not_supported' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false, // allow PIN/pattern as fallback
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      return { success: true };
    }

    const errorCode = result.error ?? 'unknown';
    const cancelled = errorCode === 'user_cancel' || errorCode === 'system_cancel';

    return { success: false, error: errorCode, cancelled };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    return { success: false, error: message };
  }
}

export const biometricService = {
  checkSupport,
  authenticate,
} as const;
