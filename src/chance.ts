const Bosk = require( './bosk.js' );

class Card
{
	readonly type:string;
	readonly message:string;

	constructor( type:string, message:string )
	{
		this.type = type;
		this.message = message;
	}
};

class Deck
{
	readonly deck:number[];
	readonly latestCard:number;
	constructor( deck:number[], latestCard:number )
	{
		this.deck = deck;
		this.latestCard = latestCard;
	}
};

module.exports = Object.freeze
({
	cards:
	[
		new Card( `lose-money`, `Fell into religious cult scam: pay 50 chips` ),
		new Card( `warp-to-end`, `Spring straight to the start o&rsquo; the final road` ),
		new Card( `warp-to-start`, `Fall back to the start` )
	],
	getNextCard: function( deck:Deck ):Deck
	{
		const newDeck:number[] = ( deck.deck.length <= 1 )
			? this.getShuffledDeck() // If deck is on last card, get reshuffled deck.
			: deck.deck.slice( 0, deck.deck.length - 1 ); // Else, get last deck, but without the last entry ( equivalent o' pop ).
		return Object.freeze( new Deck(
			newDeck,
			Bosk.getEndOfList( deck.deck )
		));
	},
	createDeck: function():Deck
	{
		return Object.freeze( new Deck(
			this.getShuffledDeck(),
			null
		));
	},
	getShuffledDeck: function():number[]
	{
		return Bosk.shuffleList( Array.from( this.cards.keys() ) );
	}
});
