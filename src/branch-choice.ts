export class BranchChoice
{
	readonly player:number;
	readonly choice:boolean;

	constructor( player:number, choice:boolean )
	{
		this.player = player;
		this.choice = choice;
	}
};
