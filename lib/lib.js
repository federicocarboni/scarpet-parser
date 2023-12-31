import {Parser} from './Parser.js';

export * from './Parser.js';
export * from './Token.js';
export * from './Tokenizer.js';
export * from './diagnostic.js';
export {findDefinition} from './findDefinition.js';

/**
 * Parse a scarpet script.
 *
 * @param {string} input
 * @param {import('./Parser.js').ParserOptions} [options]
 * @returns Root node of the Abstract Syntax Tree or null if the script is empty.
 */
export function parseScript(input, options) {
    const parser = new Parser(input, options);
    return parser.parse();
}

/**
 * Parse a scarpet command (executed with `/script run`).
 *
 * @param {string} input
 * @param {import('./Parser.js').ParserOptions} [options]
 * @returns Root node of the Abstract Syntax Tree or null if the script is empty.
 */
export function parseCommand(input, options) {
    return parseScript(input, {
        allowComments: false,
        allowNewLineMarkers: true,
        ...options,
    });
}
