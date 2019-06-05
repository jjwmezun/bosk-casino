import { TurnStatus } from './turn-status';

export class Turn
{
	readonly number:number;
	readonly roll:number;
	readonly finished:boolean;
	readonly reachedEnd:boolean;
	readonly startingStatus:TurnStatus;
	readonly finalStatus:TurnStatus;
	readonly passStatuses:Array<TurnStatus>
	readonly pass:string[];
	readonly land:string;
	constructor
	(
		number:number,
		roll:number,
		finished:boolean,
		reachedEnd:boolean,
		startingStatus:TurnStatus,
		finalStatus:TurnStatus,
		passStatuses:Array<TurnStatus>,
		pass:string[],
		land:string
	)
	{
		this.number = number;
		this.roll = roll;
		this.finished = finished;
		this.reachedEnd = reachedEnd;
		this.startingStatus = startingStatus;
		this.finalStatus = finalStatus;
		this.passStatuses = passStatuses;
		this.pass = pass;
		this.land = land;
	}
};
