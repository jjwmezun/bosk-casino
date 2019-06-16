export class TurnStatus
{
	readonly type:string;
	readonly action:string;
	readonly funds:number;
	readonly currentSpace:number;
	readonly reachedEnd:boolean;
	constructor( type:string, action:string, funds:number, currentSpace:number, reachedEnd:boolean = false )
	{
		this.type = type;
		this.action = action;
		this.funds = funds;
		this.currentSpace = currentSpace;
		this.reachedEnd = reachedEnd;
	}
};
