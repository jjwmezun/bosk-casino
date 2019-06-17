import { MinigameGame } from './minigame-game';
import { MinigameStatus } from './minigame-status';
import { TurnStatus } from './turn-status';

( function()
{
	const Bosk = require( '../src/bosk.js' );

	module.exports = Object.freeze
	({
		minigames:
		[
			new MinigameGame( 'karts', 'Bumper Karts', 50 ),
			new MinigameGame( 'tower', 'Tower', 75 ),
			new MinigameGame( 'count', 'Keep Count', 25 )
		],
		run: function( latestStatus:TurnStatus ):TurnStatus
		{
			const selectedMinigame:MinigameGame = this.getRandomMinigame();
			const win:boolean = this.testWin( selectedMinigame );
			const bet:number = this.getRandomBet();
			const newFunds:number = ( win ) ? latestStatus.funds + bet : latestStatus.funds - bet;
			const minigameStatus:MinigameStatus = new MinigameStatus( selectedMinigame.type, win, bet );
			return Object.freeze( new TurnStatus
			(
				"land",
				"minigame",
				newFunds,
				latestStatus.currentSpace,
				latestStatus.chanceDeck,
				latestStatus.reachedEnd,
				minigameStatus
			));
		},
		getRandomMinigame: function():MinigameGame
		{
			return Bosk.randListEntry( this.minigames );
		},
		testWin: function( minigame:MinigameGame ):boolean
		{
			return Bosk.randInt( 99, 0 ) > minigame.difficulty;
		},
		getRandomBet: function():number
		{
			return Bosk.randListEntry( this.generateListOfIncrements( 5, 5, 100 ) );
		},
		generateListOfIncrements: function( increment:number, min:number, max:number ):number[]
		{
			const list:number[] = [];
			for ( let i = min; i <= max; i += increment )
			{
				list.push( i );
			}
			return list;
		}
	});
})();
