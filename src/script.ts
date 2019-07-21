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
				for ( const pass of turn.passes )
				{
				}
				paragraphs = this.addParagraphs( paragraphs, this.generateLandText( data, turn ) );
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
			let newList:string[] = list.slice( 0 );
			for ( const string of newParagraphs )
			{
				newList = this.addParagraph( newList, string );
			}
			return newList;
		},
		generateLandText: function( game:Game, turn:Turn ):readonly string[]
		{
			const currentPlayer:string = config.players[ analyze.getTurnPlayer( game, turn ) ];
			switch ( turn.land.action )
			{
				case ( "gain5" ):
				case ( "gain10" ):
				{
					const amount:number = ( turn.land.action === "gain5" ) ? 5 : 10;
					if ( analyze.firstLandOTypes( game.turnList, turn.number, [ "gain5", "gain10" ] ) )
					{
						return this.addParagraphs
						(
							[
								`They stopped on a golden space maked with the characters “+${ amount  }”. A tile in the ceiling slid out o’ place, & out o’ that hole fell a gloved hand on a mechanical arm, which bent its “elbow”, reaching down toward them. Autumn looked @ Dawn with the eyes o’ a spooked cat.`,
								`<Don’t worry>, Dawn said with a smile. <It won’t harm us; this is good, actually>.`
							],
							( function()
							{
								const choices:object = {
									Autumn: [
										`The arm stopped ’bove Autumn, which caused her to steel her legs, ready to run. She watched it open its palm to reveal red chips. Autumn jerked back just in time to avoid them smacking her on the head. ’Stead they clacked on the ground, swiveling to a gradual stop from the force o’ their fall.`,
										`<¿See? I told you ’twas all good>, said Dawn.`,
										`<An odd way to give us chips, but I won’t complain>, Autumn muttered as she scooped the chips off the floor.${ ( function() { return ( turn.startingStatus.funds < 30 ) ? ' <We could certainly use the chips>.' : '' } )() }`
									],
									Edgar: [
										`The arm stopped ’bove Edgar, which caused him to duck with his arms ’bove his head while Autumn grabbed him tightly to her. She watched it open its palm to reveal red chips. Autumn jerked them back just in time to avoid them smacking her on the head. ’Stead they clacked on the ground, swiveling to a gradual stop from the force o’ their fall.`,
										`<¿See? I told you ’twas all good>, said Dawn.`,
										`<’Twould’ve been nicer if they didn’t threaten to assault my partner with them>, Autumn muttered as she scooped the chips off the floor.${ ( function() { return ( turn.startingStatus.funds < 30 ) ? ' <I s’pose we could certainly use the chips, though>.' : '' } )() }`
									],
									Dawn: [
										`The arm stopped ’bove Dawn, who held her own hands up to it. The arm dropped red chips down into her hands.`,
										`<¿See? I told you ’twas all good>, Dawn said as she slipped the chips into her pocket.`,
										`<An odd way to give us chips, but I won’t complain>, muttered Autumn.${ ( function() { return ( turn.startingStatus.funds < 30 ) ? ' <We could certainly use the chips>.' : '' } )() }`
									]
								};
								return choices[ currentPlayer ];
							})()
						);
					}
					return [
						`They landed on yet ’nother gold space, where the hand crane handed them ’nother ${ amount } chips.`
					];
				}
				break;

				case ( null ):
				{
					return [ '' ];
				}
				break;

				default:
				{
					return [ '' ];
					//throw `Invalid Land Type: ${ turn.land.action }`;
				}
				break;
			}
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
						return [ `${ this.playerNameText( analyze.getTurnPlayer( game, turn ) ) } rolled a ${ turn.roll }.` ];
					}
					break;
				}
			}).bind( this )());
		},
		getEndingScript: function( finalTurn:Turn, game:Game ):readonly string[]
		{
			const currentPlayer:string = this.playerNameText( analyze.getTurnNumberPlayer( game, finalTurn.number + 1 ) );
			return this.addParagraphs
			(
				(
					( finalTurn.reachedEnd )
					? [
							"Though Autumn had noticed it coming long before they reached it, Autumn was still surprised to find her nerves stir in a pleasant pulse for once as they all walked up to the last space, adorned with a checkered flag towering o’er their heads, emblazoning 1 bold word: “FINISH”.",
							"& just as Dawn ’head o’ them made her 1st step on the chrome-shine space, all but she were startled by a burst o’ sudden ska horns, followed by rain o’ rainbow confetti.",
							"Autumn couldn’t keep herself from craning neck in all directions, only for her attention to find its stop sign on the abrupt appearance o’ an elderly turtle man wearing a tuxedo & top hat, face adorned with pinky-sized bifocals & a walrus white moustache o’er his beak nose. He craned o’er a cane grasped tightly in white-glove bedecked hands as he hobbled o’er to them.",
							`<¡Congratulations on making it to the end, kids! ${
								( function()
								{
									return ( finalTurn.number <= config.endingBonus.bestBonus.turns )
										? `¡Wow! I can’t believe you got here in only ${ finalTurn.number } turns! For such an impressive accomplishment, take ${ config.endingBonus.bestBonus.bonus } chips`
										: ( ( finalTurn.number <= config.endingBonus.middleBonus.turns )
											? `¡Good job getting here in only ${ finalTurn.number } turns! For such an accomplishment, take ${ config.endingBonus.middleBonus.bonus } chips`
											: `Here’s ${ config.endingBonus.minimumBonus } chips for your accomplishment` );
								})()
							}>.`
						]
					: [
							`Before ${ currentPlayer } could roll the next turn, all 3 were startled by the cry o’ a parrot, <q>¡FINIIIIISH!</q>. They looked round themselves to find the source, only to stop on the abrupt appearance o’ an elderly turtle man wearing a tuxedo & top hat, face adorned with pinky-sized bifocals & a walrus white moustache o’er his beak nose. He craned o’er a cane grasped tightly in white-glove bedecked hands as he hobbled o’er to them.`,
							`<That’s the last turn, guys. Sorry you couldn’t make it to the end>.`,
							`Autumn was ’bout to think, { Cool. Glad to get fucked in the ass as always }, but stopped that thought when the turtle continued, <But let’s see what you can win with the money you’ve made>.`
						]
				),
				[
					`<It looks like you have ${ finalTurn.land.funds } chips. ${
						( function()
						{
							return ( finalTurn.land.funds < 0 ) ? `We’re so sorry for such rotten luck. We wish you better luck next time you come play. ¡Have a great day!` :
								( finalTurn.land.funds < 10 ) ? `With that much you win a wonderfully laminated business card for Codfish Casino. We hope you’ll play ’gain & have a great day!` :
								( finalTurn.land.funds < 50 ) ? `With that much you win a beautiful medium-sized T-shirt with Codfish Casino’s logo. We hope you’ll play ’gain & have a great day!` :
								( finalTurn.land.funds < 100 ) ? `¡Not bad! With that many chips you win this stuffed plush o’ our mascot, Capital Codfish. We hope you like it & hope we see you ’gain. ¡Have a great day!` :
								( finalTurn.land.funds < 150 ) ? `¡Good job! With that many chips you win this wondersome Codfish Casino mug. We hope you enjoy it with your morning coffee & how we see you ’gain. ¡Have a great day!` :
								( finalTurn.land.funds < 200 ) ? `¡Great job! With that many chips you win a copy o’ our high-tech multimedia disk with an interactive simulation o’ our casino, so you can play it anytime @ home, including a VR headset & a program for exploring a 3D replica o’ the Codfish Casino building. We hope you enjoy & how to see you come round ’gain soon. ¡Have a great day!` :
								( finalTurn.land.funds < 250 ) ? `¡Excellent job! With that much you win this stupendous 300-page book ’bout Codfish Casino that tells all ’bout our history, with plenty o’ colorful photos, smooth pages, & e’en the source code to this casino. We hope you enjoy it with your mugs o’ tea & hope to see you ’gain. ¡Have a great day!` :
								( finalTurn.land.funds < 300 ) ? `¡Wow, that’s impressive!` :
								( finalTurn.land.funds < 350 ) ? `¡What an amazing game!` :
								( finalTurn.land.funds < 400 ) ? `¡What an amazing game!` :
								( finalTurn.land.funds < 450 ) ? `¡What an amazing game!` :
								( finalTurn.land.funds < 500 ) ? `¡What an incredible game!` :
								( finalTurn.land.funds < 550 ) ? `¡What a perfect game! ¡Couldn’t have done better! With that much you win this breathplundering silver moon, which glows in the night & sometimes turns various shades o’ yellow — or e’en red or blue in very rare circumstances — on different nights, as well as having mystical terrain-shifting powers that allows you to stymie your enemies by filling their lawns with chomper plant infestations. We hope you enjoy & hope to see you come round ’gain. ¡Have a great day!` :
								`¡Unbelievable! ¡We have ne’er seen anyone make so many chips in the whole history o’ this casino’s existence! ¡For that much, you get Codfish Casino itself! ¡Congratulations, our new presidents!`;
						})()
					}>.`
				]
			);
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
