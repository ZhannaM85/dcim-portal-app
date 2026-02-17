// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
    {
        files: ["**/*.ts"],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            tseslint.configs.stylistic,
            angular.configs.tsRecommended,
        ],
        processor: angular.processInlineTemplates,
        rules: {
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "app",
                    style: "camelCase",
                },
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "app",
                    style: "kebab-case",
                },
            ],
            "lines-between-class-members": ["error", "always"],
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
            "no-trailing-spaces": "error",
            "indent": ["error", 4, { SwitchCase: 1 }],
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    accessibility: "explicit",
                    overrides: {
                        constructors: "no-public",
                    },
                },
            ],
            "@angular-eslint/prefer-standalone": "off",
            "@angular-eslint/prefer-inject": "off",
        },
    },
    {
        files: ["**/*.html"],
        extends: [
            angular.configs.templateRecommended,
            angular.configs.templateAccessibility,
        ],
        rules: {
            "@angular-eslint/template/prefer-control-flow": "off",
        },
    },
]);
