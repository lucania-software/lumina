import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
    tseslint.configs.strict,
    {
        plugins: {
            "@stylistic": stylistic
        },
        rules: {
            "@typescript-eslint/explicit-member-accessibility": "error",
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@stylistic/semi": ["error", "always"],
            "@stylistic/member-delimiter-style": ["error", {
                "multiline": {
                    "delimiter": "comma",
                    "requireLast": false
                },
                "singleline": {
                    "delimiter": "comma",
                    "requireLast": false
                },
                "overrides": {
                    "interface": {
                        "multiline": {
                            "delimiter": "semi",
                            "requireLast": true
                        }
                    }
                }
            }]
        }
    }
]);
