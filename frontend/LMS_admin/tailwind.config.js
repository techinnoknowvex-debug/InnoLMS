/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Innoknowvex Brand Colors
        'brand-primary': '#FF6B35',      // Orange - Primary actions, buttons, highlights
        'brand-cream': '#FFF3E8',        // Cream - App background tint / soft surfaces
        'brand-secondary': '#1A1A1A',    // Black - Headers, sidebar, important sections
        'brand-black': '#000000',        // Pure black for text
        'brand-dark-grey': '#333333',    // Dark grey
        'brand-grey': '#666666',         // Medium grey
        'brand-light-grey': '#F5F5F5',   // Light grey backgrounds
        'brand-pale-grey': '#F9F9F9',    // Pale grey
        'brand-border': '#E0E0E0',       // Border grey
        'brand-success': '#27AE60',      // Success green
        'brand-warning': '#F39C12',      // Warning yellow
        'brand-danger': '#E74C3C',       // Danger red
        'brand-info': '#3498DB',         // Info blue
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'primary': '0 4px 12px rgba(255, 107, 53, 0.2)',
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
    },
  },
}