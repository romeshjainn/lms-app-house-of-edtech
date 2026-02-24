import * as Notifications from 'expo-notifications';
import { notificationService } from './notification.service';

const INACTIVITY_NOTIFICATION_ID = 'inactivity-reminder-24h';

const TWENTY_FOUR_HOURS = 60 * 60 * 24;

export async function scheduleInactivityReminder() {
  const permission = await notificationService.getPermissionStatus();

  if (!permission.granted) {
    return;
  }

  await cancelInactivityReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: INACTIVITY_NOTIFICATION_ID,
    content: {
      title: 'We miss you 👀',
      body: 'It’s been 24 hours! Continue your learning journey today.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: TWENTY_FOUR_HOURS,
      repeats: false,
    },
  });
}

export async function cancelInactivityReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(INACTIVITY_NOTIFICATION_ID);
  } catch (e) {}
}
