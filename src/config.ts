module.exports = Object.freeze
({
	startingFunds: 20,
	maxTurns: 25,
	players: [ `Autumn`, `Edgar`, `Dawn` ],
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
			FIRST_pathsMeet: 28,
			topPathStart: 45,
			bottomPathStart: 30,
			pathsMeet: 53
		}
	})
});
