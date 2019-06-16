import { Turn } from './turn';
import { TurnStatus } from './turn-status';

( function()
{
	const Bosk = require( `./bosk.js` );
	const config = require( `./config.ts` );

	module.exports = Object.freeze
	({
		config: config,
		board: require( `./board.js` )( config ),
		run: function():Array<Turn>
		{
			const turns:Array<Turn> = [ this.createFirstTurn() ];
			while( !turns[ turns.length - 1 ].finished )
			{
				turns.push( this.getNextTurn( turns ) );
			}
			return turns;
		},
		createFirstTurn: function():Turn
		{
			return Object.freeze( new Turn
			(
				0,
				0,
				false,
				false,
				new TurnStatus( "land", null, config.startingFunds, 1 ),
				[],
				new TurnStatus( "land", null, config.startingFunds, 1 )
			));
		},
		getNextTurn: function( turns:Array<Turn> ):Turn
		{
			const currentTurn:Turn = Bosk.getEndOfList( turns );
			const ranOutOfTurns:boolean = ( currentTurn.number >= this.config.maxTurns );
			const roll:number = ( !ranOutOfTurns ) ? this.rollDie() : 0;
			const number:number = ( ranOutOfTurns ) ? currentTurn.number : currentTurn.number + 1;
			const startingStatus:TurnStatus = currentTurn.land;
			const passes:Array<TurnStatus> = ( function()
			{
				const list:Array<TurnStatus> = [];
				for ( let i = 0; i < roll; i++ )
				{
					const lastStatus:TurnStatus = ( list.length === 0 ) ? startingStatus : list[ list.length - 1 ];
					list.push( this.runPass( lastStatus ) );
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
			const land:TurnStatus = this.runLand( lastStatus );

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
		runPass: function( lastStatus:TurnStatus ):TurnStatus
		{
			const currentSpace:number = lastStatus.currentSpace + 1;
			const reachedEnd:boolean = currentSpace >= this.board.length;
			const action:string = ( !reachedEnd ) ? this.board[ currentSpace ].pass : null;
			return Object.freeze( new TurnStatus(
				"pass",
				action,
				lastStatus.funds,
				currentSpace,
				reachedEnd
			));
		},
		runLand: function( lastStatus:TurnStatus ):TurnStatus
		{
			const action:string = ( lastStatus.currentSpace < this.board.length ) ? this.board[ lastStatus.currentSpace ].land : null;
			return Object.freeze( new TurnStatus(
				"land",
				action,
				lastStatus.funds,
				lastStatus.currentSpace,
				lastStatus.reachedEnd
			));
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
