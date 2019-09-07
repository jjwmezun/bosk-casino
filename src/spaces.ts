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
		const path:boolean = Bosk.randBoolean();
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
			"gain5": ( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus => action.changeFunds( lastStatus, 5 ),
			"gain10": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeFunds( lastStatus, 10 );
			},
			"lose5": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeFunds( lastStatus, -5 );
			},
			"lose10": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeFunds( lastStatus, -10 );
			},
			"chance": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return chance.run( currentTurn, lastStatus );
			},
			"minigame": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return minigame.run( lastStatus );
			},
			"warpToStart": ( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus => action.changeCurrentSpace( lastStatus, config.importantSpaces.start ),
			"goPastCycle": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.pathsMeet );
			},
			"final": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
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
