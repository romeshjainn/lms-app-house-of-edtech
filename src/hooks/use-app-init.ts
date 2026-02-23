import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import { hydrateAuth } from '@/store/slices/auth.slice';
import { hydrateCourse } from '@/store/slices/course.slice';
import {
  initBiometricSupport,
  initNotificationStatus,
  requestNotificationAccess,
  selectPermissionRequested,
} from '@/store/slices/preferences.slice';

export function useAppInit(): void {
  const dispatch = useAppDispatch();

  const permissionRequested = useAppSelector(selectPermissionRequested);

  useEffect(() => {
    async function run() {
      await Promise.all([dispatch(hydrateAuth()), dispatch(hydrateCourse())]);

      await Promise.all([dispatch(initBiometricSupport()), dispatch(initNotificationStatus())]);

      if (!permissionRequested) {
        await dispatch(requestNotificationAccess());
      }
    }

    run();
  }, [dispatch]);
}
