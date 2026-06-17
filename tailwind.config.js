/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./index.html",
		"./site/**/*.{ts,tsx,js,jsx}",
		"./src/**/*.{ts,tsx,js,jsx}",
	],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				card: "hsl(var(--card) / <alpha-value>)",
				"card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
				popover: "hsl(var(--popover) / <alpha-value>)",
				"popover-foreground": "hsl(var(--popover-foreground) / <alpha-value>)",
				primary: "hsl(var(--primary) / <alpha-value>)",
				"primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
				secondary: "hsl(var(--secondary) / <alpha-value>)",
				"secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",
				muted: "hsl(var(--muted) / <alpha-value>)",
				"muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
				accent: "hsl(var(--accent) / <alpha-value>)",
				"accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
				destructive: "hsl(var(--destructive) / <alpha-value>)",
				"destructive-foreground": "hsl(var(--destructive-foreground) / <alpha-value>)",
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				success: "hsl(var(--success) / <alpha-value>)",
				"success-foreground": "hsl(var(--success-foreground) / <alpha-value>)",
				warning: "hsl(var(--warning) / <alpha-value>)",
				"warning-foreground": "hsl(var(--warning-foreground) / <alpha-value>)",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				"site-panel": "0 18px 60px rgba(0, 0, 0, 0.28)",
				"site-line": "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
			},
			keyframes: {
				"console-scan": {
					"0%": { transform: "translateY(-22%)", opacity: "0.2" },
					"45%": { opacity: "0.78" },
					"100%": { transform: "translateY(240%)", opacity: "0" },
				},
				"range-drift": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(9px)" },
				},
				"rail-pulse": {
					"0%, 100%": { opacity: "0.5" },
					"50%": { opacity: "1" },
				},
			},
			animation: {
				"console-scan": "console-scan 4.6s ease-in-out infinite",
				"range-drift": "range-drift 5.4s ease-in-out infinite",
				"rail-pulse": "rail-pulse 2.8s ease-in-out infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
