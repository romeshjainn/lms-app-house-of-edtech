import { Stack } from 'expo-router';

import { COLORS } from '@/constants';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.BACKGROUND },
        animation: 'slide_from_right',
      }}
    />
  );
}
