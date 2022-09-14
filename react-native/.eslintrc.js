module.exports = {
    root: true,
    extends: [
        '@react-native-community',
        'plugin:import/typescript',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    rules: {
        indent: [1, 4],
        'react-native/no-inline-styles': 0,
        '@typescript-eslint/no-namespace': 0,
        'react-hooks/exhaustive-deps': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/no-explicit-any': 0,
    },
};
