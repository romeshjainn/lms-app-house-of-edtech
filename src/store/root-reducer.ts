import { combineReducers } from '@reduxjs/toolkit';

import authReducer        from './slices/auth.slice';
import courseReducer      from './slices/course.slice';
import preferencesReducer from './slices/preferences.slice';

const rootReducer = combineReducers({
  auth:        authReducer,
  course:      courseReducer,
  preferences: preferencesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
