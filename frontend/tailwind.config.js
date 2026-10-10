/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        card: {
          DEFAULT: '#FAFAFA',
          subtle: '#F9FAFB'
        },
        border: '#E5E7EB',
        primary: {
          DEFAULT: '#DC2626', // Deep safety red
          hover: '#B91C1C',
          light: '#FEE2E2',
        },
        surface: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
        },
        content: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
        card: '12px',
        modal: '16px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        modal: '0 8px 30px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
