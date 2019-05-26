/* =UTILITY FUNCTIONS
=====================================================*/

	var Bosk = {};

	Bosk.isArray = function( thing )
	{
		return thing instanceof Array;
	};

	Bosk.dirUploads = function()
	{
		return 'http://localhost/bosk2/public/';
	};

	Bosk.isEven = function( n )
	{
		return n % 2 === 0;
	};

	Bosk.shuffleList = function( list )
	{
		return list.sort( function() { return 0.5 - Math.random() } );
	};

	Bosk.inList = function( list, val )
	{
		return list.some
		(
			function( currentValue )
			{
				return currentValue === val;
			}
		);
	};

	Bosk.rand = function( closure, ignore )
	{
		if ( ignore === undefined )
		{
			ignore = null;
		}

		if ( !Bosk.isArray( ignore ) )
		{
			ignore = [ ignore ];
		}

		var x = null;

		do
		{
			x = closure();
		}
		while ( Bosk.inList( ignore, x ) )

		return x;
	};

	Bosk.randInt = function( max, min, ignore )
	{
		if ( max === undefined )
		{
			max = 1;
		}
		if ( min === undefined )
		{
			min = 0;
		}
		if ( ignore === undefined )
		{
			ignore = null;
		}

		return Bosk.rand( function() { return Math.floor( ( Math.random() * ( max + 1 - min ) ) + min ); }, ignore );
	};

	Bosk.randListIndex = function( list, ignore )
	{
		return Bosk.randInt( list.length - 1, 0, ignore );
	};

	Bosk.randListEntry = function( list, ignore )
	{
		return Bosk.rand( function() { return list[ Bosk.randListIndex( list ) ]; }, ignore );
	};

	Bosk.randBoolean = function()
	{
		return 1 === Bosk.randInt( 1, 0 );
	};

	Bosk.randPercent = function( percent )
	{
		return this.randInt( 100, 0 ) < percent;
	};

	Bosk.objLength = function( obj )
	{
		return Object.keys( obj ).length;
	};

	Bosk.objIndex = function( obj, n )
	{
		return Object.keys( obj )[ n ];
	};

	Bosk.consoleError = function( string )
	{
		console.log( `%c ERROR: ${ string }`, `color: #f55` );
	};

	Bosk.nSort = function( list )
	{
		return list.sort( function( a, b ) { return a - b; } );
	};

	Bosk.average = function( list )
	{
		var sum = 0;

		for ( var i = 0; i < list.length; i++ )
		{
			sum += list[ i ];
		}

		return sum / list.length;
	};

	Bosk.median = function( list )
	{
		var sorted_list = this.nSort( list );
		var middle_index = null;

		if ( this.isEven( list.length ) )
		{
			return sorted_list[ list.length / 2 ];
		}
		else
		{
			middle_index = Math.floor( list.length / 2 );
			return ( sorted_list[ middle_index ] + sorted_list[ middle_index + 1 ] ) / 2;
		}
	};

	Bosk.listMaxorMix = function( list, comp )
	{
		var v = undefined;

		for ( var i = 0; i < list.length; i++ )
		{
			if ( undefined === v || comp( v, list[ i ] ) )
			{
				v = list[ i ];
			}
		}

		return v;
	};

	Bosk.listMax = function( list )
	{
		return this.listMaxorMix( list, function( max, item ) { return max < item; } );
	};

	Bosk.listMin = function( list )
	{
		return this.listMaxorMix( list, function( min, item ) { return min > item; } );
	};

	Bosk.getEndOfList = function( list )
	{
		return list[ list.length - 1 ];
	};


Bosk.PageCode = function()
{
	var s;
	var slist;

	s = window.location.href;
	s = s.replace( ".html", "/" );
	slist = s.split( "/" );
	slist.pop();
	return "story_" + slist.pop();
};

module.exports = Bosk;
