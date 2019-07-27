import { Game } from './game';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';

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
					paragraphs = this.addParagraphs( paragraphs, this.generatePassText( data, turn, pass ) );
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
			const currentPlayerNumber:number = analyze.getTurnPlayer( game, turn );
			const currentPlayer:string = config.players[ currentPlayerNumber ];
			switch ( turn.land.action )
			{
				case ( "gain5" ): // fallthrough
				case ( "gain10" ):
				{
					const amount:number = ( turn.land.action === "gain5" ) ? 5 : 10;
					if ( analyze.firstLandOTypes( game, turn.number, [ "gain5", "gain10" ] ) )
					{
						const neverHitLoseBefore:boolean = analyze.firstLandOTypes( game, turn.number, [ "gain5", "gain10", "lose5", "lose10" ] );
						return this.addParagraphs
						(
							( function()
							{
								return ( neverHitLoseBefore )
								? [
									`They stopped on a golden space maked with the characters “+${ amount  }”. A tile in the ceiling slid out o’ place, & out o’ that hole fell a gloved hand on a mechanical arm, which bent its “elbow”, reaching down toward them. Autumn looked @ Dawn with the eyes o’ a spooked cat.`,
									`<Don’t worry>, Dawn said with a smile. <It won’t harm us; this is good, actually>.`
								] :
								[
									`They stopped on a golden space maked with the characters “+${ amount  }”. The ceiling opened & released the hand crane ’gain, causing Autumn to frown.`,
									`<Don’t worry>, Dawn said with a smile. <It won’t harm us; this is good, actually>.`
								];
							})(),
							( function()
							{
								return {
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
								}[ currentPlayer ];
							})()
						);
					}
					const characterHasntGottenGain:boolean = analyze.firstLandOTypesWithCharacter( game, turn.number, [ "gain5", "gain10" ], currentPlayerNumber );
					return ( characterHasntGottenGain )
					? [
						`They landed on yet ’nother gold space, where the hand handed them ’nother ${ amount } chips, this time to ${ currentPlayer }.`
					] :
					[
						`They landed on yet ’nother gold space, where the hand crane handed ${ currentPlayer } ’nother ${ amount } chips.`
					];
				}
				break;

				case ( "lose5" ): // fallthrough
				case ( "lose10" ):
				{
					const amount:number = ( turn.land.action === "lose5" ) ? 5 : 10;
					if ( analyze.firstLandOTypes( game, turn.number, [ "lose5", "lose10" ] ) )
					{
						return this.addParagraphs
						(
							( function()
							{
								const neverHitGainBefore:boolean = analyze.firstLandOTypes( game, turn.number, [ "gain5", "gain10", "lose5", "lose10" ] );
								return ( neverHitGainBefore )
								? [
									`They stopped on a red space maked with the characters “-${ amount  }”. A tile in the ceiling slid out o’ place, & out o’ that hole fell a gloved hand on a mechanical arm, which bent its “elbow”, reaching down toward them. Autumn looked @ Dawn with the eyes o’ a spooked cat; her nerves weren’t soothed by the uncomfortable half-smile, half-frown Dawn wore.`
								] :
								[
									`They stopped on a red space maked with the characters “-${ amount  }”. The ceiling opened & released the hand on the arm ’gain.`
								];
							})(),
							( function()
							{
								return {
									Autumn: [
										`<This is where the less-fun part comes> — Dawn hastily continued — <but don’t panic too much: it’s mo’ jolting than painful>.`,
										`Autumn glared up @ the arm heading for her & steeled her legs. <¿What, is this thing going to outright attack me now? ¿That’s legal?>.`,
										`<It’ll just shake you up a bit. Think o’ it like a wild ride>, said Dawn`,
										`She backed ’way from the looming hand, but the hand rushed forward & snatched her in less than a second. The hand began shaking her, causing chips to fly out o’ her pockets. After only a few seconds o’ this, the hand slowly lowered Autumn back to the floor & then began scooping up some o’ the chips lying on the floor. Autumn looked on, holding her forehead still feeling the ghost o’ the throttling. After collecting a few chips, the hand began flicking the rest o’ the chips toward Autumn’s feet. Keeping her eyes locked on the hand, she bent down & cupped the chips into her hands & returned them to her pocket. The hand slowly rose back into its ceiling hole & its ceiling tile “door” slid back o’er the hole.`,
										`Dawn walked up to Autumn & said, <I’m truly sorry ’bout that, Autumn. I would’ve offered to have endured that ordeal, but the hand insists on doing that to the person who rolled>.`,
										`<It’s fine; I’ve endured worse>, Autumn said without looking @ Dawn, still staring @ the ceiling. <¿How many chips did that lose us?>.`,
										`<The sign on the space said “${ amount }”>.`,
										`<¿How can we be sure that’s the exact amount the hand took?>.`,
										`<You needn’t worry ’bout that>, said Dawn: <nobody e’er loses mo’ than the exact amount. They have legions o’ unit tests & mathematically-proven statically type-checked pure functions to ensure so>.`,
										`<Well, anyway, ${ amount }’s not much. Let’s just continue so I can lose us mo’ money>.`
									],
									Edgar: [
										`<This is where the less-fun part comes> — Dawn hastily continued — <but don’t panic too much: it’s mo’ jolting than painful>.`,
										`Autumn’s eyes widened. She grabbed Edgar as she looked up in horror to see the arm heading for them. She steeled her legs. <¿What, is this thing going to outright attack us? ¿That’s legal?>.`,
										`<It’ll just shake you up a bit. Think o’ it like a wild ride>, said Dawn`,
										`She backed them ’way from the looming hand, but the hand rushed forward & snatched Edgar, pulling him out o’ her own grasp in less than a second. The hand began shaking Edgar, causing chips to fly out o’ his robe, while Autumn only looked up in a mix o’ horror & fury. After only a few seconds o’ this, the hand slowly lowered Edgar back to the floor & then began scooping up some o’ the chips lying on the floor. Autumn ran o’er to Edgar & held him ’gain, while he held his forehead, shaking.`,
										`<¿You OK, Edgar?>, asked Autumn.`,
										`Dawn leaned toward them & said, <I’m truly sorry ’bout that, Edgar. I would’ve offered to have endured that ordeal, but the hand insists on doing that to the person who rolled>.`,
										`Still holding his head, Edgar replied, <It’s all right. Just a li’l shaken is all>.`,
										`Autumn watched the hand collecting chips, expecting it to any moment leap @ them ’gain. She sharpened her nerves when she saw the hand reach a finger back & flick a chip toward them. However, they just landed near their feet. Then the hand slowly rose back into its ceiling hole & its ceiling tile “door” slid back o’er the hole. After looking round herself, expecting any other kind o’ abrupt danger, she finally bent down & scooped the chips into her hands & then slipped them into her pockets.`,
										`<I’m sorry ’gain, guys>, said Dawn.`,
										`Edgar responded, sounding just as apologetic, <It’s all right>.`,
										`Autumn returned to her feet & grunted, <Let’s just continue so we can lose mo’ chips>.`
									],
									Dawn: [
										`<This is where the truly fun part comes. Don’t worry: it’ll only do anything to me>.`,
										`Autumn looked up in alarm to see the hand heading toward Dawn. It then grabbed Dawn, picked her up, & began shaking her, causing her to giggle all the way. Autumn noticed chips fly out o’ her jacket pockets, clattering on the floor. She began running for them, only to stop suddenly when she heard Dawn shout, <¡No! ¡Don’t try getting them, Autumn!>.`,
										`The hand quickly dropped Dawn, & then grasped Autumn. Autumn struggled, but the hand dropped her o’er by Dawn before she could do much. Then the hand made a sudden swoop for the chips & scooped a bunch o’ them up. This time Autumn just stood, gazing dumbfound. She cringed ’way as she noticed the hand pull its finger back ’hind a chip, only to see it aim its shots to the ground next to their feet.`,
										`<We can pick these chips up>, said Dawn.`,
										`<¿Why?>.`,
										`<The hand is only s’posed to take ${ amount }. This is the extra that fell out. Don’t worry — nobody e’er loses mo’ than the exact amount. They have legions o’ unit tests & mathematically-proven statically type-checked pure functions to ensure so>.`,
										`<All right…>. Autumn watched the hand warily as she cupped the chips into her hand, only to see the hand rising ’way, back into its hole in the ceiling, followed by its tile “door” sliding back into place.`,
										`<Sorry — I should’ve warned you ’bout not trying to grab the chips before. Should’ve known you’d ne’er be able to resist trying to save them. Thieves don’t obey no rules, after all>.`,
										`<Untrue: they don’t obey mortal laws, but e’en they obey those unbreakable laws o’ physics & know, for instance, that they can’t ignore the unshakable rule that a giant metal hand can crush my bones into pudding>.`,
										`Dawn laughed. <They would ne’er let it do that — they’d have lawsuits up their chutes>.`,
										`<Well, we’ll see when we inevitably fall into the wrath o’ than hand ’gain, knowing our luck>.`
									]
								}[ currentPlayer ];
							})()
						);
					}
					//const characterHasntGottenLose:boolean = analyze.firstLandOTypesWithCharacter( game, turn.number, [ "lose5", "lose10" ], currentPlayerNumber );
					const charactersHaventGottenLose:boolean[] = analyze.firstLandOTypesWithCharacters( game, turn.number, [ "lose5", "lose10" ] );
					const currentPlayerHasntGottenLose:boolean = charactersHaventGottenLose[ currentPlayerNumber ];
					const twoHaveGottenLose = ( function()
					{
						let gottenLose = 0;
						for ( const characterCheck of charactersHaventGottenLose )
						{
							if ( characterCheck === false )
							{
								gottenLose++;
							}
						}
						return gottenLose >= 2;
					})();
					return ( currentPlayerHasntGottenLose )
					? this.addParagraphs
					(
						[
							`They landed on yet ’nother red space & saw the crane come out ’gain.`
						],
						( function()
						{
							return this.addParagraphs
							(
								{
									Autumn: [
										`Autumn tensed up ’gain. <Great, ¿does this mean it’s my turn to get fucked?>.`,
										`Dawn laughed. <It’s truly not that bad — quite fun, actually>.`,
										( charactersHaventGottenLose[ config.playerNumberFromName( `Dawn` ) ] ) ? `<Yeah, we’ll see you say so when it’s your turn to get man-handled>.` : `<If you say so…>.`,
										`Autumn didn’t bother resisting the crane hand, but stood & waited in impatience as it molested her & took her chips.`,
										`<¿See? It wasn’t so bad>, said Dawn as Autumn stood & watched the crane hand pick up ${ amount } o’ their chips with a head on her dizzy forehead.`,
										( twoHaveGottenLose ) ? `<Yeah, yeah>, said Autumn. <I guess I had to take my turn ’ventually. Couldn’t be so lucky>.` : `<You should ne’er try convincing me that losing chips is not so bad>, Autumn replied as she began scooping up their remaining chips.`
									],
									Edgar: [
										`Autumn tensed up ’gain. <Great, ¿does this mean it’s Edgar’s turn to get fucked?>, which caused Edgar to reflexively hold himself.`,
										`Dawn turned to Edgar. <It’s truly not that bad — quite fun, actually>.`,
										`Edgar then turned to Autumn, who was not soothed by these words, held her hand, & said, <It’s all right — I’m sure I’ve gone through worse>.`,
										`Then he just stood there & waited as the giant crane hand grabbed & shook him. Before Edgar e’en had a chance to fret much ’bout it, the hand was already setting him back down & moving on to collect the scattered chips.`,
										`<¿You OK?>, asked Autumn.`,
										`<Yeah>.`,
										( charactersHaventGottenLose[ config.playerNumberFromName( `Autumn` ) ] ) ? `<¿See? I told you guys it wouldn’t be so bad>, said Dawn.` : `<¿See? I told you it wouldn’t be so bad>, said Dawn. <Just ask Autumn>.`,
										( twoHaveGottenLose ) ? `<It’s certainly outwarmed its welcome>, said Autumn.` : `<You’ll ne’er convincing me that losing chips is not so bad>, Autumn replied as she began scooping up their remaining chips.`
									],
									Dawn: [
										`<Cool: it’s finally my turn for the fun>, Dawn said with a wry smile.`,
										`Autumn & Edgar watched as the hand crane came, lifted Dawn, & shook her for a second or so. Then it dropped her & proceeded to capture ${ amount } o’ their chips.`,
										`<¿See? That wasn’t bad @ all>, said Dawn.`,
										( twoHaveGottenLose ) ? `<So long as you got to get your turn, I s’spose>, said Autumn.` : `<You should ne’er try convincing me that losing chips is not bad @ all>, Autumn replied as she began scooping up their remaining chips.`
									]
								}[ currentPlayer ],
								( twoHaveGottenLose ) ?
								[
									``
								] :
								[
									`Dawn laughed. <You know they’re not real money, ¿right?>.`,
									`<You know money isn’t real, ¿right?>.`,
									`<Así es, sí>.`
								]
							);
						}).bind( this )(),
					) :
					[
						`They landed on yet ’nother red space & endured the hand crane shaking up ${ currentPlayer } ’gain & taking ${ amount } o’ their chips ’gain.`
					];
				}
				break;

				case ( `warpToStart` ):
				{
					const timesGottenWarpBefore:number = analyze.timesLandOTypes( game, turn.number, [ `warpToStart` ] );
					switch ( timesGottenWarpBefore )
					{
						case ( 0 ):
						{
							return this.addParagraphs
							(
								[
									`& then they landed on a gray space with some bent arrow icon on it.`,
									`<What no — aaauuugh!>.`,
									`Before Autumn could continue her question, she felt a thick force propel her into the air, only to so-quickly after feel the long arm o’ gravity pull her back to the ground, onto a pile also made up o’ Edgar & Dawn.`,
									`Autumn immediately leapt to her feet & looked round herself. It didn’t take long to recognize their new — or rather, rather ol’ — location. She could see by the look on Dawn & Edgar’s faces that they knew, too.`,
									`<Back luck for us>, Dawn said, still rubbing her side: <that space always takes us back to the start>.`,
									`<Well, we need to prolong the endearing game as long as we can>, said Autumn.`,
									`<Ha, ha. That just means we have mo’ opportunities to win mo’ chips before the end>.`
								],
								( turn.startingStatus.funds < 0 ) ?
								[
									`<Based on what’s happened so far, I think you mean “lose mo’ chips”>.`,
									`<That just means we’re bound to win>.`,
									`<The actual laws o’ probability disagree>, said Autumn. <Anyway, let’s get going ’gain — we have plenty o’ ground to retrace>.`
								] :
								[
									`Autumn replied, <Yeah. Sure. Let’s get going ’gain — we have plenty o’ ground to retrace>.`
								]
							);
						}
						break;

						case ( 1 ):
						{
							return [
								`Autumn’s frown deepened as she saw the space they were headed for — that familiar gray space with the bent arrow.`,
								`<Fuck me. ¿’Gain? ¿How unlucky can we be?>.`,
								`<¿What? O…>.`,
								`<I take it there’s no way to avoid the wild ride to broken pelvises>, said Autumn.`,
								`Frowning herself, Dawn said, <No, & we’d better hurry & step on the space…>.`,
								`<¿What’ll they do to us if we wait too long?>.`,
								`Dawn looked ’way. <You don’t want to know>.`,
								`<Cool. Broken pelvises it is>.`,
								`So they all stepped onto the space & felt themselves flung back to the start yet ’gain. Then they returned to their feet, brushed themselves off, & continued their game wordlessly.`
							];
						}
						break;

						default:
						{
							return [
								`Autumn’s frown deepened as she saw the space they were headed for — that familiar gray space with the bent arrow.`,
								`<Fuck me. ¿’Gain? ¿How unlucky can we be?>.`,
								`Dawn laughed. <We truly [i]are[/i] having bad luck>.`,
								`So they endured being flung back to the start for the ${ this.toOrdinal( timesGottenWarpBefore + 1 ) } time, returned to their feet, brushed themselves off, & continued their game wordlessly.`
							];
						}
						break;
					}
				}
				break;

				case ( `goPastCycle` ):
				{
					return [
						`Then they landed on a yellow space with an “!” etched on it, which, ’pon being stepped on, caused a escalator to fade into view under & next to them. Before they could act, the elevator’s steps began pulling them upward.`,
						`Gripping the edge tightly & looking up & down, but not daring to try leaping off, Autumn said, <¿How’s this going to fuck us now?>.`,
						`Dawn, who stood relaxed, said, <No, this is good: it means we can leave this circle we’re stuck in>.`
					];
				}
				break;

				case ( `chance` ):
				{
					return [ `Then they landed on an orange space with a “?” icon on it.` ];
				}
				break;

				case ( `minigame` ):
				{
					return [ `Then they landed on a purple space with the icon o’ a baseball on it.` ];
				}
				break;

				case ( null ):
				{
					return []; // Ignore, but don’t throw error.
				}
				break;

				default:
				{
					throw `Invalid Land Type: ${ turn.land.action }`;
				}
				break;
			}
		},
		generatePassText: function( game:Game, turn:Turn, pass:TurnStatus ):readonly string[]
		{
			switch ( pass.action )
			{
				case ( `firstForkOddOrEven` ):
				{
					const forkValues:object = analyze.forkValues( game, turn.number, 'firstForkOddOrEven' );
					const totalForkCount:number = analyze.totalForkCount( forkValues );
					if ( totalForkCount === 0 )
					{
						return [
							`@ the end o’ each previous turn, Autumn noticed a green door with a “?” icon on it that flapped back & forth o’er 2 side-by-side entryways. Now they were heading right for it, with the door covering the ${ ( pass.currentSpace === config.importantSpaces.firstBranch.bottomPathStart ) ? `right` : `left` } passageway.`,
							`<¿Is this door to say we can’t go through the right passageway @ this point>.`,
							`<Yeah, I remember this: the door switches which path we can take every turn>.`,
							`<I take it there’s a significant different ’tween these 2 paths. 1 — probably the 1 we were lucky to get — likely sends us straight down into a volcano while the other leads to chests full o’ gold>.`,
							`<I don’t remember. That’s the fun o’ this game: we ne’er know what we’ll get>.`,
							`<We have radically different conceptions o’ “fun”> was all Autumn said before carrying on.`
						];
					}
					else
					{
						switch ( pass.currentSpace )
						{
							case ( config.importantSpaces.firstBranch.bottomPathStart ):
							{
								return ( forkValues[ config.importantSpaces.firstBranch.bottomPathStart ] !== undefined && forkValues[ config.importantSpaces.firstBranch.bottomPathStart ] > 0 ) ?
									[
										`They returned to the starting fork, which was blocking the right passageway ’gain.`,
										`<¿’Gain? We’re ne’er gonna get anywhere with this stupid board dicking us round like this repeatedly>.`
									]
								:
									[
										`They returned to the starting fork, which was blocking the right passageway this time.`,
										`Dawn said, <Cool: now we get to see what the other path has to offer>.`,
										`<Probably the same trace o’ bullshit>, muttered Autumn.`
									]
								;
							}
							break;

							case ( config.importantSpaces.firstBranch.topPathStart ):
							{
								return ( forkValues[ config.importantSpaces.firstBranch.bottomPathStart ] !== undefined && forkValues[ config.importantSpaces.firstBranch.bottomPathStart ] > 0 ) ?
									[
										`They returned to the starting fork, which was now blocking the left path.`,
										`<Good. Hopefully we won’t get fucked this time>, said Autumn.`
									]
								:
									[
										`They returned to the starting fork, which was blocking the left path ’gain.`,
										`<Looks like we’ll ne’er get to see what that other path leads to,> said Autumn. <Probably better things than this path>.`,
									]
								;
							}
							break;

							default:
							{
								throw `Invalid next space for firstForkOddOrEven: ${ pass.currentSpace }.`;
							}
							break;
						}
					}
				}
				break;

				case ( `toStart` ):
				{
					const toStartCount:number = analyze.timesPassOTypes( game, turn.number, [ `toStart` ] );
					return ( toStartCount === 0 ) ?
						[
							`As they went, Autumn noticed them enter a familiar part o’ the board.`,
							`<Damn it: we’re going in a circle. This is where we started>.`,
							`<Yeah, it must’ve been that fork we just passed — we probably need to go in the other direction>.`
						]
					:
						[]
					;
				}
				break;

				case ( `secondForkCharactersChoose` ):
				{
					return [
					];
				}
				break;

				case ( `secondBranchPathsMeet` ):
				{
					return [
						``
					];
				}
				break;

				case ( `secondBranchPathStart` ):
				{
					return [
						``
					];
				}
				break;

				case ( `thirdForkRandom` ):
				{
					return [
						``
					];
				}
				break;

				case ( `thirdBranchPathsMeet` ):
				{
					return [
						``
					];
				}
				break;

				case ( null ):
				{
					return [ `` ]; // Ignore, but don’t throw error.
				}
				break;

				default:
				{
					throw `Invalid pass type: ${ pass.action }.`;
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
		toOrdinal: function( number:number ):string
		{
			switch ( parseInt( number.toString().slice( -1 ) ) )
			{
				case ( 1 ): { return `${ number }st`; } break;
				case ( 2 ): { return `${ number }nd`; } break;
				case ( 3 ): { return `${ number }rd`; } break;
				default   : { return `${ number }th`; } break;
			}
		}
	});
})();
