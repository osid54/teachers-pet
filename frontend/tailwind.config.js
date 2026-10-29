/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                main: {
                    100: 'hsla(0, 23%, 97%, 1)',
                    200: 'hsla(0, 19%, 93%, 1)',
                    300: 'hsla(0, 12%, 89%, 1)',
                    400: 'hsla(0, 15%, 83%, 1)',
                    500: 'hsla(0, 10%, 71%, 1)',
                    600: 'hsla(0, 8%, 45%, 1)',
                    700: 'hsla(0, 9%, 31%, 1)',
                    800: 'hsla(0, 10%, 23%, 1)',
                    900: 'hsla(0, 11%, 15%, 1)',
                },
            },
            fontFamily: {
                sans: ['Georgia', 'serif'],
                mono: ['SFMono-Regular', 'Consolas', 'monospace'],
                custom: ['Motley Forces', 'serif'],
            },
            fontSize: {
                xxs: '0.6rem',
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                md: '1rem',
                lg: '1.25rem',
                h3: '1.75rem',
                h2: '2rem',
                h1: '2.5rem',
                xl: '3rem',
            },
            spacing: {
                xxs: '4px',
                xs: '8px',
                sm: '12px',
                md: '16px',
                lg: '24px',
                xl: '32px',
                xxl: '48px',
            },
            borderRadius: {
                sm: '4px',
                md: '8px',
                lg: '12px',
            },
            boxShadow: {
                sm: '0 1px 3px rgba(0,0,0,0.1)',
                md: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                lg: '0 8px 12px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.08)',
            },
        },
    },
    plugins: [],
}