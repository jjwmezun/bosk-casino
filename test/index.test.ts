const program = require( '../src/index.ts' );
const chance = require( '../src/chance.ts' );
const script = require( '../src/script.ts' );

const minigame = require( '../src/minigame.ts' );
import { Game } from '../src/game';
import { Turn } from '../src/turn';
import { TurnStatus } from '../src/turn-status';
import { ChanceDeck } from '../src/chance-deck';
import { MinigameStatus } from '../src/minigame-status';

/*
test
(
    'run returns string',
    function()
    {
        const game:Game = new Game( [ 0, 1, 2 ], [] );
        let status:TurnStatus = new TurnStatus( "land", "minigame", 400, 5, new ChanceDeck( [], 0 ), false, new MinigameStatus( "count", false, 20, minigame.miscGenerators[ "count" ]( false, 20 ) ) );
        const turn:Turn = new Turn( 1, 5, false, false, null, [], status );
		const text:string[] = script.generateLandText( game, turn );
        console.log( text );
		expect( text ).not.toEqual( [''] );
    }
);
*/

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
		const text:string = program.run();
		expect( text ).not.toEqual( '' );
		console.log( text );
    }
);
