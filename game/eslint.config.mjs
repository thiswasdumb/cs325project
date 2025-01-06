import globals from "globals";
import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier"; // Disables ESLint rules conflicting with Prettier
import prettierPlugin from "eslint-plugin-prettier"; // Adds Prettier rules as ESLint rules

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  prettierConfig, // Disable conflicting ESLint rules
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": "error", // Treat Prettier issues as ESLint errors
    },
  },
];
