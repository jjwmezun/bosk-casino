export class TurnStatus
{
	readonly funds:number;
	readonly currentSpace:number;
	constructor( funds:number, currentSpace:number )
	{
		this.funds = funds;
		this.currentSpace = currentSpace;
	}
};
