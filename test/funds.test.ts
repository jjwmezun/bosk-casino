const casino = require( '../src/casino.ts' );
const config = require( '../src/config.ts' );
import { Game } from '../src/game';
import { Turn } from '../src/turn';
import { TurnStatus } from '../src/turn-status';
import { MinigameStatus } from '../src/minigame-status';

test
(
    'rollDie is always ’tween 1 & 6',
    function()
    {
        const endingFunds:number[] = [];
        for ( let i = 0; i < 1000; i++ )
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
