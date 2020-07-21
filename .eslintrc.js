module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    camelcase: ['error', { allow: ['aa_bb'] }]
  },

  'extends': [
    'plugin:vue/recommended',
    '@vue/standard'
  ]
}
