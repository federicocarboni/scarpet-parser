import * as parser from './Parser.js';
import {Parser} from './Parser.js';

/**
 * Parse a scarpet script.
 *
 * @param {string} input
 * @param {parser.ParserOptions} [options]
 * @returns - Root node of the Abstract Syntax Tree or null if the script is
 * empty.
 */
export function parseScript(input, options) {
    const parser = new Parser(input, options);
    return parser.parse();
}

/**
 * Parse a scarpet command (executed with `/script run`).
 *
 * @param {string} input
 * @param {parser.ParserOptions} [options]
 * @returns - Root node of the Abstract Syntax Tree or null if the script is
 * empty.
 */
export function parseCommand(input, options) {
    const parser = new Parser(input, {
        allowComments: false,
        allowNewLineMarkers: true,
        ...options,
    });
    return parser.parse();
}
