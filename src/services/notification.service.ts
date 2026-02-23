import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationPermissionResult {
  status: NotificationPermissionStatus;
  granted: boolean;
  permanentlyDenied: boolean;
}

function mapExpoStatus(expoStatus: Notifications.PermissionStatus): NotificationPermissionStatus {
  switch (expoStatus) {
    case Notifications.PermissionStatus.GRANTED:
      return 'granted';
    case Notifications.PermissionStatus.DENIED:
      return 'denied';
    case Notifications.PermissionStatus.UNDETERMINED:
    default:
      return 'undetermined';
  }
}

function buildResult(
  permissions: Notifications.NotificationPermissionsStatus,
): NotificationPermissionResult {
  const status = mapExpoStatus(permissions.status);
  const granted = permissions.granted;
  // On iOS canAskAgain is false after the user permanently denies
  const permanentlyDenied = status === 'denied' && permissions.canAskAgain === false;

  return { status, granted, permanentlyDenied };
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7C3AED',
  });
}

async function getPermissionStatus(): Promise<NotificationPermissionResult> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return buildResult(permissions);
  } catch {
    return { status: 'undetermined', granted: false, permanentlyDenied: false };
  }
}

async function requestPermission(): Promise<NotificationPermissionResult> {
  try {
    await ensureAndroidChannel();

    const permissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return buildResult(permissions);
  } catch {
    return { status: 'denied', granted: false, permanentlyDenied: false };
  }
}

export const notificationService = {
  getPermissionStatus,
  requestPermission,
} as const;
