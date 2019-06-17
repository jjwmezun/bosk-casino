export class ChanceCard
{
	readonly type:string;
	readonly message:string;

	constructor( type:string, message:string )
	{
		this.type = type;
		this.message = message;
	}
};
