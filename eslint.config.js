import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      ".local/**",
      "lib/api-zod/src/**",
      "lib/api-client-react/src/**",
      "artifacts/mobile/**",
      "artifacts/mockup-sandbox/**",
      "scripts/**",
    ],
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);
