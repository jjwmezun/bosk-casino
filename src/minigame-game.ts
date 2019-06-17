export class MinigameGame
{
	readonly type:string;
	readonly name:string;
	readonly difficulty:number;
	constructor( type:string, name:string, difficulty:number )
	{
		this.type = type;
		this.name = name;
		this.difficulty = difficulty;
	}
};
