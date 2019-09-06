export class Text
{
	text:Array<string>;

	constructor( text:any )
	{
		if ( typeof text === 'string' )
		{
			this.text = [ text ];
		}
		else if ( typeof text === 'object' && Array.isArray( text ) )
		{
			this.text = text;
		}
		else
		{
			throw `Invalid type given to Text constructor: ${ text }`
		}
	}

	add( text:string )
	{
		this.text.push( text );
	}

	addList( text:Array<string> )
	{
		for ( const line of text )
		{
			this.add( line );
		}
	}

	get()
	{
		return this.text;
	}
};
