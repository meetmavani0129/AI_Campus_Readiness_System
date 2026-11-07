/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        dark: {
          base: '#0f172a',
          surface: '#1e293b',
          elevated: '#334155',
          border: 'rgba(148, 163, 184, 0.15)',
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            muted: '#94a3b8'
          }
        },
        light: {
          base: '#eef2ff',
          surface: '#ffffff',
          elevated: '#f5f7ff',
          border: 'rgba(255,255,255,0.75)',
          text: {
            primary: '#0f172a',
            secondary: '#475569',
            muted: '#94a3b8'
          }
        }
      },
      boxShadow: {
        /* ── 3D Depth System ── */
        'depth-sm': '0 1px 3px rgba(0,0,0,0.06), 0 4px 10px -2px rgba(0,0,0,0.04)',
        'depth':    '0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 28px -4px rgba(0,0,0,0.08)',
        'depth-lg': '0 8px 16px -4px rgba(0,0,0,0.06), 0 24px 48px -8px rgba(0,0,0,0.12)',
        'depth-xl': '0 16px 32px -8px rgba(0,0,0,0.08), 0 40px 72px -12px rgba(0,0,0,0.15)',
        /* ── Colored Glow Shadows ── */
        'glow-indigo': '0 0 0 1px rgba(99,102,241,0.1), 0 8px 32px -4px rgba(99,102,241,0.25)',
        'glow-violet': '0 0 0 1px rgba(139,92,246,0.1), 0 8px 32px -4px rgba(139,92,246,0.25)',
        'glow-amber':  '0 0 0 1px rgba(245,158,11,0.1),  0 8px 32px -4px rgba(245,158,11,0.25)',
        'glow-emerald':'0 0 0 1px rgba(16,185,129,0.1),  0 8px 32px -4px rgba(16,185,129,0.25)',
        'glow-rose':   '0 0 0 1px rgba(244,63,94,0.1),   0 8px 32px -4px rgba(244,63,94,0.25)',
        /* ── Legacy names kept for existing pages ── */
        'premium':      '0 20px 50px -12px rgba(0,0,0,0.08)',
        'premium-dark': '0 20px 50px -12px rgba(0,0,0,0.5)',
        /* ── Glass card inner glow ── */
        'glass': 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 32px -8px rgba(0,0,0,0.1)',
        /* ── Button press ── */
        'btn-press': 'inset 0 2px 6px rgba(0,0,0,0.12)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },
      backgroundImage: {
        'gradient-indigo': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-violet': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        'gradient-warm':   'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
        'gradient-cool':   'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
        'gradient-emerald':'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'mesh-light': 'radial-gradient(at 20% 20%, rgba(99,102,241,0.08) 0px, transparent 55%), radial-gradient(at 80% 80%, rgba(139,92,246,0.06) 0px, transparent 55%)',
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.6s ease-out forwards',
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'scale-in':      'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'float':         'float 6s ease-in-out infinite',
        'blob':          'blobFloat 20s infinite alternate cubic-bezier(0.45,0.05,0.55,0.95)',
        'shimmer':       'shimmer 2.5s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'bounce-soft':   'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp:   { from: { opacity:'0', transform:'translateY(20px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:     { from: { opacity:'0' }, to: { opacity:'1' } },
        scaleIn:    { from: { opacity:'0', transform:'scale(0.92)' }, to: { opacity:'1', transform:'scale(1)' } },
        float:      { '0%,100%': { transform:'translateY(0px)' }, '50%': { transform:'translateY(-8px)' } },
        blobFloat:  { '0%,100%': { transform:'translate(0,0) scale(1)' }, '33%': { transform:'translate(28px,-48px) scale(1.08)' }, '66%': { transform:'translate(-18px,22px) scale(0.95)' } },
        shimmer:    { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        pulseGlow:  { '0%,100%': { opacity:'0.4' }, '50%': { opacity:'1' } },
        bounceSoft: { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-4px)' } },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
}
