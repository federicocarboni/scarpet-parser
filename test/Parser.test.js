import {readFileSync, readdirSync, write, writeFile, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {Parser} from '../lib/Parser.js';
import path from 'path';

describe('Parser', function () {
    this.timeout(5000000000000000);
    const casesDir = 'test/cases';
    for (const caseFile of readdirSync(casesDir)) {
        if (!caseFile.endsWith('.sc')) continue;
        const caseFilePath = path.join(casesDir, caseFile);
        const input = readFileSync(caseFilePath);
        it(caseFile, function () {
            const parser = new Parser(input);
            const root = parser.parse();
            const json = JSON.stringify({errors: parser.errors, warnings: parser.warnings, root}, (_, value) => typeof value === 'bigint' ? String(value) : value, 2);
            writeFileSync(path.join('test/out/' + caseFile + '.json'), json);
        });
    }
});
