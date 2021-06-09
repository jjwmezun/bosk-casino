import { Game } from './game';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';




module.exports = function( config )
{
	const Bosk = require( './bosk.js' );
	const chance = require( './chance.ts' );
	const minigame = require( './minigame.ts' );
	const analyze = require( `./analyze.ts` );
	const action = require( './action.ts' );

	const testCharacterChooseBranch = function( game:Game, currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus {
		const currentPlayer:number = analyze.getTurnPlayer( game, currentTurn );
		const currentPlayerString:string = config.players[ currentPlayer ];
		const secondForkBranchData:Array<object> = analyze.getSecondForkBranchData( game, currentTurn.number - 1 );
		const isFirstTime:boolean = secondForkBranchData.length === 0;
		const path:boolean = ( function()
		{
			switch ( currentPlayerString )
			{
				case ( `Autumn` ):
				{
					const hasTakenLeftPath:boolean = analyze.hasTakenPathOnSecondBranch( secondForkBranchData, true );
					const hasTakenRightPath:boolean = analyze.hasTakenPathOnSecondBranch( secondForkBranchData, false )
					const hasGottenFuckedByLeftPath:boolean = hasTakenLeftPath && analyze.timesLandOTypes( game, currentTurn.number, `warpToStart` ) > 0;
					const hasGottenFuckedByRightPath:boolean = hasTakenRightPath && analyze.timesPassOTypes( game, currentTurn.number, `secondBranchPathStart` ) > 0;
					const gottenBothPathsBefore:boolean = analyze.secondBranchHasGottenBothPaths( secondForkBranchData );
					return ( isFirstTime ) ?
						Bosk.randBoolean() :
							( hasGottenFuckedByLeftPath && hasGottenFuckedByRightPath ) ?
								Bosk.randBoolean() :
									( hasGottenFuckedByLeftPath ) ?
										false :
											( hasGottenFuckedByRightPath ) ?
												true :
													( gottenBothPathsBefore ) ?
														true :
															secondForkBranchData[ secondForkBranchData.length - 1 ][ `path` ];
				}
				break;
				case ( `Edgar` ):
				{
					return false;
				}
				break;
				case ( `Dawn` ):
				{
					return analyze.dawns2ndBranchAlgorithm( lastStatus.funds, currentTurn.number );
				}
				break;
				default:
				{
					throw "Invalid character for testCharacterChooseBranch.";
				}
				break;
			}
		})();
		return Object.freeze( new TurnStatus
    	(
    		lastStatus.type,
    		lastStatus.action,
    		lastStatus.funds,
    		( path ) ? config.importantSpaces.secondBranch.leftPathStart : config.importantSpaces.secondBranch.rightPathStart,
    		lastStatus.chanceDeck,
    		lastStatus.reachedEnd,
			{ player: currentPlayer, path: path }
    	));
	};

	return Object.freeze
	({
		"land":
		{
			"gain5": ( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus => action.changeFunds( lastStatus, 5 ),
			"gain10": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return action.changeFunds( lastStatus, 10 );
			},
			"lose5": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return action.changeFunds( lastStatus, -5 );
			},
			"lose10": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return action.changeFunds( lastStatus, -10 );
			},
			"chance": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return chance.run( currentTurn, lastStatus );
			},
			"minigame": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return minigame.run( currentTurn, lastStatus, game );
			},
			"warpToStart": ( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus => action.changeCurrentSpace( lastStatus, config.importantSpaces.start ),
			"goPastCycle": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.pathsMeet );
			},
			"final": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return ( currentTurn.number <= config.endingBonus.bestBonus.turns )
					? action.changeFunds( lastStatus, config.endingBonus.bestBonus.bonus )
					: ( ( currentTurn.number <= config.endingBonus.middleBonus.turns )
						? action.changeFunds( lastStatus, config.endingBonus.middleBonus.bonus )
						: action.changeFunds( lastStatus, config.endingBonus.minimumBonus ) )
			}
		},
		"pass":
		{
			"firstForkOddOrEven": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return action.changeCurrentSpace
				(
					lastStatus,
					( currentTurn.number % 2 === 0 ) ? config.importantSpaces.firstBranch.bottomPathStart : config.importantSpaces.firstBranch.topPathStart
				);
			},
			"toStart": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.start );
			},
			"secondForkCharactersChoose": function( currentTurn:Turn, lastStatus:TurnStatus, game:Game ):TurnStatus
			{
				return testCharacterChooseBranch( game, currentTurn, lastStatus );
			},
			"secondBranchPathsMeet": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.pathsMeet );
			},
			"secondBranchPathStart": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.rightPathStart );
			},
			"thirdForkRandom": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace
				(
					lastStatus,
					( Bosk.randBoolean() ) ? config.importantSpaces.thirdBranch.topPathStart : config.importantSpaces.thirdBranch.bottomPathStart
				);
			},
			"thirdBranchPathsMeet": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.thirdBranch.pathsMeet );
			}
		}
	});
};
