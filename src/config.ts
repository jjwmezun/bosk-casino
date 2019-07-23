module.exports = Object.freeze
({
	startingFunds: 20,
	maxTurns: 25,
	players: [ `Autumn`, `Edgar`, `Dawn` ],
	playerNumberFromName: function( name:string ):number
	{
		for ( let i = 0; i < this.players; i++ )
		{
			const player = this.players[ i ];
			if ( player === name )
			{
				return i;
			}
		}
		throw "Invalid character name";
	},
	importantSpaces: Object.freeze
	({
		start: 0,
		firstBranch:
		{
			topPathStart: 11,
			bottomPathStart: 7
		},
		secondBranch:
		{
			leftPathStart: 12,
			rightPathStart: 19,
			pathsMeet: 28
		},
		thirdBranch:
		{
			topPathStart: 45,
			bottomPathStart: 30,
			pathsMeet: 53
		}
	}),
	endingBonus:
	{
		bestBonus:
		{
			turns: 10,
			bonus: 100
		},
		middleBonus:
		{
			turns: 15,
			bonus: 50
		},
		minimumBonus: 25
	}
});
