const casino = require( '../src/casino.ts' );
import { Turn } from '../src/turn';

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
                expect( latestTurn.pass.length ).toBe( 0 );
                expect( latestTurn.land ).toBe( null );
            }
        }
    }
);

test
(
    'Always a pass per roll',
    function()
    {
        const turns:Array<Turn> = [ casino.createFirstTurn() ];
        expect( turns[ 0 ].pass.length ).toBe( turns[ 0 ].roll );
        for ( let i = 1; i < 30; i++ )
        {
            turns.push( casino.getNextTurn( turns ) );
            const latestTurn:Turn = turns[ turns.length - 1 ];
            expect( latestTurn.pass.length ).toBe( latestTurn.roll );
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

            if ( !latestTurn.finished )
            {
                expect( latestTurn.roll ).toBeLessThanOrEqual( 6 );
                expect( latestTurn.roll ).toBeGreaterThanOrEqual( 1 );
            }
            else
            {
                expect( latestTurn.roll ).toBe( 0 );
            }
        }
    }
);
