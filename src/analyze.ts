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
		}
	});
})();
