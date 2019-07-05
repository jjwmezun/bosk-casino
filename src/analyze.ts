import { Game } from './game';
import { Turn } from './turn';

( function()
{
	const config = require( `./config.ts` );

	module.exports = Object.freeze
	({
		getTurnPlayer: function( game:Game, turn:Turn ):number
		{
			return game.playerOrder[ ( turn.number - 1 ) % config.players.length ];
		}
	});
})();
