const Bosk = require( './bosk.js' );
import { ChanceCard } from './chance-card';
import { ChanceDeck } from './chance-deck';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';
const action = require( './action.ts' );
const config = require( `./config.ts` );

module.exports = Object.freeze
({
	cards:
	[
		new ChanceCard( `lose-money1`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeFunds( lastStatus, -20 ) ),
		new ChanceCard( `gain-money1`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeFunds( lastStatus, 200 ) ),
		new ChanceCard( `half-money`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeFunds( lastStatus, lastStatus.funds / 2 ) ),
		new ChanceCard( `warp-to-final-stretch`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeCurrentSpace( lastStatus, config.importantSpaces.thirdBranch.pathsMeet ) ),
		new ChanceCard( `warp-to-start`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeCurrentSpace( lastStatus, config.importantSpaces.start ) ),
		new ChanceCard( `pay-every-turn`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeFunds( lastStatus, (-10) * currentTurn.number ) ),
		new ChanceCard( `gain-every-turn`, ( currentTurn:Turn, lastStatus:TurnStatus ) => action.changeFunds( lastStatus, 10 * currentTurn.number ) )
	],
	run: function( currentTurn:Turn, latestStatus:TurnStatus ):TurnStatus
	{
		const newDeck:ChanceDeck = this.getNextCard( latestStatus.chanceDeck );
		return this.cards[ newDeck.latestCard ].action
		(
			currentTurn,
			new TurnStatus
			(
				"land",
				"chance",
				latestStatus.funds,
				latestStatus.currentSpace,
				newDeck
			)
		);
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
