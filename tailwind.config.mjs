/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Keeps your dark mode working
	theme: {
		extend: {
			colors: {
				primary: "#FF9D42",
				"background-light": "#FFFAF7", 
				"background-dark": "#0D0D0D",
			},
			fontFamily: {
				display: ["Lexend", "sans-serif"],
				sans: ["Plus Jakarta Sans", "sans-serif"],
				serif: ["Instrument Serif", "serif"],
			},
			borderRadius: {
				DEFAULT: "1rem",
				pill: "9999px",
				'2xl': '2rem',
				'3xl': '3rem',
			},
			animation: {
				'float': 'floating 3s ease-in-out infinite',
				'float-delayed': 'floating 3.5s ease-in-out infinite 0.5s',
				'float-slow': 'floating 4.5s ease-in-out infinite 1s',
			},
			keyframes: {
				floating: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-15px)' },
				}
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
	],
}