export class MinigameStatus
{
	readonly type:string;
	readonly win:boolean;
	readonly bet:number;
	constructor( type:string, win:boolean, bet:number )
	{
		this.type = type;
		this.win = win;
		this.bet = bet;
	}
};
