import {format} from '../lib/formatting.js';

describe('formatting', function () {
    it('formats something', function () {
        console.log(
            format("f(x) -> (1+0xa1);true&&!false; 'hello \t\nworld'", {trailingSemicolon: false}),
        );
    });
});
