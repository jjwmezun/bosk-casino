const Bosk = require( './bosk.js' );
const chance = require( './chance.ts' );
const minigame = require( './minigame.ts' );
import { Turn } from './turn';
import { TurnStatus } from './turn-status';

const changeFunds = function( lastStatus:TurnStatus, amount:number ):TurnStatus
{
	return Object.freeze( new TurnStatus
	(
		lastStatus.type,
		lastStatus.action,
		lastStatus.funds + amount,
		lastStatus.currentSpace,
		lastStatus.chanceDeck,
		lastStatus.reachedEnd
	));
}

const changeCurrentSpace = function( lastStatus:TurnStatus, newSpace:number ):TurnStatus
{
	return Object.freeze( new TurnStatus
	(
		lastStatus.type,
		lastStatus.action,
		lastStatus.funds,
		newSpace,
		lastStatus.chanceDeck,
		lastStatus.reachedEnd
	));
}

module.exports = function( config )
{
	return Object.freeze
	({
		"land":
		{
			"gain5": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeFunds( lastStatus, 5 );
			},
			"gain10": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeFunds( lastStatus, 10 );
			},
			"lose5": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeFunds( lastStatus, -5 );
			},
			"lose10": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeFunds( lastStatus, -10 );
			},
			"chance": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return chance.run( lastStatus );
			},
			"minigame": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return minigame.run( lastStatus );
			},
			"warpToStart": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace( lastStatus, config.importantSpaces.start );
			},
			"goPastCycle": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.pathsMeet );
			}
		},
		"pass":
		{
			"firstForkOddOrEven": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace
				(
					lastStatus,
					( currentTurn.number % 2 === 0 ) ? config.importantSpaces.firstBranch.bottomPathStart : config.importantSpaces.firstBranch.topPathStart
				);
			},
			"toStart": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace( lastStatus, config.importantSpaces.start );
			},
			"secondForkCharactersChoose": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace
				(
					lastStatus,
					( Bosk.randBoolean() ) ? config.importantSpaces.secondBranch.leftPathStart : config.importantSpaces.secondBranch.rightPathStart
				);
			},
			"secondBranchPathsMeet": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.pathsMeet );
			},
			"secondBranchPathStart": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace( lastStatus, config.importantSpaces.secondBranch.rightPathStart );
			},
			"thirdForkRandom": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace
				(
					lastStatus,
					( Bosk.randBoolean() ) ? config.importantSpaces.thirdBranch.topPathStart : config.importantSpaces.thirdBranch.bottomPathStart
				);
			},
			"thirdBranchPathsMeet": function( currentTurn:Turn, lastStatus:TurnStatus ):TurnStatus
			{
				return changeCurrentSpace( lastStatus, config.importantSpaces.thirdBranch.pathsMeet );
			}
		}
	});
};
