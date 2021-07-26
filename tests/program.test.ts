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
