import { useEffect } from 'react';

import { useAppDispatch } from '@/store';
import { hydrateAuth } from '@/store/slices/auth.slice';
import { hydrateCourse } from '@/store/slices/course.slice';

export function useAppInit(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    Promise.all([
      dispatch(hydrateAuth()),
      dispatch(hydrateCourse()),
    ]);
  }, [dispatch]);
}
