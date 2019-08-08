export class Guesses
{
	readonly correct:number;
	readonly autumn:number;
	readonly dawn:number;
	readonly chosen;
	constructor( correct:number, autumn:number, dawn:number, chosen )
	{
		this.correct = correct;
		this.autumn = autumn;
		this.dawn = dawn;
		this.chosen = chosen;
	}
};
