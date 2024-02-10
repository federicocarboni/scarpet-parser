import { isDigit, isLetter } from "./char.js";
import { Parser } from "./Parser.js";

export * from "./diagnostic.js";
export * from "./findAllReferences.js";
export { findFunctionDefinition, findVariableDefinition } from "./findDefinition.js";
export { findReachableFunctions, findReachableVariables } from "./findSymbols.js";
export * from "./getNodeAt.js";
export * from "./Parser.js";
export { resolveExpression } from "./resolveExpression.js";
export * from "./token.js";
export * from "./Tokenizer.js";

/**
 * Parse a scarpet script.
 *
 * @param {string} input
 * @param {import('./Parser.js').ParserOptions} [options]
 * @returns Root node of the Abstract Syntax Tree or `undefined` if the script is empty.
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
 * @returns Root node of the Abstract Syntax Tree or `undefined` if the script is empty.
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
    id = "" + id;
    const firstChar = id.charCodeAt(0);
    if (!isLetter(firstChar) && firstChar !== 0x5F /* _ */) {
        return false;
    }
    for (let i = 1; i < id.length; i++) {
        const c = id.charCodeAt(i);
        if (!isLetter(c) && !isDigit(c) && c !== 0x5F /* _ */) {
            return false;
        }
    }
    return true;
}
