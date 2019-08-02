import { BallSurvival } from './ball-survival';
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
			new MinigameGame( 'balls', 50 ),
			new MinigameGame( 'tower', 75 ),
			new MinigameGame( 'count', 25 )
		],
		run: function( latestStatus:TurnStatus ):TurnStatus
		{
			const selectedMinigame:MinigameGame = this.getRandomMinigame();
			const win:boolean = this.testWin( selectedMinigame );
			const bet:number = this.getRandomBet();
			const newFunds:number = ( win ) ? latestStatus.funds + bet : latestStatus.funds - bet;
			const misc:object = this.miscGenerators[ selectedMinigame.type ]( win, bet );
			const minigameStatus:MinigameStatus = new MinigameStatus( selectedMinigame.type, win, bet, misc );
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
		},
		miscGenerators: {
			balls: ( win:boolean, bet:number ):object => {
				const autumnSurvives:boolean = ( win ) ? Bosk.randPercent( 65 ) : false;
				const dawnSurvives:boolean = ( function() {
					const winChance:number = ( autumnSurvives ) ? 45 : 80;
					return ( win ) ? ( Bosk.randPercent( winChance ) ) : false;
				})();
				const edgarSurvives:boolean = ( win ) ? ( ( !autumnSurvives && !dawnSurvives ) ? true : Bosk.randPercent( 30 ) ) : false;
				return {
					survives: new BallSurvival( autumnSurvives, edgarSurvives, dawnSurvives )
				};
			},
			tower: ( win:boolean, bet:number ):object => {
				return {};
			},
			count: ( win:boolean, bet:number ):object => {
				const playersWithCorrectGuesses = ( win ) ?

				const correctNumber:number = Bosk.randInt( 48, 24 );
				const autumnsGuess:number =
				return {
					guesses: new Guesses( correctNumber, autumnsGuess, edgarsGuess, dawnsGuess )
				};
			}
		}
	});
})();
