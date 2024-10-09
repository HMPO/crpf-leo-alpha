import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  pluginJs.configs.recommended,
  {
    ignores: ["public/", "node_modules/", "eslint.config.mjs"],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      sourceType: "commonjs",
    },
  },
  eslintConfigPrettier,
];
