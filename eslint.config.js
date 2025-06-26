import pluginJs from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Ignore build artifacts and generated files
  {
    ignores: ["src-tauri/target/**", "dist/**", "build/**", "node_modules/**", "**/_*"],
  },

  // Basic configuration for all source files
  {
    files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": reactHooksPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      ...reactHooksPlugin.configs.recommended.rules,
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      eqeqeq: "error",
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // TypeScript specific rules
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // React specific rules
  {
    files: ["src/**/*.{jsx,tsx}"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat["jsx-runtime"].rules,
    },
  },

  // TanStack Query rules
  {
    files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: {
      "@tanstack/query": pluginQuery,
    },
    rules: {
      ...pluginQuery.configs["flat/recommended"].rules,
    },
  },

  // Prettier config (disables conflicting rules)
  eslintConfigPrettier,
];
