const casino = require( '../src/casino.ts' );
const config = require( '../src/config.ts' );
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
    'Always finished when max turn hit.',
    function()
    {
        const turns:Array<Turn> = [ casino.createFirstTurn() ];
        for ( let i = 1; i < 30; i++ )
        {
            turns.push( casino.getNextTurn( turns ) );
            if ( i > 25 )
            {
                const latestTurn:Turn = turns[ turns.length - 1 ];
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
        const turns:Array<Turn> = [ casino.createFirstTurn() ];
        expect( turns[ 0 ].passes.length ).toBe( turns[ 0 ].roll );
        for ( let i = 1; i < 30; i++ )
        {
            turns.push( casino.getNextTurn( turns ) );
            const latestTurn:Turn = turns[ turns.length - 1 ];
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
        const turns:Array<Turn> = [ casino.createFirstTurn() ];
        expect( turns[ 0 ].number ).toBe( 0 );
        for ( let i = 1; i < 30; i++ )
        {
            turns.push( casino.getNextTurn( turns ) );
            const latestTurn:Turn = turns[ turns.length - 1 ];
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
        const turns:Array<Turn> = [ casino.createFirstTurn() ];
        expect( turns[ 0 ].roll ).toBe( 0 );
        for ( let i = 1; i < 30; i++ )
        {
            turns.push( casino.getNextTurn( turns ) );
            const latestTurn:Turn = turns[ turns.length - 1 ];

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
        const turns:Array<Turn> = [ casino.createFirstTurn() ];
        expect( turns[ 0 ].roll ).toBe( 0 );
        for ( let i = 1; i < 30; i++ )
        {
            turns.push( casino.getNextTurn( turns ) );
            const latestTurn:Turn = turns[ turns.length - 1 ];
            const previousTurn:Turn = turns[ turns.length - 2 ];
            expect( latestTurn.startingStatus ).toBe( previousTurn.land );
        }
    }
);

test
(
    'Run returns data.',
    function()
    {
        const output:Array<Turn> = casino.run();
        expect( typeof output ).toBe( "object" );
        console.log( output );
    }
);

test
(
    'Only minigame land turn statuses have extra info',
    function()
    {
        const output:Array<Turn> = casino.run();
        for ( const turn of output )
        {
            if ( turn.land.action === "minigame" )
            {
                expect( typeof turn.land.minigameStatus ).toBe( "object" );
            }
            else
            {
                expect( turn.land.minigameStatus ).toBe( null );
            }
        }
    }
);
