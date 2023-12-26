import {readFileSync, readdirSync, writeFileSync} from 'fs';
import {Parser} from '../lib/Parser.js';
import path from 'path';
import assert from 'assert';

function printNode(input, node) {
    if (node === null) return;
    console.log('---', input.slice(node.start.pos, node.end.pos));
    switch (node.kind) {
        case 'FunctionExpression':
            for (const n of node.params) printNode(input, n);
            break;
        case 'BinaryExpression':
            printNode(input, node.lvalue);
            printNode(input, node.rvalue);
            break;
        case 'UnaryExpression':
        case 'ParenthesisedExpression':
            printNode(input, node.value);
            break;
        default:
            break;
    }
}

describe('Parser', function () {
    this.timeout(5000000000000000);
    const casesDir = 'test/cases';
    for (const caseFile of readdirSync(casesDir)) {
        if (!caseFile.endsWith('.sc')) continue;
        const caseFilePath = path.join(casesDir, caseFile);
        const input = readFileSync(caseFilePath, 'utf8');
        const reviver = (key, value) => {
            if (key !== 'value' || typeof value !== 'string') return value;
            try {
                return BigInt(value);
            } catch {
                return value;
            }
        };
        const output = JSON.parse(
            readFileSync(
                path.join('test/expected/' + caseFile + '.json'),
                'utf8',
            ),
            reviver,
        );
        it(caseFile, function () {
            const parser = new Parser(input);
            const root = parser.parse();
            let node = root;
            // printNode(input, root);
            const json = {
                errors: parser.errors,
                warnings: parser.warnings,
                root,
            };
            // writeFileSync(
            //     path.join('test/expected/' + caseFile + '.json'),
            //     JSON.stringify(
            //         json,
            //         (_, value) =>
            //             typeof value === 'bigint' ? String(value) : value,
            //         4,
            //     ),
            // );
            assert.deepStrictEqual(structuredClone(json), output);
        });
    }
});
