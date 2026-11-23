/** @type {import('tailwindcss').Config} */
// 디자인 토큰은 FE1(P2 규칙) → P1이 src/constants/theme.ts와 여기에 반영한다.
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {} },
  plugins: [],
};
