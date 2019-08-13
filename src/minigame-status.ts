export class MinigameStatus
{
	readonly type:string;
	readonly win:boolean;
	readonly bet:number;
	readonly misc;
	constructor( type:string, win:boolean, bet:number, misc = null )
	{
		this.type = type;
		this.win = win;
		this.bet = bet;
		this.misc = misc;
	}
};
