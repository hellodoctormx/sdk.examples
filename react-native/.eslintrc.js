module.exports = {
    root: true,
    extends: ['@react-native-community', 'plugin:import/typescript'],
    parser: '@typescript-eslint/parser',
    rules: {
        indent: [1, 4],
        'react-native/no-inline-styles': 0,
    },
};
