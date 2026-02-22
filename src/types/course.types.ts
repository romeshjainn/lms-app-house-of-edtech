export interface RawInstructorName {
  title: string;
  first: string;
  last: string;
}

export interface RawInstructorPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface RawInstructorLocation {
  city: string;
  state: string;
  country: string;
  postcode: number;
  street: {
    number: number;
    name: string;
  };
  coordinates: {
    latitude: string;
    longitude: string;
  };
  timezone: {
    offset: string;
    description: string;
  };
}

export interface RawInstructorDob {
  date: string;
  age: number;
}

export interface RawInstructorLogin {
  uuid: string;
  username: string;
  md5: string;
  sha1: string;
  sha256: string;
  salt: string;
  password: string;
}

export interface RawRandomUser {
  id: number;
  gender: string;
  name: RawInstructorName;
  email: string;
  phone: string;
  cell: string;
  nat: string;
  picture: RawInstructorPicture;
  location: RawInstructorLocation;
  dob: RawInstructorDob;
  login: RawInstructorLogin;
}

export interface RawProductListItem {
  id: number;
  title: string;
  thumbnail: string;
  images: string[];
  price: number;
  category: string;
}

export interface RawProduct extends RawProductListItem {
  description: string;
  brand: string;
  rating: number;
  stock: number;
  discountPercentage: number;
}

export interface RawPaginatedList<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number;
  data: T[];
}

export interface CourseInstructor {
  id: number;
  name: string;
  avatarUrl: string;
  location: string;
  email: string;
}

export interface CourseListItem {
  id: number;
  title: string;
  thumbnail: string;
  images: string[];
  price: number;
  category: string;
  instructor: CourseInstructor;
}

export interface CourseDetail extends CourseListItem {
  description: string;
  brand: string;
  rating: number;
  stock: number;
  discountPercentage: number;
}


export interface CourseStoreState {

  bookmarkedIds: number[];
  enrolledIds: number[];
  completedCourseIds: number[];
  allCourses: CourseListItem[];
  isCoursesLoading: boolean;
  isHydrated: boolean;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
}

export interface CoursePage {
  courses: CourseListItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
}

export type SortOption = 'az' | 'za' | 'price-asc' | 'price-desc';
