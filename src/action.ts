import { TurnStatus } from './turn-status';

module.exports = Object.freeze
({
    changeFunds: function( lastStatus:TurnStatus, amount:number ):TurnStatus
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
    },
    changeCurrentSpace: function( lastStatus:TurnStatus, newSpace:number ):TurnStatus
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
});
