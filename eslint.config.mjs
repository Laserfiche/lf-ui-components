// @ts-check
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import stylistic from "@stylistic/eslint-plugin";

/** @type {import("eslint").Linter.RulesRecord} */
const sharedRules = {
  "@stylistic/member-delimiter-style": [
    "error",
    {
      multiline: {
        delimiter: "semi",
        requireLast: true,
      },
      singleline: {
        delimiter: "semi",
        requireLast: false,
      },
    },
  ],
  "@typescript-eslint/no-inferrable-types": "off",
  semi: ["error"],
  "no-bitwise": "off",
  "prefer-const": "error",
};

export default tseslint.config(
  // ui-components TypeScript files
  {
    files: ["projects/ui-components/**/*.ts"],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parserOptions: {
        project: [
          "projects/ui-components/tsconfig.lib.json",
          "projects/ui-components/tsconfig.spec.json",
        ],
      },
    },
    rules: {
        ...sharedRules,
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "lf", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "lf", style: "kebab-case" },
      ],
    },
  },

  // lf-cdn TypeScript files
  {
    files: ["projects/lf-cdn/**/*.ts"],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parserOptions: {
        project: [
          "projects/lf-cdn/tsconfig.app.json",
          "projects/lf-cdn/tsconfig.spec.json",
        ],
      },
    },
    rules: {
      ...sharedRules,
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
    },
  },

  // lf-documentation TypeScript files
  {
    files: ["projects/lf-documentation/**/*.ts"],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parserOptions: {
        project: [
          "projects/lf-documentation/tsconfig.app.json",
          "projects/lf-documentation/tsconfig.spec.json",
        ],
      },
    },
    rules: {
      ...sharedRules,
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
    },
  },

  // HTML template files for all projects
  {
    files: ["projects/**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  }
);
