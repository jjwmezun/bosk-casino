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
		timesLandOTypes: function( game:Game, turnNumber:number, types:string[] ):number
		{
			return this.numberOConditions
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
		firstLandOTypesWithCharacters: function( game:Game, turnNumber:number, types:string[] ):boolean[]
		{
			const charactersHadType:boolean[] = [];
			for ( let character = 0; character < config.players.length; character++ )
			{
				charactersHadType[ character ] = true;
			}

			for ( const turn of game.turnList )
			{
				if ( turn.number >= turnNumber )
				{
					break;
				}
				else
				{
					for ( let character = 0; character < config.players.length; character++ )
					{
						if
						(
							turn.land !== null &&
							Bosk.inList( types, turn.land.action ) &&
							character === this.getTurnNumberPlayer( game, turn.number )
						)
						{
							charactersHadType[ character ] = false;
						}
					}
				}
			}
			return charactersHadType;
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
		},
		numberOConditions( game:Game, turnNumber:number, condition ):number
		{
			let numberOConditions:number = 0;
			for ( const turn of game.turnList )
			{
				if ( turn.number >= turnNumber )
				{
					break;
				}
				else if ( condition( turn ) )
				{
					numberOConditions++;
				}
			}
			return numberOConditions;
		}
	});
})();
