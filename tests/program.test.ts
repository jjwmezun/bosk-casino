const program = require( '../src/program.ts' );

test
(
    'run returns string',
    function()
    {
      const text:string = program.runForConsole();
      expect( text ).not.toEqual( '' );
      console.log( text );
    }
);

const getWordsList = ( text:string ):string[] => text.split( /\s/ ).filter( ( word:string ) => word !== `` );
const countWords = ( text:string ):number => getWordsList( text ).length;

test
(
    'run returns string',
    function()
    {
        const wordCounts:number[] = [];
        for ( let i = 0; i < 1000; ++i ) {
            wordCounts.push( countWords( program.runForConsole() ) );

        }
        expect( wordCounts ).not.toEqual( [] );
        const max:number = wordCounts.reduce( ( a, b ) => Math.max( a, b ) );
        const min:number = wordCounts.reduce( ( a, b ) => Math.min( a, b ) );
        const average:number = Math.round( wordCounts.reduce( ( a, b ) => a + b ) / wordCounts.length );
        console.log( wordCounts );
        console.log( `Max: ${ max }` );
        console.log( `Min: ${ min }` );
        console.log( `Average: ${ average }` );
    }
);