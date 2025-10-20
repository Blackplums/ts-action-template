import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		environment: "node",
		globals: true,
		coverage: {
			reporter: ["text"],
			include: ["src/**/*.ts"],
			exclude: ["src/__tests__/**/*.ts"],
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 80,
				statements: 80,
			},
		},
	},
});
