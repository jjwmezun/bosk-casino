import { Game } from './game';
import { Turn } from './turn';

( function()
{
	const analyze = require( `./analyze.ts` );
	const config = require( `./config.ts` );

	const playerNames:object = Object.freeze
	({
		Autumn: "Autumn",
		Edgar: "Edgar",
		Dawn: "Dawn"
	});

	module.exports = Object.freeze
	({
		generateForHTML: function( data:Game ):string
		{
			const content = this.generateParagraphs( data )
				.join( "\n" )
				.replace( /</g, '<q>' )
				.replace( />/g, '</q>' )
				.replace( /<q<\/q>/g, '<q>' )
				.replace( /\[i\]/g, '<em>' )
				.replace( /\[\/i\]/g, '</em>' )
				.replace( /\n/g, '</p><p>' );
			return `<p>${ content }</p>`;
		},
		generateForConsole: function( data:Game ):string
		{
			return this.generateParagraphs( data ).join( "\n\t" );
		},
		generateParagraphs: function( data:Game ):readonly string[]
		{
			let paragraphs:string[] = this.addParagraphs( [], this.firstRollText( data ) );
			for ( const turn of data.turnList )
			{
				paragraphs = this.addParagraphs( paragraphs, this.getRollText( data, turn ) );
			}
			const finalTurn:Turn = data.turnList[ data.turnList.length - 1 ];
			paragraphs = this.addParagraphs( paragraphs, this.getEndingScript( finalTurn, data ) );
			return Object.freeze( paragraphs );
		},
		addParagraph: function( list:string[], newParagraph:string ):readonly string[]
		{
			const newList:string[] = list.slice( 0 );
			if ( newParagraph !== '' )
			{
				newList.push( newParagraph );
			}
			return Object.freeze( newList );
		},
		addParagraphs: function( list:string[], newParagraphs:string[] ):string[]
		{
			return list.concat( newParagraphs );
		},
		getRollText: function( game:Game, turn:Turn ):readonly string[]
		{
			return Object.freeze( ( function()
			{
				switch ( turn.number )
				{
					case ( 0 ):
					case ( 1 ):
					{
						return [];
					}
					break;

					case ( 2 ):
					{
						const paragraphs = [
							`<All right, ¿now who wants to roll next?>, asked Dawn.`
						];
						const choices = Object.freeze
						({
							Autumn:
							[
								`She looked @ Autumn. <¿You wanna try, Autumn?>.`,
								`Autumn shrugged. <If you so desire>. She took the die from Dawn. As she rolled she added, <But don’t complain if I make us land in jail or some shit>.`,
								`<There is no jail in this game>, said Dawn. <Don’t fret ’bout doing well or badly. This is just for fun, ¿remember?>.`,
								`<Such a concept is alien to my programming>.`,
								`Autumn rolled the die for less than a second in 1 limp wrist before flicking it out onto the floor. She glanced down to see that it said “${ turn.roll }”.`
							],
							Edgar:
							[
								`She looked @ Edgar. <¿You wanna try, Edgar?>.`,
								`<If you want me to>.`,
								`Edgar took the die from Dawn & began rolling it. He took a deep breath, & then finally released the die to the ground as if pushing it ’way. Looking down @ it, they all saw that it showed “${ turn.roll }”.`
							],
							Dawn:
							[
								`<¿Why don’t you try now, since you’re the expert here?>, asked Autumn.`,
								`<If you insist>. Dawn began rolling the die with frantic energy, & then threw the die on the ground with aplomb. She looked down & saw that she’d rolled a ${ turn.roll }.`
							]
						});
						return paragraphs.concat( choices[ config.players[ analyze.getTurnPlayer( game, turn ) ] ] );
					}
					break;

					case ( 3 ):
					{
						const choices = Object.freeze({
							Autumn:
							[
								`Dawn turned to Autumn. <Well, it looks like you’re the last person to have not gone yet>.`,
								`Autumn nodded & took the die from Dawn. She rolled the die for less than a second in 1 limp wrist before flicking it out onto the floor.`,
								`She rolled a ${ turn.roll }.`
							],
							Edgar:
							[
								`Dawn turned to Edgar. <Well, it looks like you’re the last person to have not gone yet>.`,
								`Edgar nodded as he took the die from Dawn. He rolled it for a second or so, closing his vision & taking a deep breath before finally releasing the die to the ground with a force as if pushing it ’way.`,
								`He rolled a ${ turn.roll }.`
							],
							Dawn:
							[
								`<Well, it looks like I’m the last person to have not gone yet>, Dawn said as she began rolling the die. After ’bout a second o’ vigorous rolling, she released the die with aplomb.`,
								`She rolled a ${ turn.roll }.`
							]
						});
						return choices[ config.players[ analyze.getTurnPlayer( game, turn ) ] ];
					}
					break;

					default:
					{
						return ( !turn.finished )
							? [ `${ this.playerNameText( analyze.getTurnPlayer( game, turn ) ) } rolled a ${ turn.roll }.` ]
							: [];
					}
					break;
				}
			}).bind( this )());
		},
		getEndingScript: function( finalTurn:Turn, game:Game ):readonly string[]
		{
			const paragraphs : string[] = [];
			if ( finalTurn.reachedEnd )
			{
				return [
					"Though Autumn had noticed it coming long before they reached it, Autumn was still surprised to find her nerves stir in a pleasant pulse for once as they all walked up to the last space, adorned with a checkered flag towering o’er their heads, emblazoning 1 bold word: “FINISH”.",
					"& just as Dawn ’head o’ them made her 1st step on the chrome-shine space, all but she were startled by a burst o’ sudden ska horns, followed by rain o’ rainbow confetti.",
					"Autumn couldn’t keep herself from craning neck in all directions, only for her attention to find its stop sign on the abrupt appearance o’ an elderly turtle man wearing a tuxedo & top hat, face adorned with pinky-sized bifocals & a walrus white moustache o’er his beak nose. He craned o’er a cane grasped tightly in white-glove bedecked hands as he hobbled o’er to them.",
					"<¡Congratulations on making it to the end, kids!>.",
					`<It looks like you have ${ finalTurn.land.funds }>.`
				];
			}
			else
			{
				const currentPlayer:string = this.playerNameText( analyze.getTurnNumberPlayer( game, finalTurn.number + 1 ) );
				return [
					`Before ${ currentPlayer } could roll the next turn, all 3 were startled by the cry o’ a parrot, <q>¡FINIIIIISH!</q>. They looked round themselves to find the source, only to stop on the abrupt appearance o’ an elderly turtle man wearing a tuxedo & top hat, face adorned with pinky-sized bifocals & a walrus white moustache o’er his beak nose. He craned o’er a cane grasped tightly in white-glove bedecked hands as he hobbled o’er to them.`,
					`<That’s the last turn, guys. Sorry you couldn’t make it to the end>.`,
					`Autumn was ’bout to think, { Cool. Glad to get fucked in the ass as always }, but stopped that thought when the turtle continued, <But let’s see what you can win with the money you’ve made>.`,
					`<It looks like you have ${ finalTurn.land.funds }>.`
				];
			}
		},
		firstRollText: function( game:Game ):readonly string[]
		{
			const roll:number = game.turnList[ 1 ].roll;
			let paragraphs = [ `<OK, ¿now who should roll 1st?>, asked Dawn.` ];

			const choices =
			{
				Autumn:
				[
					`Autumn shrugged. <You’re the one experienced in this game, so you would know best, save for maybe the roll o’ a die>.`,
					`Dawn tilted her head in feigned thought. <Well, since Autumn is such a smarty sweats, I choose her to go 1st>. Dawn held out the die toward Autumn.`,
					`<Whatever tickles your bones>, Autumn said as she took the die from Dawn.`,
					`Autumn rolled the die for less than a second in 1 limp wrist before flicking it out onto the floor. They all looked down @ it, Edgar & Dawn bending close to it to get a closer look while Autumn only budged her pupils.`
				],
				Edgar:
				[
					`Autumn shrugged. <You’re the one experienced in this game, so you would know best, save for maybe the roll o’ a die>.`,
					`<OK, let me think…>. Dawn rubbed her mouth. Then she turned to Edgar & put a hand on his shoulder. <Edgar, ¿why don’t you lead for once?>.`,
					`<Uh, ¿are you sure?>, Edgar asked, wringing his hands together.`,
					`<’Course I do>.`,
					`<Well, OK>. Edgar took the die from Dawn & began rolling it. He took a deep breath, & then finally released the die to the ground as if pushing it ’way. They all looked down @ it, Edgar & Dawn bending close to it to get a closer look while Autumn only budged her pupils.`
				],
				Dawn:
				[
					`<Since you’re the one most experienced in this game, you would be the most logical choice>, said Autumn.`,
					`<If you insist>. Dawn began rolling the die with frantic energy, & then threw the die on the ground with aplomb. They all looked down @ it, Edgar & Dawn bending close to it to get a closer look while Autumn only budged her pupils.`
				]
			};
			paragraphs = paragraphs.concat( choices[ config.players[ game.playerOrder[ 0 ] ] ] );
			paragraphs.push( `The die said “${ roll }”.` );
			paragraphs.push( `<That means we walk down ${ roll } o’ these hexagon spaces>, Dawn said, already beginning to move. She looked back @ Autumn & Edgar. <Make sure you [i]only[/i] walk that many steps, & don’t stop before or after. The cranes that run this place are anal ’bout the rules>.` );
			paragraphs.push( `Autumn frowned. <Cranes. Great. I always wanted to die in frivolity>.` );
			paragraphs.push( `<It’ll be all right. C’mon>. Dawn waved her fingers toward her, beckoning them. They followed.` );

			return Object.freeze( paragraphs );
		},
		playerNameText: function( player:number ):string
		{
			return playerNames[ config.players[ player ] ];
		},
	});
})();
