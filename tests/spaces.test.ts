/*
const analyze = require( '../src/analyze.ts' );

class AlgorithmOutcome
{
    readonly funds:number;
    readonly turn:number;
    readonly path:boolean;

    constructor( funds:number, turn:number, path:boolean )
    {
        this.funds = funds;
        this.turn = turn;
        this.path = path;
    }
}

test
(
    `test that Dawn's 2nd branch algorithm isn’ too consistent.`,
    function()
    {
        const table:Array<AlgorithmOutcome> = [];
        let totalTrues:number = 0;
        let totalFalses:number = 0;

        let turn:number = 0;
        while ( turn < 25 )
        {
            let funds:number = 0;
            while ( funds < 400 )
            {
                const path:boolean = analyze.dawns2ndBranchAlgorithm( funds, turn );
                table.push( new AlgorithmOutcome( funds, turn, path ) );
                //console.log( `FUNDS: ${ funds }\tTURN: ${ turn }\tPATH: ${ path }` );
                if ( path )
                {
                    totalTrues++;
                }
                else
                {
                    totalFalses++;
                }
                funds += 25;
            }
            turn++;
        }

        //console.log( `TOTAL TRUE: ${ totalTrues }\tTOTAL FALSES: ${ totalFalses }` );
        expect( true ).toEqual( true );
    }
);
*/