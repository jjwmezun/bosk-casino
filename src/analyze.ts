const Bosk = require( `./bosk.js` );
import { Game } from './game';
import { Turn } from './turn';

( function()
{
	const config = require( `./config.ts` );

	module.exports = Object.freeze
	({
		getTurnPlayer: function( game:Game, turn:Turn ):number
		{
			return this.getTurnNumberPlayer( game, turn.number );
		},
		getTurnNumberPlayer: function( game:Game, turnNumber:number ):number
		{
			return game.playerOrder[ ( turnNumber - 1 ) % config.players.length ];
		},
		firstLandOTypes: function( turnsList:Array<Turn>, turnNumber:number, types:string[] ):boolean
		{
			for ( const turn of turnsList )
			{
				if ( turn.number >= turnNumber )
				{
					return true;
				}

				if
				(
					turn.land !== null &&
					Bosk.inList( types, turn.land.action )
				)
				{
					return false;
				}
			}
			return true;
		}
	});
})();
