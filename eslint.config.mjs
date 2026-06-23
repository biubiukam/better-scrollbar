import js from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginVue from "eslint-plugin-vue"
import reactHooks from "eslint-plugin-react-hooks"

export default tseslint.config(
	{ ignores: ["**/dist/", "**/node_modules/", "**/coverage/", "**/.turbo/", "dist-site/", "**/*.cjs"] },

	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		files: ["packages/react/src/**/*.{ts,tsx}", "apps/site/**/*.{ts,tsx}"],
		plugins: { "react-hooks": reactHooks },
		rules: {
			...reactHooks.configs.recommended.rules,
		},
	},

	...pluginVue.configs["flat/recommended"].map((config) => ({
		...config,
		files: ["packages/vue/src/**/*.vue"],
	})),
	{
		files: ["packages/vue/src/**/*.vue"],
		languageOptions: {
			parserOptions: { parser: tseslint.parser },
		},
		rules: {
			"vue/html-indent": ["warn", "tab"],
			"vue/max-attributes-per-line": "off",
			"vue/singleline-html-element-content-newline": "off",
		},
	},

	{
		files: ["**/*.{ts,tsx,vue}"],
		rules: {
			"no-undef": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
)
