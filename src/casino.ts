import { Game } from './game';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';
import { ChanceDeck } from './chance-deck';

( function()
{
	const Bosk = require( `./bosk.js` );
	const config = require( `./config.ts` );
	const chance = require( `./chance.ts` );

	module.exports = Object.freeze
	({
		config: config,
		board: require( `./board.js` )( config ),
		spaces: require( `./spaces.ts` )( config ),
		run: function():Game
		{
			return new Game( this.getRandomPlayerOrder(), this.getTurnsList() );
		},
		getTurnsList: function():Array<Turn>
		{
			const turns:Array<Turn> = [ this.createFirstTurn() ];
			while( !turns[ turns.length - 1 ].finished )
			{
				turns.push( this.getNextTurn( turns ) );
			}
			return turns;
		},
		getRandomPlayerOrder: function():number[]
		{
			const listOfIndices:number[] = ( function()
			{
				const list:number[] = [];
				for ( let i = 0; i < this.config.players.length; i++ )
				{
					list.push( i );
				}
				return list;
			}).bind( this )();
			return Object.freeze( Bosk.shuffleList( listOfIndices ) );
		},
		createFirstTurn: function():Turn
		{
			const initialDeck:ChanceDeck = chance.createDeck();
			return Object.freeze( new Turn
			(
				0,
				0,
				false,
				false,
				new TurnStatus( "land", null, config.startingFunds, config.importantSpaces.start, initialDeck ),
				[],
				new TurnStatus( "land", null, config.startingFunds, config.importantSpaces.start, initialDeck )
			));
		},
		getNextTurn: function( turns:Array<Turn> ):Turn
		{
			const previousTurn:Turn = Bosk.getEndOfList( turns );
			const ranOutOfTurns:boolean = ( previousTurn.number >= this.config.maxTurns );
			const roll:number = ( !ranOutOfTurns ) ? this.rollDie() : 0;
			const number:number = ( ranOutOfTurns ) ? previousTurn.number : previousTurn.number + 1;
			const startingStatus:TurnStatus = previousTurn.land;
			const currentTurn:Turn = Object.freeze( new Turn
			(
				number,
				roll,
				previousTurn.finished,
				previousTurn.reachedEnd,
				startingStatus,
				[],
				null
			));

			const passes:Array<TurnStatus> = ( function()
			{
				const list:Array<TurnStatus> = [];
				for ( let i = 0; i < roll; i++ )
				{
					const lastStatus:TurnStatus = ( list.length === 0 ) ? startingStatus : list[ list.length - 1 ];
					list.push( this.runPass( currentTurn, lastStatus ) );
					if ( list[ list.length - 1 ].reachedEnd )
					{
						break;
					}
				}
				return list;
			}).bind( this )();
			const reachedEnd:boolean = !ranOutOfTurns && passes[ passes.length - 1 ].reachedEnd;
			const finished:boolean = ranOutOfTurns || reachedEnd;
			const lastStatus:TurnStatus = ( passes.length > 0 ) ? passes[ passes.length - 1 ] : startingStatus;
			const land:TurnStatus = this.runLand( currentTurn, lastStatus );

			return Object.freeze( new Turn
			(
				number,
				roll,
				finished,
				reachedEnd,
				startingStatus,
				passes,
				land
			));
		},
		runPass: function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
		{
			const currentSpace:number = lastStatus.currentSpace + 1;
			const reachedEnd:boolean = currentSpace >= this.board.length;
			const action:string = ( !reachedEnd ) ? this.board[ currentSpace ].pass : null;
			const finalStatus:TurnStatus = Object.freeze( new TurnStatus(
				"pass",
				action,
				lastStatus.funds,
				currentSpace,
				lastStatus.chanceDeck,
				reachedEnd
			));
			return this.applyAction( "pass", currentTurn, finalStatus );
		},
		runLand: function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
		{
			const action:string = ( lastStatus.currentSpace < this.board.length ) ? this.board[ lastStatus.currentSpace ].land : null;
			const finalStatus:TurnStatus = Object.freeze( new TurnStatus(
				"land",
				action,
				lastStatus.funds,
				lastStatus.currentSpace,
				lastStatus.chanceDeck,
				lastStatus.reachedEnd
			));
			return this.applyAction( "land", currentTurn, finalStatus );
		},
		applyAction: function( type:string, currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
		{
			return ( lastStatus.action === null )
				? lastStatus
				: this.spaces[ type ][ lastStatus.action ]( currentTurn, lastStatus );
		},
		rollDie: function():number
		{
			return Bosk.randInt( 6, 1 );
		},
		getRandomPlayer: function():string
		{
			return Bosk.randListEntry( this.config.players )
		}
	});
})();
