import {Parser} from './Parser.js';
import {isDigit, isLetter} from './char.js';

export * from './Parser.js';
export * from './token.js';
export * from './Tokenizer.js';
export * from './diagnostic.js';
// export {findAllVariableReferences, isFunctionReference} from './findAllReferences.js';
export {findVariableDefinition, findFunctionDefinition} from './findDefinition.js';
export * from './getNodeAt.js';
export {findReachableVariables, findReachableFunctions} from './findSymbols.js';
export {resolveExpression} from './resolveExpression.js';

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

/**
 * Returns true if the provided id is a valid Scarpet identifier.
 *
 * @param {string} id
 */
export function isValidIdentifier(id) {
    id = '' + id;
    if (!isLetter(id.charCodeAt(0))) return false;
    for (let i = 1; i < id.length; i++) {
        const c = id.charCodeAt(i);
        if (!isLetter(c) && !isDigit(c)) return false;
    }
    return true;
}
