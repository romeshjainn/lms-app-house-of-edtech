export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthUserAvatar {
  _id: string;
  url: string;
  localPath: string;
}

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  avatar: AuthUserAvatar;
  role: string;
  loginType: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthLoginPayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthRegisterPayload {
  user: AuthUser;
}

export interface LocalUserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;        
  profileImageUri: string | null;  
  role: string;
  isEmailVerified: boolean;
}

export interface AuthStoreState {
  accessToken: string | null;
  refreshToken: string | null;
  user: LocalUserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isGuest: boolean;
}

export interface AuthError {
  message: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
}
