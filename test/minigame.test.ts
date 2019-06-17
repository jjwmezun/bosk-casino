import { MinigameGame } from '../src/minigame-game';
const minigame = require( '../src/minigame.ts' );

test
(
    'Increment list is right',
    function()
    {
		const list:number[] = minigame.generateListOfIncrements( 5, 5, 100 );
		expect( list ).toStrictEqual( [ 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100 ] );
    }
);

test
(
    'Bet values are right.',
    function()
    {
		for ( let i = 0; i < 1000; i++ )
		{
			const bet:number = minigame.getRandomBet();
			expect( bet ).toBeGreaterThanOrEqual( 5 );
			expect( bet ).toBeLessThanOrEqual( 100 );
			expect( bet % 5 ).toBe( 0 );
		}
    }
);

test
(
    'getRandomMinigame works',
    function()
    {
		for ( let i = 0; i < 1000; i++ )
		{
			const game:MinigameGame = minigame.getRandomMinigame();
			expect([ 'karts', 'tower', 'count' ]).toContain( game.type );
		}
    }
);
