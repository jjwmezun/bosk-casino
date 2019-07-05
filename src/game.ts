import { Turn } from './turn';

export class Game
{
	readonly playerOrder:number[];
	readonly turnList:Array<Turn>

	constructor( playerOrder:number[], turnList:Array<Turn> )
	{
		this.playerOrder = playerOrder;
		this.turnList = turnList;
	}
};
