export class ChanceDeck
{
	readonly deck:number[];
	readonly latestCard:number;
	constructor( deck:number[], latestCard:number )
	{
		this.deck = deck;
		this.latestCard = latestCard;
	}
};
