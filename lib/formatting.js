import {parseScript} from './lib.js';

/**
 * @typedef {object} FormattingOptions
 * @property {'lf' | 'crlf'} eol Default is `'lf'`
 * @property {number} indentSize Default is `4`
 * @property {'space' | 'tab'} indentStyle Default is `'space'`
 * @property {boolean} insertFinalNewline Default is `false`
 * @property {boolean} parenthesiseSemicolonsExpressions Default is `false`
 * @property {boolean} trailingComma Always emit trailing commas in multi-line function calls.
 *   Default is `true`
 * @property {boolean} trailingSemicolon Always emit trailing semicolons. Default is `true`
 * @property {boolean} formatComments Default is `true`
 * @property {number} maxLineLength Default is `80`
 * @property {'upper' | 'lower'} hexNumberCase Default is `'upper'`
 */

/**
 * @param {string} input
 * @param {Partial<FormattingOptions>} [options={}] Default is `{}`
 */
export function format(
    input,
    {
        eol = 'lf',
        indentSize = 4,
        indentStyle = 'space',
        insertFinalNewline = false,
        parenthesiseSemicolonsExpressions = false,
        trailingComma = true,
        trailingSemicolon = true,
        formatComments = true,
        maxLineLength = 80,
        hexNumberCase = 'upper',
    } = {},
) {
    /** @type {FormattingOptions} */
    const options = {
        eol,
        indentSize,
        indentStyle,
        insertFinalNewline,
        parenthesiseSemicolonsExpressions,
        trailingComma,
        trailingSemicolon,
        formatComments,
        maxLineLength,
        hexNumberCase,
    };
    const root = parseScript(input);
    return printNode(root, '', options);
}

/**
 * @param {import('./Parser.js').Node | null} node
 * @param {string} indentLevel
 * @param {FormattingOptions} options
 * @returns {string}
 */
function printNode(node, indentLevel, options) {
    if (node === null) return '';
    switch (node.kind) {
        case 'HexLiteral': {
            const n = node.value.value.toString(16);
            return '0x' + (options.hexNumberCase === 'upper' ? n.toUpperCase() : n);
        }
        case 'NumberLiteral':
            return node.literal;
        case 'StringLiteral': {
            let out = "'";
            for (const c of node.value) {
                switch (c) {
                    case '\n':
                        out += '\\n';
                        break;
                    case '\t':
                        out += '\\t';
                        break;
                    case "'":
                        out += "\\'";
                        break;
                    case '\\':
                        out += '\\\\';
                        break;
                    default:
                        out += c;
                }
            }
            out += "'";
            return out;
        }
        case 'Constant':
        case 'Variable':
            return node.name;
        case 'FunctionDeclaration': {
            let value = node.name?.value + '(';
            value += node.params.map((param) => param.name).join(', ');
            if (node.rest !== null) {
                if (node.params.length !== 0) value += ', ';
                value += '...' + node.rest.name.name;
            }
            if (node.outerParams.length !== 0) {
                if (node.params.length !== 0 || node.rest !== null) value += ', ';
                value += node.outerParams.map((param) => param.name.name).join(', ');
            }
            value += ') -> ';
            value += printNode(
                node.body,
                indentLevel +
                    (options.indentStyle === 'tab' ? '\t' : ' '.repeat(options.indentSize)),
                options,
            );
            return value;
        }
        // case 'FunctionExpression': {
        //     let value = node.name?.value + '(';
        // case 'MapLiteral':
        // case 'ListLiteral':
        //     break;
        // }
        case 'BinaryExpression': {
            if (node.operator === ';') {
                const l = printNode(node.lvalue, indentLevel, options);
                if (node.rvalue === null) {
                    return l;
                }
                return l + ';\n' + indentLevel + printNode(node.rvalue, indentLevel, options);
            }
            const space = node.operator === ':' || node.operator === '~' ? '' : ' ';
            return (
                printNode(node.lvalue, indentLevel, options) +
                space +
                node.operator +
                space +
                printNode(node.rvalue, indentLevel, options)
            );
        }
        case 'UnaryExpression':
            return node.operator + printNode(node.value, indentLevel, options);
    }
    return '';
}
