const assert = require( `chai` ).assert;
const casino = require( `../src/casino.js` );
const bosk = require( `../src/bosk.js` );

// Convenience function created only for this test.
Array.prototype.lastEntry = function() { return this[ this.length - 1 ]; };

const runTest = function( lambda, count, values )
{
	if ( values === undefined )
	{
		values = [];
	}

	if ( count === undefined )
	{
		count = 1000;
	}

	for ( let i = 0; i < count; i++ )
	{
		values.push( lambda( values, i ) );
	}
	return values;
}

// Test Die Roll
dieRolls = runTest( function()
{
	const value = casino.rollDie();
	assert.isAtMost( value, 6 );
	assert.isAtLeast( value, 1 );
	return value;
});

// Test getRandomPlayer
randomPlayers = runTest( function()
{
	const value = casino.getRandomPlayer();
	assert.isOk( value === `Autumn` || value === `Edgar` || value === `Dawn` );
	return value;
});

// Test board
runTest( () => assert.equal( casino.board.length, 61 ) );

// Test chance card decks.
const decks = runTest
(
	function( decks )
	{
		const card = casino.chance.getNextCard( decks.lastEntry() );
		// For every deck, test that the lastCard entry is equal to the last item on the deck entry o’ the previous deck.
		assert.equal( card.lastCard, decks.lastEntry().deck.lastEntry() );
		return card;
	},
	20,
	[ casino.chance.createDeck() ]
);

// Test 1st Turn
const firstTurn = casino.createFirstTurn();
assert.equal( firstTurn.number, 0 );
assert.equal( firstTurn.funds, casino.config.startingFunds );
assert.isNotOk( firstTurn.finished );
assert.isNotOk( firstTurn.reachedEnd );
assert.isNull( firstTurn.land );
assert.isNull( firstTurn.pass );

// Test multiple turns.
const turns = runTest
(
	function( turns, i )
	{
		const turn = casino.getNextTurn( turns );
		assert.isAtMost( turn.number, casino.config.maxTurns );
		assert.isAtLeast( turn.number, 1 );
		// Test that game finishes on maxTurns turn.
		if ( i === casino.config.maxTurns )
		{
			assert.isOk( turn.finished );
		}
		if ( !turn.finished )
		{
			assert.equal( turn.roll, turn.pass.length ); // Test we have a pass for every space we pass.
		}
		return turn;
	},
	30,
	[ firstTurn ]
);
console.log( turns );
