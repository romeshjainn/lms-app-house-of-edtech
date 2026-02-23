import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '@/constants';
import { handleApiError, type AppError } from '@/services/api/error-handler';
import { asyncStorage } from '@/services/storage/async-storage';
import type { CourseListItem, CourseStoreState } from '@/types/course.types';
import type { RootState } from '../root-reducer';

const initialState: CourseStoreState = {
  bookmarkedIds: [],
  enrolledIds: [],
  completedCourseIds: [],
  allCourses: [],
  isCoursesLoading: false,
  isHydrated: false,
  isCoursesError: false,
};

async function readNumberArray(key: string): Promise<number[]> {
  const json = await asyncStorage.getItem(key);
  return json ? (JSON.parse(json) as number[]) : [];
}

export const fetchAllCourses = createAsyncThunk<CourseListItem[], void, { rejectValue: AppError }>(
  'course/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { courseService } = await import('@/services/api/modules/course.service');
      return await courseService.getCourses();
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

export const hydrateCourse = createAsyncThunk<{
  bookmarkedIds: number[];
  enrolledIds: number[];
  completedCourseIds: number[];
}>('course/hydrate', async () => {
  const [bookmarkedIds, enrolledIds, completedCourseIds] = await Promise.all([
    readNumberArray(STORAGE_KEYS.BOOKMARKED_COURSES),
    readNumberArray(STORAGE_KEYS.ENROLLED_COURSES),
    readNumberArray(STORAGE_KEYS.COMPLETED_COURSES),
  ]);

  return { bookmarkedIds, enrolledIds, completedCourseIds };
});

export const hydrateCompletedCourses = createAsyncThunk<number[]>(
  'course/hydrateCompleted',
  async () => readNumberArray(STORAGE_KEYS.COMPLETED_COURSES),
);

export const toggleBookmark = createAsyncThunk<number[], number>(
  'course/toggleBookmark',
  async (courseId, { getState }) => {
    const state = getState() as RootState;
    const current = state.course.bookmarkedIds;

    const next = current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId];

    await asyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_COURSES, JSON.stringify(next));

    return next;
  },
);

export const toggleEnrollment = createAsyncThunk<number[], number>(
  'course/toggleEnrollment',
  async (courseId, { getState }) => {
    const state = getState() as RootState;
    const current = state.course.enrolledIds;

    const next = current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId];

    await asyncStorage.setItem(STORAGE_KEYS.ENROLLED_COURSES, JSON.stringify(next));

    return next;
  },
);

export const markCourseCompleted = createAsyncThunk<number[], number>(
  'course/markCompleted',
  async (courseId, { getState }) => {
    const state = getState() as RootState;
    const current = state.course.completedCourseIds;

    if (current.includes(courseId)) return current;

    const next = [...current, courseId];

    await asyncStorage.setItem(STORAGE_KEYS.COMPLETED_COURSES, JSON.stringify(next));

    return next;
  },
);

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCourses.pending, (state) => {
        state.isCoursesLoading = true;
        state.isCoursesError = false;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.allCourses = action.payload;
        state.isCoursesLoading = false;
        state.isCoursesError = false;
      })
      .addCase(fetchAllCourses.rejected, (state) => {
        state.isCoursesLoading = false;
        state.isCoursesError = true;
      });

    builder
      .addCase(hydrateCourse.fulfilled, (state, action) => {
        state.bookmarkedIds = action.payload.bookmarkedIds;
        state.enrolledIds = action.payload.enrolledIds;
        state.completedCourseIds = action.payload.completedCourseIds;
        state.isHydrated = true;
      })
      .addCase(hydrateCourse.rejected, (state) => {
        state.bookmarkedIds = [];
        state.enrolledIds = [];
        state.completedCourseIds = [];
        state.isHydrated = true;
      });

    builder.addCase(hydrateCompletedCourses.fulfilled, (state, action) => {
      state.completedCourseIds = action.payload;
    });

    builder.addCase(toggleBookmark.fulfilled, (state, action) => {
      state.bookmarkedIds = action.payload;
    });

    builder.addCase(toggleEnrollment.fulfilled, (state, action) => {
      state.enrolledIds = action.payload;
    });

    builder.addCase(markCourseCompleted.fulfilled, (state, action) => {
      state.completedCourseIds = action.payload;
    });
  },
});

export default courseSlice.reducer;

const selectAllCoursesBase = (state: RootState) => state.course.allCourses;
const selectBookmarkedIds = (state: RootState) => state.course.bookmarkedIds;
const selectEnrolledIds = (state: RootState) => state.course.enrolledIds;
const selectCompletedIds = (state: RootState) => state.course.completedCourseIds;
export const selectIsCoursesError = (state: RootState): boolean => state.course.isCoursesError;

export const selectIsBookmarked =
  (courseId: number) =>
  (state: RootState): boolean =>
    state.course.bookmarkedIds.includes(courseId);
export const selectIsEnrolled =
  (courseId: number) =>
  (state: RootState): boolean =>
    state.course.enrolledIds.includes(courseId);
export const selectIsCompleted =
  (courseId: number) =>
  (state: RootState): boolean =>
    state.course.completedCourseIds.includes(courseId);
export const selectIsCoursesLoading = (state: RootState): boolean => state.course.isCoursesLoading;

export const selectAllCourses = createSelector(selectAllCoursesBase, (courses) => courses);
export const selectCompletedCount = createSelector(
  selectCompletedIds,
  (completedIds) => completedIds.length,
);
export const selectEnrolledCount = createSelector(
  selectEnrolledIds,
  (enrolledIds) => enrolledIds.length,
);

export const selectCompletionPercentage = createSelector(
  selectCompletedIds,
  selectEnrolledIds,
  (completedIds, enrolledIds) => {
    if (enrolledIds.length === 0) return 0;
    const completedEnrolled = completedIds.filter((id) => enrolledIds.includes(id)).length;
    return Math.round((completedEnrolled / enrolledIds.length) * 100);
  },
);

export const selectEnrolledCoursesData = createSelector(
  selectAllCoursesBase,
  selectEnrolledIds,
  (courses, enrolledIds) => courses.filter((c) => enrolledIds.includes(c.id)),
);

export const selectCompletedCoursesData = createSelector(
  selectAllCoursesBase,
  selectCompletedIds,
  (courses, completedIds) => courses.filter((c) => completedIds.includes(c.id)),
);

export const selectActiveEnrolledCourses = createSelector(
  selectAllCoursesBase,
  selectEnrolledIds,
  selectCompletedIds,
  (courses, enrolledIds, completedIds) =>
    courses.filter((c) => enrolledIds.includes(c.id) && !completedIds.includes(c.id)),
);

export const selectRecommendedCourses = createSelector(
  selectAllCoursesBase,
  selectEnrolledIds,
  (courses, enrolledIds) => courses.filter((c) => !enrolledIds.includes(c.id)),
);

export const selectBookmarkedCoursesData = createSelector(
  selectAllCoursesBase,
  selectBookmarkedIds,
  (courses, bookmarkedIds) => courses.filter((c) => bookmarkedIds.includes(c.id)),
);
