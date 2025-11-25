/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'metric-orange': '#F68632',
                'metric-blue': '#002A4D',
                'metric-gray-light': '#F5F5F5',
                'metric-white': '#FFFFFF',
                'metric-gray-medium': '#A6A6A6',
                'metric-black-soft': '#333333',
            }
        },
    },
    plugins: [],
}