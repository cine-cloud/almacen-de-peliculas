/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'var(--color-base-100)',       // fondo principal
        foreground: 'var(--color-base-content)',   // texto sobre fondo
        primary: 'var(--color-primary)',
        'primary-focus': 'var(--color-primary-focus)',
        'primary-content': 'var(--color-primary-content)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        neutral: 'var(--color-neutral)',
        info: 'var(--color-info)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        border: 'var(--color-border)'
      }
  	}
  },
  plugins: [require('daisyui'), require("tailwindcss-animate")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#C58B82",
          "secondary": "#471F16",
          "accent": "#202124",
          "neutral": "#FBFCF7",
          "base-100": "#FBFCF7",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
}
