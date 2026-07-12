// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    // Files/folders ESLint should never touch
    ignores: ["dist/**", "node_modules/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Common footguns worth catching early in a starter template
      "no-console": "off", // this template logs via console through Show()/error.handler.ts
      "no-unused-vars": "off", // handled by the TS-aware rule below
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "off", // enable once a typed lint config (parserOptions.project) is wired in
      "eqeqeq": ["warn", "smart"],
      "no-var": "error",
      "prefer-const": "warn",
    },
  },
);