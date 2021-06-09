import { ChanceDeck } from './chance-deck';
import { MinigameStatus } from './minigame-status';

export class TurnStatus
{
	readonly type:string;
	readonly action:string;
	readonly funds:number;
	readonly currentSpace:number;
	readonly chanceDeck:ChanceDeck;
	readonly reachedEnd:boolean;
	readonly extra:any;
	constructor( type:string, action:string, funds:number, currentSpace:number, chanceDeck:ChanceDeck, reachedEnd:boolean = false, extra:any = null )
	{
		this.type = type;
		this.action = action;
		this.funds = funds;
		this.currentSpace = currentSpace;
		this.chanceDeck = chanceDeck;
		this.reachedEnd = reachedEnd;
		this.extra = extra;
	}
};
