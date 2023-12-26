import {Tokenizer} from '../lib/Tokenizer.js';

describe('Tokenizer', () => {
    it('should work', () => {
        const tokenizer = new Tokenizer(
            `\
2e-2;
// hello
// line 2
// line 3
global_markers = [];
{};
activate() ->
(
    deactivate();
    p = player();
    colors = l(
        'white','yellow','orange','red',
        'pink','magenta','purple','blue',
        'light_blue', 'cyan','green','gray',
        'light_gray'
    );
    global_markers = map(colors,
        marker = create_marker(null, pos(p), _+'_carpet');
        entity_event(
            marker, 'on_tick', '__marker_tick',
            str(p), _i, length(colors));
        marker
    )
);
`,
            {
                allowComments: true,
                allowNewLineMarkers: false,
            },
        );
        let token;
        while ((token = tokenizer.nextToken()) !== null) {
            console.log(token);
            break;
        }
        console.log(tokenizer.errors);
    });
});
