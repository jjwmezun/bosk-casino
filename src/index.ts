const casino = require( './casino.ts' );
const script = require( './script.ts' );

module.exports =
{
	run: function():string
	{
		return script.generateForConsole( casino.run() );
	}
};
