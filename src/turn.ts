import { TurnStatus } from './turn-status';

export class Turn
{
	readonly number:number;
	readonly roll:number;
	readonly finished:boolean;
	readonly reachedEnd:boolean;
	readonly startingStatus:TurnStatus;
	readonly passes:Array<TurnStatus>;
	readonly land:TurnStatus;
	constructor
	(
		number:number,
		roll:number,
		finished:boolean,
		reachedEnd:boolean,
		startingStatus:TurnStatus,
		passes:Array<TurnStatus>,
		land:TurnStatus
	)
	{
		this.number = number;
		this.roll = roll;
		this.finished = finished;
		this.reachedEnd = reachedEnd;
		this.startingStatus = startingStatus;
		this.passes = passes;
		this.land = land;
	}
};
