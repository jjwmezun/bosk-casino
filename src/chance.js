const Bosk = require( './bosk.js' );

module.exports = function()
{
	return Object.freeze
	({
		cards:
		[
			{
				type: `lose-money`,
				message: `Fell into religious cult scam: pay 50 chips`,
				method: function()
				{
				}
			},
			{
				type: `warp-to-end`,
				message: `Spring straight to the start o&rsquo; the final road`,
				method: function()
				{
				}
			},
			{
				type: `warp-to-start`,
				message: `Fall back to the start`,
				method: function()
				{
				}
			}
		],
		getNextCard: function( deck )
		{
			const newDeck = ( deck.deck.length <= 1 )
				? this.getShuffledDeck() // If deck is on last card, get reshuffled deck.
				: deck.deck.slice( 0, deck.deck.length - 1 ); // Else, get last deck, but without the last entry ( equivalent o' pop ).
			return Object.freeze({
				deck: newDeck,
				lastCard: Bosk.getEndOfList( deck.deck )
			});

		},
		createDeck: function()
		{
			return Object.freeze({
				deck: this.getShuffledDeck(),
				lastCard: null
			});
		},
		getShuffledDeck: function()
		{
			return Bosk.shuffleList( Array.from( this.cards.keys() ) );
		}
	});
};
