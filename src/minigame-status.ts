export class MinigameStatus
{
	readonly type:string;
	readonly win:boolean;
	readonly bet:number;
	readonly misc:object;
	constructor( type:string, win:boolean, bet:number, misc:object = null )
	{
		this.type = type;
		this.win = win;
		this.bet = bet;
		this.misc = misc;
	}
};
