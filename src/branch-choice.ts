export class BranchChoice
{
	readonly player:number;
	readonly choice:boolean;
	readonly turn:number;

	constructor( player:number, choice:boolean, turn:number )
	{
		this.player = player;
		this.choice = choice;
		this.turn = turn;
	}
};
