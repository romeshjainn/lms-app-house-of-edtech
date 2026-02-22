/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#EDE9FE',
        },
        accent: '#F59E0B',

        // Semantic
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#0284C7',
          light: '#E0F2FE',
        },

        // Neutrals
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // Semantic surfaces
        background: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#E5E7EB',
      },

      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },

      fontSize: {
        xs: '10px',
        sm: '12px',
        md: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
      },

      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },

      fontFamily: {
        light: ['Ubuntu-Light'],
        regular: ['Ubuntu-Regular'],
        medium: ['Ubuntu-Medium'],
        bold: ['Ubuntu-Bold'],
      },
    },
  },
  plugins: [],
};
