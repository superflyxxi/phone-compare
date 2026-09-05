export default {
  ignores: [],
  prettier: true,
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
    'new-cap': [
      'error',
      {
        capIsNewExceptions: ['Router']
      }
    ],
    'guard-for-in': 'off',
    'max-depth': ['error', 5],
    'unicorn/no-top-level-side-effects': 'off',
    'jsdoc/check-indentation': 'off',
    'jsdoc/check-tag-names': ['error', {
      "definedTags": ["openapi"],
    }],
    'jsdoc/require-asterisk-prefix': ['error', 'always'],
  }
};

