import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * Incremental lint baseline for the existing prototype. Keep correctness checks
 * enforceable before enabling stricter style/unused rules in follow-up patches.
 */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-debugger": "error",
      "no-unreachable": "error",
      "no-duplicate-imports": "error",
      "no-unsafe-finally": "error",
      "constructor-super": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
