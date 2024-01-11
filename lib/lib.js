import {Parser} from './Parser.js';

export * from './Parser.js';
export * from './token.js';
export * from './Tokenizer.js';
export * from './diagnostic.js';
// export {findAllVariableReferences, isFunctionReference} from './findAllReferences.js';
export {findVariableDefinition, findFunctionDefinition, findFunctions} from './findDefinition.js';
export {getNodeAt} from './getNodeAt.js';
export {findVariableNames} from './findSymbols.js';
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
