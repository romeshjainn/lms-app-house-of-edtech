import * as Yup from 'yup';

const emailField = Yup.string()
  .trim()
  .email('Enter a valid email address')
  .required('Email is required');

const passwordField = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .required('Password is required');

const usernameField = Yup.string()
  .trim()
  .min(4, 'Username must be at least 4 characters')
  .max(20, 'Username must be 20 characters or fewer')
  .matches(/^\S+$/, 'Username cannot contain spaces')
  .required('Username is required');

export const loginSchema = Yup.object({
  username: usernameField,
  password: passwordField,
});

export const registerSchema = Yup.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
  profileImageUri: Yup.string().nullable().optional(),
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;

export type RegisterFormValues = Yup.InferType<typeof registerSchema>;
