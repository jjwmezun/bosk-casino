class Minigame
{
	readonly type:string;
	readonly name:string;
	readonly difficulty:number;
	constructor( type:string, name:string, difficulty:number )
	{
		this.type = type;
		this.name = name;
		this.difficulty = difficulty;
	}
};

( function()
{
	const Bosk = require( '../src/bosk.js' );

	module.exports = Object.freeze
	({
		minigames:
		[
			new Minigame( 'karts', 'Bumper Karts', 50 ),
			new Minigame( 'tower', 'Tower', 75 ),
			new Minigame( 'count', 'Keep Count', 25 )
		],
		getRandomMinigame: function():Minigame
		{
			return Bosk.randListEntry( this.minigames );
		},
		testWin: function( minigame:Minigame ):boolean
		{
			return Bosk.randInt( 99, 0 ) > minigame.difficulty;
		},
		getRandomBet: function():number
		{
			return Bosk.randListEntry( this.generateListOfIncrements( 5, 5, 100 ) );
		},
		generateListOfIncrements: function( increment:number, min:number, max:number ):number[]
		{
			const list:number[] = [];
			for ( let i = min; i <= max; i += increment )
			{
				list.push( i );
			}
			return list;
		}
	});
})();
