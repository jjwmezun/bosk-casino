const chance = require( '../src/chance.ts' );

test
(
    'Card indices are ’tween 0 & length o’ card list',
    function()
    {
		const deck:number[] = chance.getShuffledDeck();
		for ( const card of deck )
		{
			expect( card ).toBeGreaterThanOrEqual( 0 );
			expect( card ).toBeLessThanOrEqual( chance.cards.length - 1 );
		}
    }
);

test
(
    'No duplicate card indices',
    function()
    {
		const deck:number[] = chance.getShuffledDeck();
		const indicesUsed:number[] = [];
		for ( const card of deck )
		{
			expect( indicesUsed ).not.toContain( card );
			indicesUsed.push( card );
		}
    }
);

test
(
    'Deck always has a last card ’cept the 1st deck.',
    function()
    {
		let deck:Deck = chance.createDeck();
		expect( deck.latestCard ).toBe( null );
		for ( let i = 0; i < 100; i++ )
		{
			deck = chance.getNextCard( deck );
			expect( deck.latestCard ).not.toBe( null );
		}
    }
);

test
(
    'Deck lengths always correct.',
    function()
    {
		const deckList:Array<Deck> = [ chance.createDeck() ];
		for ( let i = 0; i < 100; i++ )
		{
			const previousDeck = deckList[ deckList.length - 1 ];
			deckList.push( chance.getNextCard( previousDeck ) );
			const currentDeck = deckList[ deckList.length - 1 ];
			if ( previousDeck.deck.length > 1 )
			{
				// Should be 1 less than previous.
				expect( currentDeck.deck.length ).toBe( previousDeck.deck.length - 1 );
			}
			else
			{
				// Since deck should be shuffled, deck length should be length o’ all cards.
				expect( currentDeck.deck.length ).toBe( chance.cards.length );
			}
		}
    }
);
