/*
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
        for ( let i = 0; i < 1000; i++ )
        {
            const die = expect( casino.rollDie() );
            die.toBeGreaterThanOrEqual( 1 );
            die.toBeLessThanOrEqual( 6 );
        }
    }
);

test
(
    'getRandomPlayer always returns Autumn, Edgar, or Dawn',
    function()
    {
        for ( let i = 0; i < 1000; i++ )
        {
            expect( [ "Autumn", "Dawn", "Edgar" ] ).toContain( casino.getRandomPlayer() );
        }
    }
);

test
(
    'getRandomPlayerOrder always returns list o’ indices from 0 to # o’ players',
    function()
    {
        const playerOrder:number[] = casino.getRandomPlayerOrder();
        expect( playerOrder.length ).toEqual( casino.config.players.length );
    }
);

test
(
    'Always finished when max turn hit.',
    function()
    {
        const game:Game = casino.run();
        for ( let i = 1; i < game.turnList.length; i++ )
        {
            if ( i > 25 )
            {
                const latestTurn:Turn = game.turnList[ i ];
                expect( latestTurn.finished ).toBe( true );
                expect( latestTurn.passes.length ).toBe( 0 );
            }
        }
    }
);

test
(
    'Always a pass per roll ’less reached end',
    function()
    {
        const game:Game = casino.run();
        expect( game.turnList[ 0 ].passes.length ).toBe( game.turnList[ 0 ].roll );
        for ( let i = 1; i < game.turnList.length; i++ )
        {
            const latestTurn:Turn = game.turnList[ i ];
            if ( !latestTurn.reachedEnd )
            {
                expect( latestTurn.passes.length ).toBe( latestTurn.roll );
            }
        }
    }
);

test
(
    'Turn # is always ’tween 1 & max, but 0 on 1st turn',
    function()
    {
        const game:Game = casino.run();
        expect( game.turnList[ 0 ].passes.length ).toBe( game.turnList[ 0 ].roll );
        for ( let i = 1; i < game.turnList.length; i++ )
        {
            const latestTurn:Turn = game.turnList[ i ];
            expect( latestTurn.number ).toBeLessThanOrEqual( casino.config.maxTurns );
            expect( latestTurn.number ).toBeGreaterThanOrEqual( 1 );
        }
    }
);

test
(
    'Roll is always ’tween 1 & 6, but 0 on 1st turn & after finished',
    function()
    {
        const game:Game = casino.run();
        expect( game.turnList[ 0 ].roll ).toBe( 0 );
        for ( let i = 1; i < game.turnList.length; i++ )
        {
            const latestTurn:Turn = game.turnList[ i ];
            if ( latestTurn.finished && !latestTurn.reachedEnd )
            {
                expect( latestTurn.roll ).toBe( 0 );
            }
            else
            {
                expect( latestTurn.roll ).toBeLessThanOrEqual( 6 );
                expect( latestTurn.roll ).toBeGreaterThanOrEqual( 1 );
            }
        }
    }
);

test
(
    'Starting status is always land status o’ previous turn',
    function()
    {
        const game:Game = casino.run();
        expect( game.turnList[ 0 ].roll ).toBe( 0 );
        for ( let i = 1; i < game.turnList.length; i++ )
        {
            const latestTurn:Turn = game.turnList[ i ];
            const previousTurn:Turn = game.turnList[ i - 1 ];
            expect( latestTurn.startingStatus ).toBe( previousTurn.land );
        }
    }
);

test
(
    'Run returns data.',
    function()
    {
        const output:Game = casino.run();
        expect( typeof output ).toBe( "object" );
    }
);

test
(
    'Only minigame land turn statuses have extra info',
    function()
    {
        const game:Game = casino.run();
        for ( const turn of game.turnList )
        {
            if ( turn.land.action === "minigame" )
            {
                expect( typeof turn.land.extra ).toBe( "object" );
            }
            else
            {
                expect( turn.land.extra ).toBe( null );
            }
        }
    }
);
*/