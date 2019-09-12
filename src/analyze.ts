const Bosk = require( `./bosk.js` );
import { Game } from './game';
import { MinigameInfo } from './minigame-info';
import { MinigameStatus } from './minigame-status';
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
		noPassOTypesYet: ( game:Game, turnNumber:number, types:string[] ):boolean => this.timesPassOTypes( game, turnNumber, types ) === 0,
		timesPassOTypes: function( game:Game, turnNumber:number, types:string[] ):number
		{
			return this.numberOPassesWithConditions
			(
				game,
				turnNumber,
				( pass ) => Bosk.inList( types, pass.action )
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
		firstTurnOCondition: function( game:Game, turnNumber:number, condition ):boolean
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
		numberOConditions: function( game:Game, turnNumber:number, condition ):number
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
		},
		numberOPassesWithConditions: function( game:Game, turnNumber:number, condition ):number
		{
			let numberOConditions:number = 0;
			for ( const turn of game.turnList )
			{
				if ( turn.number >= turnNumber )
				{
					break;
				}
				else
				{
					for ( const pass of turn.passes )
					{
						if ( pass !== null && condition( pass ) )
						{
							numberOConditions++;
						}
					}
				}
			}
			return numberOConditions;
		},
		forkValues: function( game:Game, turnNumber:number, type:string ):object
		{
			const forkValues:object = { last: null };
			for ( const turn of game.turnList )
			{
				if ( turn.number >= turnNumber )
				{
					break;
				}
				else
				{
					for ( const pass of turn.passes )
					{
						if ( pass !== null && pass.action === type )
						{
							if ( forkValues[ pass.currentSpace ] === undefined )
							{
								forkValues[ pass.currentSpace ] = 0;
							}
							forkValues[ pass.currentSpace ]++;
							forkValues[ `last` ] = pass.currentSpace;
						}
					}
				}
			}
			return forkValues;
		},
		totalForkCount: function( forkValues:object ):number
		{
			let total:number = 0;
			for ( const type in forkValues )
			{
				total += forkValues[ type ];
			}
			return total;
		},
		minigameInfo: function( game:Game, turnNumber:number ):object
		{
			const minigameInfo:MinigameInfo = new MinigameInfo();
			for ( const turn of game.turnList )
			{
				if ( turn.number >= turnNumber )
				{
					break;
				}
				else
				{
					if ( turn.land.action === "minigame" )
					{
						minigameInfo.addMinigame( turn.land.extra );
					}
				}
			}
			return minigameInfo;
		},
		hasPlayedMinigameBefore: function( minigameInfo:MinigameInfo, type:string ):boolean
		{
			return minigameInfo.getNumber( type ) > 0;
		},
		getSecondForkBranchData: function( game:Game, currentTurn:number ):Array<object>
		{
			const list:Array<object> = [];
			for ( const turn of game.turnList )
			{
				if ( turn.number > currentTurn )
				{
					break;
				}

				for ( const pass of turn.passes )
				{
					if ( pass.action === `secondForkCharactersChoose` )
					{
						list.push({
							player: pass.extra[ 'player' ],
							path: pass.extra[ 'path' ]
						});
					}
				}
			}
			if ( list.length === 0 )
			{
				throw "getSecondForkBranchData should ne’er have no data.";
			}
			return list;
		},
		hasTakenLeftPathOnSecondBranch: function( data:Array<object> ):boolean
		{
			for ( const item of data ) {
				if ( data[ 'path' ] ) {
					return true;
				}
			}
			return false;
		},
		characterHasGottenSecondBranch: function( data:Array<object>, playerNumber:number ):boolean
		{
			for ( const item in data ) {
				if ( item[ 'player' ] === playerNumber ) {
					return true;
				}
			}
			return false;
		},
		secondBranchHasGottenBothPaths: function( data:Array<object> ):boolean
		{
			let gottenLeft:boolean = false;
			let gottenRight:boolean = false;
			for ( const item in data ) {
				if ( item[ 'path' ] ) {
					gottenLeft = true;
				}
				else {
					gottenRight = true;
				}
			}
			return gottenLeft && gottenRight;
		}
	});
})();
