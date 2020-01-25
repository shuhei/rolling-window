module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["jest"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  env: {
    node: true
  },
  overrides: [
    {
      files: ["*/__tests__/*.ts"],
      env: {
        "jest/globals": true
      },
      extends: ["plugin:jest/recommended", "plugin:jest/style"]
    }
  ]
};
