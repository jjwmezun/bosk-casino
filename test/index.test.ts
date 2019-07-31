const program = require( '../src/index.ts' );
const chance = require( '../src/chance.ts' );
const script = require( '../src/script.ts' );

test
(
    `script for every chance card & only for chance cards`,
    function()
    {
        //TODO: Make actual test.
        const chanceKeys:string[] = Object.keys( chance.cards );
        const chanceTextKeys:string[] = Object.keys( script.chanceCardText );
        const chanceImagesKeys:string[] = Object.keys( script.chanceCardImages );
        expect( chanceKeys.length ).toEqual( chanceTextKeys.length )
        expect( chanceKeys.length ).toEqual( chanceImagesKeys.length );
    }
);

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
