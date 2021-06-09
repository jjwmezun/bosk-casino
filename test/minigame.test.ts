const analyze = require( `../src/analyze.ts` );
const casino = require( '../src/casino.ts' );
import { Game } from '../src/game';
import { MinigameGame } from '../src/minigame-game';
import { Turn } from '../src/turn';
import { TurnStatus } from '../src/turn-status';
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
		for ( let i = 0; i < 100; i++ )
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
		for ( let i = 0; i < 100; i++ )
		{
			const game:MinigameGame = minigame.getRandomMinigame();
			expect([ 'balls', 'bomb', 'count' ]).toContain( game.type );
		}
    }
);

test
(
    'Bomb player always matches turn player',
    function()
    {
		for ( let i = 0; i < 100; i++ ) {
			const game:Game = casino.run();
			for ( const turn of game.turnList ) {
				const landStatus:TurnStatus = turn.land;
				if ( landStatus.action === 'minigame' && landStatus.extra.type === 'bomb' ) {
					const turnPlayer:number = analyze.getTurnPlayer( game, turn );
					expect( landStatus.extra.misc.chooser ).toEqual( turnPlayer );
				}
			}
		}
    }
);
