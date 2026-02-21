/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base dark — tom slate profundo (não preto puro)
        base: {
          950: '#060910',
          900: '#0F172A',
          800: '#1E293B',
          700: '#2D3A50',
          600: '#3D4F6B',
        },
        // Accent — dourado suave (riqueza, finanças)
        gold: {
          300: '#FCD97D',
          400: '#F5C842',
          500: '#E8AF1A',
          600: '#C48E0A',
        },
        // Sucesso / receita
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        // Alerta / despesa
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        // Info / investimento
        sky: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // Safe area para iPhone com notch/Dynamic Island
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
