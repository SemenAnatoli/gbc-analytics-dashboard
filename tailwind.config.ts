import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#3ecf8e',
          teal: '#1aab74',
          dark: '#0f7a52',
          orange: '#f97316',
          light: '#d1fae5',
        },
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(160deg, #1aab74 0%, #0d9488 50%, #0e7490 100%)',
        'app-bg': 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 40%, #e0f2fe 100%)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.10)',
        orange: '0 4px 16px rgba(249,115,22,0.35)',
      },
    },
  },
  plugins: [],
}

export default config
