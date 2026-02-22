import * as Yup from 'yup';

const emailField = Yup.string()
  .trim()
  .email('Enter a valid email address')
  .required('Email is required');

const passwordField = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .required('Password is required');

const nameField = Yup.string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(64, 'Name must be 64 characters or fewer')
  .required('Full name is required');

export const loginSchema = Yup.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = Yup.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});


export type LoginFormValues = Yup.InferType<typeof loginSchema>;
export type RegisterFormValues = Yup.InferType<typeof registerSchema>;
