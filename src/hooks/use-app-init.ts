import { useEffect } from 'react';

import { useAppDispatch } from '@/store';
import { hydrateAuth } from '@/store/slices/auth.slice';

export function useAppInit(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
}
