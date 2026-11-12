import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default defineConfig(
	globalIgnores(['dist/']),
	{
		files: ['**/*.ts', '**/*.mjs'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended
		],
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/linebreak-style': ['error', 'unix'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0 }],
			'@stylistic/object-curly-spacing': ['error', 'always'],
			'@stylistic/space-before-function-paren': ['error', {
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always'
			}],
			'sort-imports': ['error', {
				ignoreCase: true,
				ignoreDeclarationSort: true
			}],
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		files: ['test/**/*.ts'],
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off'
		}
	}
);
