/** @type {import('prettier').Config} */
const config = {
    trailingComma: 'all',
    semi: true,
    singleQuote: false,
    arrowParens: 'always',
    bracketSpacing: false,
    plugins: ['prettier-plugin-jsdoc'],
};

export default config;
