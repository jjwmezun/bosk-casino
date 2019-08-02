import { MinigameStatus } from './minigame-status';

export class MinigameInfo
{
	statuses:Array<MinigameStatus>
	numbers:object
	constructor()
	{
		this.statuses = [];
		this.numbers = { karts: 0, tower: 0, count: 0 };
	}

	getStatuses():Array<MinigameStatus>
	{
		return this.statuses;
	}

	getNumber( type:string ):number
	{
		return this.numbers[ type ];
	}

	addMinigame( status:MinigameStatus ):void
	{
		this.addStatus( status );
		this.increaseNumber( status.type );
	}

	addStatus( status:MinigameStatus ):void
	{
		this.statuses.push( status );
	}

	increaseNumber( type:string ):void
	{
		this.numbers[ type ]++;
	}
};
