export class MinigameGame
{
	readonly type:string;
	readonly name:string;
	readonly difficulty:number;
	constructor( type:string, difficulty:number )
	{
		this.type = type;
		this.difficulty = difficulty;
	}
};
