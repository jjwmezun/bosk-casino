const Bosk = require( `./bosk.js` );
const config = require( `./config.js` );

module.exports = Object.freeze
({
	config: config,
	board: require( `./board.js` )( config ),
	chance: require( './chance.js' )(),
	rollDie: function()
	{
		return Bosk.randInt( 6, 1 );
	},
	getRandomPlayer: function()
	{
		return Bosk.randListEntry( this.config.players )
	},
	createFirstTurn: function()
	{
		return {
			number: 0,
			finished: false,
			reachedEnd: false,
			roll: 0,
			currentSpace: 0,
			funds: this.config.startingFunds,
			pass: null,
			land: null
		};
	},
	getNextTurn: function( turns )
	{
		const currentTurn = Bosk.getEndOfList( turns );
		const ranOutOfTurns = ( currentTurn.number >= this.config.maxTurns );
		const reachedEnd = false;
		const finished = ranOutOfTurns || reachedEnd;
		const number = ( finished ) ? currentTurn.number : currentTurn.number + 1;
		const roll = this.rollDie();
		const currentSpace = currentTurn.currentSpace + roll;
		const funds = currentTurn.funds;

		let nextTurn = {
			number: number,
			finished: finished,
			reachedEnd: reachedEnd,
			roll: roll,
			currentSpace: currentSpace,
			funds: funds,
			pass: null,
			land: null
		};

		if ( !finished )
		{
			const pass = [];
			for ( let i = 0; i < roll; i++ )
			{
				pass.push( this.board[ i ].land );
			}

			const land = this.board[ 0 ].land;

			nextTurn.land = land;
			nextTurn.pass = pass;
		}

		return nextTurn;
	}
});
