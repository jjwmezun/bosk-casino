const casino = require( '../src/casino.ts' );
const config = require( '../src/config.ts' );
import { Game } from '../src/game';
import { Turn } from '../src/turn';
import { TurnStatus } from '../src/turn-status';
import { MinigameStatus } from '../src/minigame-status';

/*
test
(
    'Test Max & Min',
    function()
    {
        let i : number = 0;
        const game : Game = casino.run();
        let endingFunds : number = game.turnList[ game.turnList.length - 1 ].land.funds;
        while ( endingFunds < 500 && i < 99999999)
        {
            const game : Game = casino.run();
            endingFunds = game.turnList[ game.turnList.length - 1 ].land.funds;
            ++i;
        }
        console.log( i );
        expect( true ).toEqual( true );
    }

);


test
(
    'Test Max & Min',
    function()
    {
        const endingFunds:number[] = [];
        for ( let i = 0; i < 9999999999; i++ )
        {
            const game = casino.run();
            endingFunds.push( game.turnList[ game.turnList.length - 1 ].land.funds );
        }
        console.log( `MAX: ${ Math.max.apply( null, endingFunds ) }` );
        console.log( `MIN: ${ Math.min.apply( null, endingFunds ) }` );
        console.log( `AVG: ${ endingFunds.reduce( ( a, b ) => a + b ) / endingFunds.length }`)
        expect( true ).toEqual( true );
    }

);

*/

test
(
    'Test Max & Min',
    function()
    {
        let m : number = 0;
        for ( let i = 0; i < 9999999; i++ )
        {
            const game = casino.run();
            const endingFunds : number = game.turnList[ game.turnList.length - 1 ].land.funds;
            m = Math.max( m, endingFunds );
        }
        console.log( m );
        expect( true ).toEqual( true );
    }

);
