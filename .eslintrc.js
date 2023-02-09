module.exports = {
  env: {
    "browser": true,
    "es6": true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "tsconfig.json",
    "sourceType": "module",
  },
  extends: ['standard-with-typescript'],
  rules: {
    'no-iterator': 0,
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'import/prefer-default-export': 0,
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/space-before-function-paren': ['error', 'never']
  },
};
