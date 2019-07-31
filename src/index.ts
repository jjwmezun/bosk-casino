module.exports = ( function()
{
	const casino = require( './casino.ts' );
	const script = require( './script.ts' );
	
	return Object.freeze
	({
		run: function():string
		{
			return script.generateForConsole( casino.run() );
		}
	})
})();
