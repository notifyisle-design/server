import {nextui} from '@nextui-org/react';
import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Toss Product Sans',
          'Tossface',
          'SF Pro KR',
          'SF Pro Display',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'Roboto',
          'Noto Sans KR',
          'sans-serif',
        ],
      },
      boxShadow: {
        toss: '0 18px 48px rgba(3, 18, 40, 0.08)',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#3182F6',
              foreground: '#FFFFFF',
            },
            background: '#F7F8FA',
            foreground: '#191F28',
            content1: '#FFFFFF',
            content2: '#F2F4F6',
            content3: '#E5E8EB',
            content4: '#D1D6DB',
            focus: '#3182F6',
          },
        },
      },
    }),
  ],
};

export default config;
