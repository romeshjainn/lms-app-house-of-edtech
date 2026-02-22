import { type ReactNode, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useAppSelector } from '@/store';
import { ROUTES } from '@/constants';

const AUTHENTICATED_GROUPS = ['(main)'] as const;
const LOGGED_OUT_ONLY_GROUPS = ['(auth)'] as const;


type RoutePolicy = 'authenticated-only' | 'logged-out-only' | 'public';

function resolvePolicy(segments: string[]): RoutePolicy {
  const group = segments[0] as string | undefined;

  if (AUTHENTICATED_GROUPS.includes(group as never)) return 'authenticated-only';
  if (LOGGED_OUT_ONLY_GROUPS.includes(group as never)) return 'logged-out-only';
  return 'public';
}


interface NavigationGuardProps {
  children: ReactNode;
}

export function NavigationGuard({ children }: NavigationGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isGuest, isHydrated } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isHydrated) return;

    const policy = resolvePolicy(segments);

    if (policy === 'authenticated-only' && !isAuthenticated && !isGuest) {
      router.replace(ROUTES.LOGIN as never);
      return;
    }

    if (policy === 'logged-out-only' && isAuthenticated) {
      router.replace(ROUTES.HOME as never);
    }
  }, [isHydrated, isAuthenticated, isGuest, segments, router]);

  return <>{children}</>;
}
