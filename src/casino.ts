const Bosk = require( `./bosk.js` );
const config = require( `./config.ts` );
import { Turn } from './turn';
import { TurnStatus } from './turn-status';

module.exports = Object.freeze
({
	config: config,
	board: require( `./board.js` )( config ),
	rollDie: function():number
	{
		return Bosk.randInt( 6, 1 );
	},
	getRandomPlayer: function():string
	{
		return Bosk.randListEntry( this.config.players )
	},
	createFirstTurn: function():Turn
	{
		return Object.freeze( new Turn
		(
			0,
			0,
			false,
			false,
			new TurnStatus( config.startingFunds, 1 ),
			new TurnStatus( config.startingFunds, 1 ),
			[],
			[],
			null
		));
	},
	getNextTurn: function( turns:Array<Turn> ):Turn
	{
		const currentTurn:Turn = Bosk.getEndOfList( turns );
		const ranOutOfTurns:boolean = ( currentTurn.number >= this.config.maxTurns );
		const reachedEnd:boolean = false;
		const finished:boolean = ranOutOfTurns || reachedEnd;
		const roll:number = ( !finished ) ? this.rollDie() : 0;
		const number:number = ( finished ) ? currentTurn.number : currentTurn.number + 1;
		const startingStatus:TurnStatus = currentTurn.finalStatus;
		let   finalStatus:TurnStatus = currentTurn.finalStatus;

		let pass:string[] = [];
		let land:string = null;
		let passStatuses:Array<TurnStatus> = [];
		if ( !finished )
		{
			for ( let i = 0; i < roll; i++ )
			{
				pass.push( this.board[ i ].pass );
			}

			land = this.board[ 0 ].land;
		}

		return Object.freeze( new Turn
		(
			number,
			roll,
			finished,
			reachedEnd,
			startingStatus,
			finalStatus,
			passStatuses,
			pass,
			land
		));
	}
});
