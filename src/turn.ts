export class Turn
{
	readonly number:number;
	readonly finished:boolean;
	readonly reachedEnd:boolean;
	readonly roll:number;
	readonly currentSpace:number;
	readonly funds:number;
	readonly pass:string[];
	readonly land:string;
	constructor( number, finished, reachedEnd, roll, currentSpace, funds, pass, land )
	{
		this.number = number;
		this.finished = finished;
		this.reachedEnd = reachedEnd;
		this.roll = roll;
		this.currentSpace = currentSpace;
		this.funds = funds;
		this.pass = pass;
		this.land = land;
	}
};
