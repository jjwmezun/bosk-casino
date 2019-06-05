const Bosk = require( `./bosk.js` );
const config = require( `./config.ts` );
import { Turn } from './turn';

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
		return Object.freeze( new Turn(
			0,
			false,
			false,
			0,
			0,
			this.config.startingFunds,
			[],
			null
		));
	},
	getNextTurn: function( turns:Array<Turn> ):Turn
	{
		const currentTurn = Bosk.getEndOfList( turns );
		const ranOutOfTurns = ( currentTurn.number >= this.config.maxTurns );
		const reachedEnd = false;
		const finished = ranOutOfTurns || reachedEnd;
		const number = ( finished ) ? currentTurn.number : currentTurn.number + 1;
		const roll = ( !finished ) ? this.rollDie() : 0;
		const currentSpace = currentTurn.currentSpace + roll;
		const funds = currentTurn.funds;

		let pass:string[] = [];
		let land:string = null;
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
			finished,
			reachedEnd,
			roll,
			currentSpace,
			funds,
			pass,
			land
		));
	}
});
