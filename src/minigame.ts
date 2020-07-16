import { BallSurvival } from './ball-survival';
import { Game } from './game';
import { Guesses } from './guesses';
import { MinigameGame } from './minigame-game';
import { MinigameStatus } from './minigame-status';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';

( function()
{
	const analyze = require( `./analyze.ts` );
	const Bosk = require( '../src/bosk.js' );
	const config = require( `./config.ts` );

	module.exports = Object.freeze
	({
		minigames:
		[
			new MinigameGame( 'balls', 75 ),
			new MinigameGame( 'bomb', 50 ),
			new MinigameGame( 'count', 25 )
		],
		run: function( currentTurn:Turn, latestStatus:TurnStatus, game:Game ):TurnStatus
		{
			const selectedMinigame:MinigameGame = this.getRandomMinigame();
			const win:boolean = this.testWin( selectedMinigame );
			const bet:number = this.getRandomBet();
			const newFunds:number = ( win ) ? latestStatus.funds + bet : latestStatus.funds - bet;
			const misc:object = this.miscGenerators[ selectedMinigame.type ]( win, bet, currentTurn, latestStatus, game );
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
			balls: ( win:boolean, bet:number, currentTurn:Turn, latestStatus:TurnStatus, game:Game ):object => {
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
			bomb: ( win:boolean, bet:number, currentTurn:Turn, latestStatus:TurnStatus, game:Game ):object => {
				const options:string[] = [ `red`, `blue` ];
				const player:number = analyze.getTurnPlayer( game, currentTurn );
				const previousGames:object[] = game.turnList.map(
					( turn:Turn, index:number ) => ( turn.land.action === 'minigame' && turn.land.extra.type === 'bomb' ) ? turn.land.extra.misc : null
				).filter( ( value, index:number ) => value !== null );
				const color:string = ( function() {
					switch ( config.players[ player ] ) {
						case ( `Autumn` ): {
							const total:number = previousGames.length;
							if ( total === 0 ) {
								return Bosk.randListEntry( options );
							} else {
								let redCount:number = 0;
								for ( const g of previousGames ) {
									if ( g[ `color` ] === `red` ) {
										++redCount;
									}
								}
								const blueCount = total - redCount;
								return ( redCount === blueCount ) ?
									Bosk.randListEntry( options ) : (
										( redCount > blueCount ) ? `red` : `blue`
									);
							}
						}
						break;
						case ( `Edgar` ): {
							return `blue`;
						}
						break;
						case ( `Dawn` ): {
							return options[ ( ( latestStatus.funds * 3 ) % currentTurn.number ) % 2 ];
						}
						break;
						default: {
							throw `Invalid bomb minigame chooser.`;
						}
						break;
					}
				})();
				return {
					chooser: player,
					color: color
				};
			},
			count: ( function()
			{
				const testBothWin = () => Bosk.randPercent( 35 );
				const testBothLose = testBothWin;
				const testAutumnWins = () => Bosk.randPercent( 60 );
				const testAutumnLoses = () => !testAutumnWins();

				return ( win:boolean, bet:number ):object => {
					const playersWithCorrectGuesses = ( win )
					?
						(
							( testBothWin() )
							? { autumn: true, dawn: true }
							: (
								( testAutumnWins() )
								? { autumn: true, dawn: false }
								: { autumn: false, dawn: true }
							  )
						)
					:
						(
							( testBothLose() )
							? { autumn: false, dawn: false }
							: (
								( testAutumnLoses() )
								? { autumn: false, dawn: true }
								: { autumn: true, dawn: false }
							  )
						);

					const correctNumber:number = Bosk.randInt( 48, 24 );
					const autumnsGuess:number = ( playersWithCorrectGuesses.autumn ) ? correctNumber : correctNumber + Bosk.randInt( 2, -4, 0 );
					const dawnsGuess:number = ( playersWithCorrectGuesses.dawn ) ? correctNumber : correctNumber + Bosk.randInt( 4, -2, 0 );
					const chosenNumber = ( function()
					{
						const autumnsChosen = { character: "autumn", number: autumnsGuess };
						const dawnsChosen = { character: "dawn", number: dawnsGuess }
						return ( autumnsGuess === dawnsGuess )
						? { character: "both", number: autumnsGuess }
						: (
							( playersWithCorrectGuesses.autumn )
							? ( win ) ? autumnsChosen : dawnsChosen
							: ( win ) ? dawnsChosen : autumnsChosen
						);
					})();
					return {
						guesses: new Guesses( correctNumber, autumnsGuess, dawnsGuess, chosenNumber )
					};
				}
			})()
		}
	});
})();
