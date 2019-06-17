const Bosk = require( './bosk.js' );
import { ChanceCard } from './chance-card';
import { ChanceDeck } from './chance-deck';
import { TurnStatus } from './turn-status';

module.exports = Object.freeze
({
	cards:
	[
		new ChanceCard( `lose-money`, `Fell into religious cult scam: pay 50 chips` ),
		new ChanceCard( `warp-to-end`, `Spring straight to the start o&rsquo; the final road` ),
		new ChanceCard( `warp-to-start`, `Fall back to the start` )
	],
	run: function( latestStatus:TurnStatus ):TurnStatus
	{
		const newDeck:ChanceDeck = this.getNextCard( latestStatus.chanceDeck );
		return Object.freeze( new TurnStatus(
			"land",
			"chance",
			latestStatus.funds,
			latestStatus.currentSpace,
			newDeck
		));
	},
	getNextCard: function( deck:ChanceDeck ):ChanceDeck
	{
		const newDeck:number[] = ( deck.deck.length <= 1 )
			? this.getShuffledDeck() // If deck is on last card, get reshuffled deck.
			: deck.deck.slice( 0, deck.deck.length - 1 ); // Else, get last deck, but without the last entry ( equivalent o' pop ).
		return Object.freeze( new ChanceDeck(
			newDeck,
			Bosk.getEndOfList( deck.deck )
		));
	},
	createDeck: function():ChanceDeck
	{
		return Object.freeze( new ChanceDeck(
			this.getShuffledDeck(),
			null
		));
	},
	getShuffledDeck: function():number[]
	{
		return Bosk.shuffleList( Array.from( this.cards.keys() ) );
	}
});
