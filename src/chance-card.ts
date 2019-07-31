export class ChanceCard
{
	readonly type:string;
	readonly action;

	constructor( type:string, action )
	{
		this.type = type;
		this.action = action;
	}
};
