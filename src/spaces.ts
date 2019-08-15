const Bosk = require( './bosk.js' );
import { Game } from './game';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';

module.exports = function( config )
{
	const chance = require( './chance.ts' );
	const minigame = require( './minigame.ts' );
	const analyze = require( `./analyze.ts` );
	const action = require( './action.ts' );

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
					( function() {
						const isFirstPass:boolean = analyze.timesPassOTypes( game, currentTurn.number, [ `firstForkOddOrEven` ] );
						if ( isFirstPass ) {
							return Bosk.randBoolean();
						}
						else {
							const forkValues:object = analyze.forkValues( game, currentTurn.number, `firstForkOddOrEven` );
							console.log( forkValues );
							return true;
						}
					}) ? config.importantSpaces.firstBranch.bottomPathStart : config.importantSpaces.firstBranch.topPathStart
				);
			},
			"toStart": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace( lastStatus, config.importantSpaces.start );
			},
			"secondForkCharactersChoose": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return action.changeCurrentSpace
				(
					lastStatus,
					( Bosk.randBoolean() ) ? config.importantSpaces.secondBranch.leftPathStart : config.importantSpaces.secondBranch.rightPathStart
				);
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
