const program = require( '../src/index.ts' );

test
(
    'run returns string',
    function()
    {
		const text = program.run();
		expect( text ).not.toEqual( '' );
		console.log( text );
    }
);
