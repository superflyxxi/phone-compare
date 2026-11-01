export default [
  {
    prettier: true,
  },
  {
    ignores: [],
    rules: {
      'unicorn/name-replacements': [
        'error',
        {
          replacements: {
            res: false,
            req: false,
            i: false,
            dir: false,
            docs: false
          }
        }
      ],
      'new-cap': ['error', {capIsNewExceptions: ['Router']}],
      'guard-for-in': 'off',
      'max-depth': ['error', 5],
      'unicorn/max-nested-calls': ['error', {"max": 5}],
      'unicorn/no-top-level-side-effects': 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/check-tag-names': ['error', {
        "definedTags": ["openapi"],
      }],
      'jsdoc/require-asterisk-prefix': ['error', 'always'],
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-description': 'off',
    },
  },
];

