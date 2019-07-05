import { Game } from './game';

module.exports = Object.freeze
({
	generateForConsole: function( data:Game ):string
	{
		return this.generateParagraphs( data ).join( "\n\t" );
	},
	generateParagraphs: function( data:Game ):readonly string[]
	{
		const paragraphs:string[] = [];
		paragraphs.push( 'Hello.' );
		return Object.freeze( paragraphs );
	}
});
