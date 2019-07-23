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
		firstLandOTypes: function( game:Game, turnNumber:number, types:string[] ):boolean
		{
			return this.firstTurnOCondition
			(
				game,
				turnNumber,
				( turn ) => turn.land !== null && Bosk.inList( types, turn.land.action )
			);
		},
		firstLandOTypesWithCharacter: function( game:Game, turnNumber:number, types:string[], character:number ):boolean
		{
			return this.firstTurnOCondition
			(
				game,
				turnNumber,
				( turn ) => turn.land !== null &&
					Bosk.inList( types, turn.land.action ) &&
					character === this.getTurnNumberPlayer( game, turn.number )
			);
		},
		firstTurnOCondition( game:Game, turnNumber:number, condition ):boolean
		{
			for ( const turn of game.turnList )
			{
				if ( turn.number >= turnNumber )
				{
					return true;
				}
				else if ( condition( turn ) )
				{
					return false;
				}
			}
			return true;
		}
	});
})();
