import { BallSurvival } from './ball-survival';
import { Game } from './game';
import { Guesses } from './guesses';
import { MinigameInfo } from './minigame-info';
import { MinigameStatus } from './minigame-status';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';
import { Text } from './text';

( function()
{
	const analyze = require( `./analyze.ts` );
	const config = require( `./config.ts` );
	const chance = require( `./chance.ts` );

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
		addParagraphLists: function( listOfLists ):string[]
		{
			let paragraphs:string[] = [];
			for ( const list of listOfLists )
			{
				paragraphs = this.addParagraphs( paragraphs, list );
			}
			return paragraphs;
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
									`They stopped on a golden space marked with the characters “+${ amount  }”. A tile in the ceiling slid out o’ place, & out o’ that hole fell a gloved hand on a mechanical arm, which bent its “elbow”, reaching down toward them. Autumn looked @ Dawn with the eyes o’ a spooked cat.`,
									`<Don’t worry>, Dawn said with a smile. <It won’t harm us; this is good, actually>.`
								] :
								[
									`They stopped on a golden space marked with the characters “+${ amount  }”. The ceiling opened & released the hand crane ’gain, causing Autumn to frown.`,
									`<Don’t worry>, Dawn said with a smile. <It won’t harm us; this is good, actually>.`
								];
							})(),
							( function()
							{
								return {
									Autumn: [
										`The arm stopped ’bove Autumn, which caused her to steel her legs, ready to run. She watched it open its palm to reveal red chips. Autumn jerked back just in time to avoid them smacking her on the head. ’Stead they clacked on the ground, swiveling to a gradual stop from the force o’ their fall.`,
										`<¿See? I told you ’twas all good>, said Dawn.`,
										`<An odd way to give us chips, but I won’t complain>, Autumn muttered as she scooped the chips off the floor.${ ( function() { return ( turn.startingStatus.funds < 30 ) ? ` <We could certainly use the chips>.` : `` } )() }`
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
									`They stopped on a red space marked with the characters “-${ amount  }”. A tile in the ceiling slid out o’ place, & out o’ that hole fell a gloved hand on a mechanical arm, which bent its “elbow”, reaching down toward them. Autumn looked @ Dawn with the eyes o’ a spooked cat; her nerves weren’t soothed by the uncomfortable half-smile, half-frown Dawn wore.`
								] :
								[
									`They stopped on a red space marked with the characters “-${ amount  }”. The ceiling opened & released the hand on the arm ’gain.`
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
									`<Bad luck for us>, Dawn said, still rubbing her side: <that space always takes us back to the start>.`,
									`<Well, we need to prolong such an endearing game as long as we can>, said Autumn.`,
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
					const timesGottenBefore:number = analyze.timesLandOTypes( game, turn.number, [ `goPastCycle` ] );
					return ( timesGottenBefore > 0 ) ?
				    [
						`Then they landed on the yellow space with the “!” etched on it, which caused the elevator to appear round them ’gain, pulling them up out o’ their circular trap.`
				    ] :
					[
						`Then they landed on a yellow space with an “!” etched on it, which, ’pon being stepped on, caused a escalator to fade into view under & next to them. Before they could act, the elevator’s steps began pulling them upward.`,
						`Gripping the edge tightly & looking up & down, but not daring to try leaping off, Autumn said, <¿How’s this going to fuck us now?>.`,
						`Dawn, who stood relaxed, said, <No, this is good: it means we can leave this circle we’re stuck in>.`
					];
				}
				break;

				case ( `chance` ):
				{
					const cardType:string = chance.cards[ turn.land.chanceDeck.latestCard ].type;
					const firstChance:boolean = analyze.firstLandOTypes( game, turn.number, [ "chance" ] );
					return ( firstChance ) ?
						[
							`Then they landed on an orange space with a “?” icon on it, before which was a sentinel o’ a machine that cast a shadow gainst the ceiling’s hot lights. It had been golem-still till just then, when it suddenly started to life, releasing an orange card from its mouth like a serpent tongue.`,
							`Dawn took the card & showed it ’mong Autumn & Edgar. Said card showed ${ this.chanceCardImages[ cardType ] } next to the words “${ this.chanceCardText[ cardType ] }”.`
						]
					:
						[
							`They landed on the orange chance space ’gain & received a card that showed  ${ this.chanceCardImages[ cardType ] } next to the words “${ this.chanceCardText[ cardType ] }”.`
						]
					;
				}
				break;

				case ( `minigame` ):
				{
					const currentMinigame:MinigameStatus = turn.land.extra;
					const minigameInfo:MinigameInfo = analyze.minigameInfo( game, turn.number );
					const isFirstMinigame:boolean = minigameInfo.getStatuses().length < 1;
					const lastMinigame:MinigameStatus = ( isFirstMinigame ) ? null : minigameInfo.getStatuses()[ minigameInfo.getStatuses().length - 1 ];
					const wasLastMinigameLost:boolean = lastMinigame && !lastMinigame.win;
					const wereMoreWinsThanLosses:boolean = ( function()
					{
						let wins = 0;
						let losses = 0;
						for ( const minigame of minigameInfo.getStatuses() )
						{
							if ( minigame.win )
							{
								wins++;
							}
							else
							{
								losses++;
							}
							return wins > losses;
						}
					})();

					const start:string[] = ( isFirstMinigame ) ?
						[
							`Then they landed on a purple space with the icon o’ a baseball on it. Just as they landed, a buzzer went off, causing Autumn to jerk her head in every direction. Then a kooky voice exclaimed, <¡Minigame time!>.`,
							`<Ooo>. Dawn grabbed Autumn’s shoulder. <This is going to be fun, & you’ll like this bit: ’stead o’ that vile Random # God you rage gainst so much, we have a game where whether we win will be based only on our skills. You’ll smash this 1>.`,
							`<If you say so…>, said Autumn, feeling only great unease.`,
							`{ Great: so this time I know for sure it’s my fault if we lose }.`
						]
					:
						this.addParagraphs
						(
							[
								`When they landed on the next space, that buzzer Autumn recalled from before went off; & with it was the similarly familiar kooky voice shouting, <Minigame time!>.`,
								`<Cool: ’nother 1>, said Dawn.`
							],
							( wasLastMinigameLost ) ?
									this.addParagraphs
									(
										[ `<Great, ’nother chance to lose>, replied Autumn.` ],
										( wereMoreWinsThanLosses ) ?
												[ `Dawn grabbed Autumn’s shoulder. <Don’t be such a soggy waffle: we’ve <em>won</em> mo’ than we’ve lost>.` ]
											:
												[
													`Dawn grabbed Autumn’s shoulder. <Don’t be such a soggy waffle: the law o’ averages says we have to win this time>.`,
													`Autumn mumbled, <Probability doesn’t work that way>.`
												]
									)
								:
									[]
						);
					const intro:string[] = ( currentMinigame.type === `balls` && analyze.hasPlayedMinigameBefore( minigameInfo, `balls` ) )
					?
						[
							`<I’m guessing we’d better stay on these things or else they’ll disqualify us immediately>, said Dawn.`,
							`<Can’t think o’ any other reasons to start us standing on these things>, replied Autumn.`
						]
					:
						[
							`The announcer continued, <The game you’ll be playing tonight is ‘${ this.minigames[ currentMinigame.type ].name }’, & you’ll be betting ${ currentMinigame.bet } chips>.`,
							`Before Autumn had a chance to reply, the floor opened under them like a maw, dropping them into an abyss.`,
							`@ the end o’ the tunnel they found themselves falling ${ this.minigames[ currentMinigame.type ].area }.`
						];
					const afterIntro:string[] = ( currentMinigame.type === `balls` ) ?
						[
							`<I’m guessing we’d better stay on these things or else they’ll disqualify us immediately>, said Dawn.`,
							`<Can’t think o’ any other reasons to start us standing on these things>, replied Autumn.`
						]
					: [];
					const beforeInstructions:string[] = [
						`The announcer spoke ’gain: <¿Want to hear instructions?>.`
					];

					const instructions:string[] = ( analyze.hasPlayedMinigameBefore( minigameInfo, currentMinigame.type ) ) ?
						[ `Autumn turned to Dawn. Dawn said, <No>.` ]
					:
						this.addParagraphs
						(
							[
								`Autumn turned to Dawn. Dawn said, <Yes>.`,
								`The announcer continued: <${ this.minigames[ currentMinigame.type ].desc }>.`,
								`Autumn could only say, <Ugh>.`
							],
							this.addParagraphs
							(
								( function()
								{
									switch( currentMinigame.type )
									{
										case ( `balls` ):
										{
											return [ `With her eyes still on her legs wobbling o’er her green ball, Dawn said, <With your great self control, you should have no problem with this>.` ];
										}
										break;
										case ( `tower` ):
										{
											return [ `Dawn put her hand on Autumn’s shoulder & said, <C’mon, with your thief skills @ parkour, you’ll be a shoe-in>.` ];
										}
										break;
										case ( `count` ):
										{
											return [ `Dawn put her hand on Autumn’s shoulder & said, <C’mon, this is a brainy, math game: you should be great @ this>.` ];
										}
										break;
										default:
										{
											throw `¡Invalid Minigame Type: ${ currentMinigame.type }!`;
										}
										break;
									}
								})(),
								( !isFirstMinigame ) ?
									[ `<Yeah, yeah, let’s just get on with this>, replied Autumn.` ]
								:
									[
										`<I feel much better knowing I have a reason to be extra disappointed if I lose>, said Autumn.`,
										`<It’s just a game meant for fun>, said Dawn.`,
										`<For chips is ne’er for fun>, replied Autumn.`
									]
							)
						);
					const readyToStart:string[] = [
						`The announcer said, <¿Ready to start?>.`,
						`Autumn nodded & Dawn said, <Yup>.`
					];

					const mainMinigameText:string[] = ( function()
					{
						switch ( currentMinigame.type )
						{
							case ( `count` ):
							{
								const guesses:Guesses = currentMinigame.misc.guesses;
								const text:Text = new Text([
									`A clock on a wooden stick rose from the bushes right ’cross from them on the other side o’ the field. Then gray stones rained down from the sky a second, followed just after by the announcer squawking, <¡Start!>, & the clock dinging & beginning to tick.`,
									`All 3 immediately leaned forward, an index pointing @ various stones while the other hand ticked finger after finger in count. But before they had a chance to count them all, the Rockmen already began to crumble.`,
									`<Shit>, mumbled Autumn.`,
									`<I think I have ${ guesses.dawn }. ¿How ’bout you?>, said Dawn.`
								]);

								if ( guesses.autumn === guesses.dawn )
								{
									text.addList([
										`Autumn grunted. <Yeah. I got the same>.`,
										`<Cool: then let’s go with that>, Dawn said as she etched ${ guesses.dawn } into the touch screen.`
									]);
								}
								else
								{
									/*
									let DawnMakesArgument = false;
									let SecondLineEnd = `>.`;
									const Previous = Stats.Misc.GetPrevious();
									if ( Stats.Misc.GetPrevious() !== null && Stats.Misc.GetPrevious() !== undefined )
									{
										if ( Previous.Win && Previous.CharacterWins.Autumn )
										{
											SecondLineEnd = `. You got it right last time>.`;
											DawnMakesArgument = true;
										}
										else if ( !Previous.Win && !Previous.CharacterWins.Dawn )
										{
											SecondLineEnd = `. I was wrong last time>.`;
											DawnMakesArgument = true;
										}
									}*/
									const dawnMakesArgument:boolean = false;
									const secondLineEnd:string = `>.`;

									text.addList([
										`<O, shit>. Dawn paused with her mouth open. <Well, we should probably go with your guess${ secondLineEnd }`,
										`Autumn grunted. <I don’t know. I think close to that>. She took a deep breath. Her attention kept flicking back to the clock, which now said they had barely mo’ than 10 minutes left. She squinted her eyes as she pointed @ the Rockmen. <¿Are you sure there are that many? I count ${ guesses.autumn }>.`
									]);

									if ( guesses.chosen.character === "autumn" )
									{
										text.add( `<Sure, why not>.` );
									}
									else
									{

										text.addList([
											`<${ (( dawnMakesArgument ) ? `Yeah, but that doesn’t guarantee anything. ` : ``) }You ought to get a turn. ’Less Edgar wants to make a decision for once>. Autumn turned to Edgar only to see him shake his head as if asking him to walk the plank.`,
											`<¿You sure? I don’t want to get it wrong & make you feel bad>.`,
											`<I thought you were the one who was saying this was just for funsies>.`,
											`Dawn laughed. <I certainly didn’t say “funsies”>.`,
											`<Sorry>, Autumn mumbled with a smirk. <I’m no Mark Twain when it comes to capturing natural vernacular>.`,
											`<Anyway, I insist on you making the choice this time. You seem to find this mo’ fun, after all>.`,
											`Dawn shrugged. <If you say so>. She began etching ${ guesses.dawn } into the touch screen. <But don’t blame me if I get it wrong>.`,
											`<¿When have I e’er blamed anyone other than myself for anything that goes wrong?>, asked Autumn.`,
											`Dawn replied with a sigh.`
										]);
									}

								}

								text.addList([
									`Then Dawn looked up @ the timer as she gripped the touch screen tightly & bit her lips just as tightly while Edgar shivered in the suprisingly cool breeze for summer ( though now that Edgar thought ’bout it, that ’twas daylight here when ’twas clearly night outside was e’en mo’ peculiar ) & Autumn stood with her hands in her pockets & an expression that belied her frets o’er losing as they all waited for the timer to tick down to 0.`,
									`When it did with a buzz, the clock on the sign ’cross from the field flipped its face into a 2-digit #, “00”. Then the Rockmen began crumbling to dust, each 1 causing the digits on the sign to count up. All 3 held their breaths as they watched it near their final guess.`
								]);

								if ( guesses.chosen.number === guesses.correct )
								{
									text.addList(
										[
											`Then it stopped on ${ guesses.chosen.number }, causing their hearts to stop.`,
											`& then it began blinking, & the announced exclaimed, <¡Congratulations! ¡You won!>.`,
											`Dawn wrapped an arm round Autumn & squeezed her to her chest. <¿See? I told you we could do it>.`,
											`<${ ( guesses.chosen.character === "Dawn" ) ? `Thanks to <em>your</em> guess` : `Lucky guess` }>, murmured Autumn, her voice slightly muffled by getting her chest crushed by the force o’ Dawn’s embrace.`,
											`<O, stop>, Dawn lightly chided.`
										]
									);
								}
								else
								{
									if ( guesses.chosen.number > guesses.correct )
									{
										text.add( `Then it stopped on ${ guesses.correct }, causing their hearts to stop.` );
									}
									else if ( guesses.chosen.number < guesses.correct )
									{
										text.add( `Then it went past ${ guesses.chosen.number }, causing Dawn & Edgar to look down in disappointment & Autumn to mumbled, <Fuck>.` );
									}

									text.addList(
										[
											`Then it fell into a pale gray, followed by the blaring o’ a weak horn somewhere in the unseen distance, which was itself followed by the announcer calling out, <O... ¡You lost!>.`,
											`<Well, a’least they let us down easy>, mumbled Autumn.`
										]
									);

									if ( guesses.chosen.character === "dawn" )
									{
										text.add( `Dawn laughed. <I knew we shouldn’t have picked my guess…>.` );

										if ( guesses.autumn === guesses.correct )
										{
											text.add( `Autumn shrugged. <No use whining ’bout it now. Better we &mdash;>.` );
										}
										else
										{
											text.addList(
												[
													`<My guess was no better than yours>, replied Autumn.`,
													`<Yeah, I guess you’re right>.`
												]
											);
										}
									}
									else if ( guesses.chosen.character === "autumn" )
									{
										text.addList(
											[
												`With a smirk aimed @ Dawn, Autumn said, <This is your fault for insisting on using my guess${ ( guesses.dawn === guesses.correct ) ? ` &mdash; ’specially since yours was actually right` : `` }>.`,
												`<${ ( guesses.dawn === guesses.correct ) ? `But I didn’t choose to use it, so I guess ’twas still wrong` : `But my guess was wrong, too, so I guess it doesn’t matter` }>, replied Dawn.`,
												`<Guess you got a point there>.`
											]
										);
									}

								}
								text.add( `Before anyone could say anything further, a hole opened ’neath them, causing them to fall into a black chasm. After a few seconds falling through darkness, they fell out, back onto the board. ${ ( currentMinigame.win ) ? `Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps` : `The fall was so hard that it caused ${ currentMinigame.bet } chips to fall out o’ their pockets` }.` );
								return text.get();
							}
							break;

							case `balls`:
							{
								const text:Text = new Text([
									`A clock on a wooden stick rose from the bushes right ’cross from them on the other side o’ the field. Then gray stones rained down from the sky a second, followed just after by the announcer squawking, <¡Start!>, & the clock dinging & beginning to tick.`,
									`Not a second passed before the corner cannons began blasting out metal balls as big as the ones they stood on, but covered in spikes.`,
									`Dawn scrambled ’way @ a rapid roll, jerking ’way from spike ball to spike ball while Edgar stood paralyzed like a hare before a truck. Autumn’s eyes moved as quickly as Dawn did, but her movements were rarer & slower.’`
								]);

								const survival = new BallSurvival( false, false, false );
								if ( survival.dawn )
								{
									if ( survival.edgar )
									{
										if ( survival.autumn )
										{
											text.add( `So focused had Autumn been on avoiding stumbling into all these spike balls that she was almost jolted off by the sharp sound o’ the buzzer. She looked up & saw that the timer had reached 0 already. As she did so, she heard the parrot-like voice o’ the announcer squawk, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath all 3 o’ them, causing them to fall into a black chasm. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
											text.add( `<¡Awesome job, guys!>, said Dawn.` );
										}
										else
										{
											text.add( `But Autumn had spread her attention o’er too many pieces that she began to get uneasy & make hasty movements. Then she found herself surrounded by 4 spike balls, all rolling toward her.` );
											text.add( `{ Now, ¿how is this e’en possible? }.` );
											text.add( `Autumn tried to carefully roll her way ’tween 2 close spike balls, but a spike scratched her ball, causing it to pop & blasting her into the ball pit.` );
											text.add( `<¡Autumn!>, exclaimed Edgar.` );
											text.add( `But it didn’t take long for Autumn’s head to pop back up from under the surface o’ the ball pit, a moody face slowly releasing ball after ball back to the pit from ’bove her head.` );
											text.add( `<Don’t worry ’bout me>, Autumn called out: <keep your attention on keeping yourselves in>.` );
											text.add( `Autumn watched them maneuver round the spike balls, with greater fear as she watched Edgar become shakier in his movements, while Dawn, in contrast, became quieter & seemed to practice closer diligence to what she was doing, with a notable sweat drop dripping down the side o’ her face. While she watched this, Autumn’s attention flicked to the clock on the wooden post as it crept toward 0.` );
											text.add( `& then, gainst her expectations, it struck 0, followed by the sound o’ a buzzer. Autumn noticed Edgar jump when the spike balls round them suddenly puffed ’way. Then the parrot-like voice o’ the announcer squawked, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath Dawn & Edgar, causing them to fall into a black chasm while Autumn was sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
											text.add( `<¡Awesome job, guys!>, said Dawn.` );
											text.add( `<Well, ’cept for me — I fucked it up>, said Autumn.` );
											text.add( `Dawn waved this ’way, saying, <That was just bad luck>.` );
										}
									}
									else
									{
										text.add( `Edgar panicked when he saw 2 spike balls roll toward him from opposite directions & scrambled forward, only to go so quickly that his feet slipped on the hem o’ his robe, causing him to tumble off his ball.` );
										text.add( `Before he had a chance to so much as sit back up, his ball puffed into smoke before everyone’s eyes. Edgar jumped back to his feet & eyed the spike balls crawling all round him till he heard Dawn’s voice call out, <Edgar, into the ball pit. It should be safe in there>. Edgar dutifully sidestepped round the spike balls thankfully moving rather slowly for someone no longer bound to a cumbersome ball & dipped himself feet-1st into the lake o’ plastic balls. He was pleasantly surprised to find that they weren’t nearly as sinkable for someone like him who couldn’t swim as water.` );
										text.add( `<Shit>, muttered Autumn.` );

										if ( survival.autumn )
										{
											text.add( `Autumn had been so distracted by Edgar’s failure that she lost track o’ her own progress for a second & almost rolled into a spike ball before she twisted herself in the opposite direction a millimeter before hitting it.` );
											text.add( `<¡Autumn!>, Edgar called out from the ball pit. <¡Watch out for that spike ball on the right!>.` );
											text.add( `Autumn ignored him & tried to focus 75% o’ her attention on the spike balls round her & the rest on the clock, ticking close to 0.` );
											text.add( `& then, gainst her expectations, it struck 0, followed by the sound o’ a buzzer. Autumn noticed Edgar jump when the spike balls round them suddenly puffed ’way. Then the parrot-like voice o’ the announcer squawked, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath Autumn & Dawn, causing them to fall into a black chasm while Edgar was sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
											text.add( `<¡Awesome job, guys!>, said Dawn.` );
										}
										else
										{
											text.add( `Autumn had been so distracted by Edgar’s failure that she lost track o’ her own progress & now found herself surrounded by spike balls so close, she couldn’t figure out how to maneuver round them. She tried to roll her ball back from 2 spike balls coming toward each other, only to back into yet ’nother spike ball, popping her ball & blasting her into the ball pit.` );
											text.add( `<¡Autumn!>, exclaimed Edgar.` );
											text.add( `But it didn’t take long for Autumn’s head to pop back up from under the surface o’ the ball pit, a moody face slowly releasing ball after ball back to the pit from ’bove her head.` );
											text.add( `Edgar swimmed o’er to Autumn & said, <¿Are you OK?>.` );
											text.add( `<Yeah>, mumbled Autumn.` );
											text.add( `They turned their attention to Dawn, still maneuvering round the spike balls with a sweat drop dripping down the side o’ her face. Autumn kept looking up @ the clock on the wooden post, her breathing becoming tighter as she saw it creep toward 0.` );
											text.add( `& then, gainst her expectations, it struck 0, followed by the sound o’ a buzzer. Autumn noticed Edgar jump when the spike balls round them suddenly puffed ’way. Then the parrot-like voice o’ the announcer squawked, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath Dawn, causing her to fall into a black chasm while Autumn & Edgar were sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
											text.add( `<¡Awesome job, guys!>, said Dawn.` );
											text.add( `<Cool. We didn’t do shit>, said Autumn.` );
											text.add( `Dawn waved this ’way, saying, <That was just bad luck>.` );
										}
									}
								}
								else
								{
									text.add( `But Dawn had gone too quickly, rolling forward so quickly that she couldn’t stop anymo’ till she ran into a spike ball, popping her ball & knocking her off the platform into the sea o’ colored balls.` );
									text.add( `Edgar noticed this in the corner o’ his eyes & turned to see Dawn swim back up to the surface.` );
									text.add( `<¿Are you OK?>, he asked.` );
									text.add( `<Edgar, watch ’hind you>.` );
									text.add( `Autumn, who had been too focused on keeping herself up to notice Dawn get hit till she heard Edgar call out, was now looking up @ seeing a spike ball head right for Edgar & was rolling toward him to push him out o’ its way.` );
									text.add( `’Pon hearing Autumn, Edgar swung his head round in panic. He saw a spike ball only half a meter ’way from him.` );

									if ( survival.edgar )
									{
										text.add( `Luckily, Autumn reached him before the spike ball did, & she was able to bounce him out o’ the spike ball’s way.` );

										if ( survival.autumn )
										{
											text.add( `In the process, she herself almost rolled right into a spike ball, but rolled round it just in time, her ball coming within millimeters o’ 1 o’ them.` );
											text.add( `<¡Autumn! ¡Watch out for that spike ball on the right! ¡Edgar! ¡’Hind you!>.` );
											text.add( `Autumn tried to drown out Dawn & focused 75% o’ her attention on the spike balls round her & the rest on the clock, ticking close to 0.` );
											text.add( `& then, gainst her expectations, it struck 0, followed by the sound o’ a buzzer. Autumn noticed Edgar jump when the spike balls round them suddenly puffed ’way. Then the parrot-like voice o’ the announcer squawked, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath Autumn & Edgar, causing them to fall into a black chasm while Dawn was sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
										}
										else
										{
											text.add( `Unluckily, in bopping Edgar out o’ the spike ball’s way, her ball richocheted back & into a spike ball, popping her ball instantly & knocking her into the ball pit.` );
											text.add( `<¡Autumn!>, exclaimed Edgar.` );
											text.add( `But it didn’t take long for Autumn’s head to pop back up from under the surface o’ the ball pit, a moody face slowly releasing ball after ball back to the pit from ’bove her head.` );
											text.add( `Dawn swimmed o’er to Autumn & said, <Awfully polite o’ you to come join me>.` );
											text.add( `<Yeah, we’ll say that that’s what happened>, said Autumn.` );
											text.add( `Then they watched Edgar wobbly roll out o’ the way o’ spike ball followed by spike ball, during which Dawn began calling out advice till Autumn asked her to stop distracting him.` );
											text.add( `As Autumn watched Edgar, she kept half her attention to the clock slowly ticking down on the post.` );
											text.add( `Then the clock hit 0 & a buzzer went off. Edgar jumped as he saw the spike balls round him suddenly puff ’way. Then the parrot-like voice o’ the announcer squawked, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath Edgar, causing him to fall into a black chasm while Autumn & Dawn were sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
											text.add( `<¡Awesome job, guys!>, said Dawn.` );
											text.add( `<Cool. We didn’t do shit>, said Autumn.` );
											text.add( `Dawn waved this ’way, saying, <That was just bad luck>.` );
										}
									}
									else
									{
										text.add( `However, in his rush to roll his ball ’way, he tripped his feet on the hem o’ his robe & slipped off his ball.` );
										text.add( `Before he had a chance to so much as sit back up, his ball puffed into smoke before everyone’s eyes. Edgar jumped back to his feet & eyed the spike balls crawling all round him till he heard Dawn’s voice call out, <Here, into the ball pit>. Edgar dutifully sidestepped round the spike balls thankfully moving rather slowly for someone no longer bound to a cumbersome ball & dipped himself feet-1st into the lake o’ plastic balls. He was pleasantly surprised to find that they weren’t nearly as sinkable for someone like him who couldn’t swim as water.` );
										text.add( `<Shit>, muttered Autumn.` );

										if ( survival.autumn )
										{
											text.add( `Autumn had been so distracted by Edgar’s failure that she lost track o’ her own progress for a second & almost rolled into a spike ball before she twisted herself in the opposite direction a millimeter before hitting it.` );
											text.add( `<¡Autumn! ¡Watch out for that spike ball on the right!>.` );
											text.add( `Autumn tried to drown out Dawn & focused 75% o’ her attention on the spike balls round her & the rest on the clock, ticking close to 0.` );
											text.add( `& then, gainst her expectations, it struck 0, followed by the sound o’ a buzzer. Autumn noticed Edgar jump when the spike balls round them suddenly puffed ’way. Then the parrot-like voice o’ the announcer squawked, <¡Success!>.` );
											text.add( `Before anyone could say anything further, a hole opened ’neath Autumn, causing her to fall into a black chasm while Dawn & Edgar were sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
											text.add( `<¡Awesome job, Autumn!>, said Dawn. <¡I knew we could count on you!>.` );
											text.add( `Autumn looked ’way without responding.` );
										}
										else
										{
											text.add( `Autumn had been so distracted by Edgar’s failure that she lost track o’ her own progress & now found herself surrounded by spike balls so close, she couldn’t figure out how to maneuver round them. She tried to roll her ball back from 2 spike balls coming toward each other, only to back into yet ’nother spike ball, popping her ball & blasting her into the ball pit.` );
											text.add( `<¡Autumn!>, exclaimed Edgar.` );
											text.add( `But it didn’t take long for Autumn’s head to pop back up from under the surface o’ the ball pit, a moody face slowly releasing ball after ball back to the pit from ’bove her head.` );
											text.add( `Dawn & Edgar swimmed o’er to Autumn, & Dawn said, <Awfully polite o’ you to come join us>.` );
											text.add( `<Yeah, we’ll say that that’s what happened>, said Autumn.` );
											text.add( `Then they all heard a horn blast, followed by the parrot-like voice o’ the announcer call out, <¡Failed!>, followed by a jingle o’ pure pity.` );
											text.add( `Before anyone could say anything further, they began to feel a pulling force under them, & then found themselves sucked into a black chasm. After a few seconds falling through darkness, they fell out, back onto the board. The fall was so hard that it caused ${ currentMinigame.bet } chips to fall out o’ their pockets.` );
											text.add( `<Well, that sucked, like always>, said Autumn.` );
											text.add( `Rubbing her side as she stood back up, Dawn replied, <That was just bad luck. We’ll win it next time>.` );
										}
									}
								}
								return text.get();
							}
							break;

							case `tower`:
							{
								return [ '' ];
							}
							break;

							default:
							{
								throw "Invalid Minigame Type given to mainMinigameText function."
							}
							break;
						}
					}).bind( this )();
					if ( start === undefined ) { throw "UNDEFINED START"; }
					if ( intro === undefined ) { throw "UNDEFINED INTRO"; }
					if ( afterIntro === undefined ) { throw "UNDEFINED AFTERINTRO"; }
					if ( beforeInstructions === undefined ) { throw "UNDEFINED beforeInstructions"; }
					if ( instructions === undefined ) { throw "UNDEFINED instructions"; }
					if ( mainMinigameText === undefined ) { throw "UNDEFINED mainMinigameText"; }
					return this.addParagraphLists([ start, intro, afterIntro, beforeInstructions, instructions, mainMinigameText ]);
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
					const currentPlayerNumber:number = analyze.getTurnPlayer( game, turn );
					const currentPlayer:string = config.players[ currentPlayerNumber ];
					const secondForkBranchData:Array<object> = analyze.getSecondForkBranchData( game, turn.number );
					const currentBranch:object = secondForkBranchData[ secondForkBranchData.length - 1 ];
					const currentPath:boolean = currentBranch[ 'path' ];
					const direction:string = ( currentPath ) ? `left` : `right`;
					const otherDirection:string = ( currentPath ) ? `right` : `left`;
					const isFirstTime:boolean = secondForkBranchData.length === 1;
					const text = new Text();

					if ( isFirstTime )
					{
						const firstOAnyBranch:boolean = !analyze.noPassOTypesYet([ `firstForkOddOrEven`, `thirdForkRandom` ]);
						if ( !firstOAnyBranch )
						{
							text.addList([
								`Then they found themselves faced with ’nother forking path, but this time without any closed doors to block them.`,
								`<¿How will they fuck us now?>, asked Autumn.`
							]);
						}
						else
						{
							text.addList([
								`Then they found themselves faced with a forking path.`,
								`<¿How will they fuck us now?>, asked Autumn.`
							]);
						}
						text.addList(
							( function() {
								switch ( currentPlayer )
								{
									case ( `Autumn` ):
									{
										return [
											`<I think ${ ( function() { ( firstOAnyBranch ) ? `now` : `this time`; } ) } we have to pick a path to go down>, said Dawn. <Since it’s your turn, Autumn, you ought to choose for us>.`,
											`<You’re the one who knows this place — you should know which path is worse>, said Autumn.`,
											`<Nope: they randomize all that ’tween every play session. It’d get boring after a while if they didn’t>.`,
											`<As opposed to now, which is a rollercoaster>, said Autumn. She rifled through her pocket & pulled out a coin. <We’ll let capitalist fate decide>.`,
											`She flipped the coin, caught it, & slapped it on her other arm. She pulled her hand ’way to reveal the coin ${ ( function(){ ( currentPath ) ? `heads-up` : `heads-down`; })() }`,
											`<Let’s go ${ direction } then>, said Autumn.`,
											`Dawn shrugged. <Sounds good>. & they did just that.`
										];
									}
									break;
									case ( `Edgar` ):
									{
										return [
											`<I think ${ ( function() { ( firstOAnyBranch ) ? `now` : `this time`; } ) } we need to pick a path to go down>, said Dawn. <Since it’s your turn, Edgar, you should pick a path for us>.`,
											`Edgar began rubbing his arms together. <I wouldn’t e’en know where to start…>.`,
											`<Don’t worry — there are no wrong answers>, said Dawn.`,
											`To this, Autumn had to interject: <I’m quite sure the whole point o’ these games is that some answers are definitely inferior to others — which is good, since choices with no consequences are, well, o’ no consequences>.`,
											`<¿Are you trying to tell us that you’re bursting to choose?>, asked Dawn.`,
											`<I’d just flip a coin>, said Autumn.`,
											`Finally, Edgar said, <I guess I’ll just pick ${ direction }>.`,
											`<Awesome>, said Dawn.`,
											`Autumn nodded. <I agree with Edgar that that is a choice not worth squandering much time on>.`,
											`& so, without any further words, they went down the ${ direction } path.`
										];
									}
									break;
									case ( `Dawn` ):
									{
										return [
											`<I think ${ ( function() { ( firstOAnyBranch ) ? `now` : `this time`; } ) } we need to pick a path to go down>, said Dawn.`,
											`<It’s your turn, so you pick>, said Autumn.`,
											`<Great>. Dawn clapped her hands together. Then she stood there staring up @ the ceiling for a second, eyes fixed as if in a trance.`,
											`<Since you’ve played this game before, you should know which path leads where>, said Autumn.`,
											`<’Fraid not>, Dawn said without moving her gaze. <They randomize all that ’tween every play session. It’d get boring after a while if they didn’t>.`,
											`<¿Then dare I ask why — ?>.`,
											`<I got it>. Dawn looked back @ Autumn. <We should go ${ direction }>.`,
											`< — No, thank you for cutting that short. I’d rather not know what you were doing there>, continued Autumn.`,
											`<¿Want to know my intricate algorithm — ?>.`,
											`<No, I’m good>, Autumn said as she began walking toward the ${ direction } path. <Let’s just mosey on>.`
										];
									}
									break;
									default:
									{
										throw `Invalid character given in pass “secondForkCharactersChoose”: ${ currentPlayer }`;
									}
									break;
								}
							})()
						);
					}
					else
					{
						text.add( `As they went, they found themselves faced with the fork with both paths open for them to choose to take ${ ( function() { ( isSecondPass ) ? `’gain` : `yet ’gain`; })() }.` );
						switch ( currentPlayer )
						{
							case ( `Autumn` ):
							{
								const isSecondPass:boolean = secondForkBranchData.length === 2;
								const hasTakenLeftPath:boolean = analyze.hasTakenPathOnSecondBranch( secondForkBranchData, true );
								const hasTakenRightPath:boolean = analyze.hasTakenPathOnSecondBranch( secondForkBranchData, false )
								const hasGottenFuckedByLeftPath:boolean = hasTakenLeftPath && analyze.timesLandOTypes( game, turn.number, `warpToStart` ) > 0;
								const hasGottenFuckedByRightPath:boolean = hasTakenRightPath && analyze.timesPassOTypes( game, turn.number, `secondBranchPathStart` ) > 0;
								const autumnhasGoneBefore:boolean = analyze.characterHasGottenSecondBranch( secondForkBranchData, Config.playerNumberFromName( `Autumn` ) );
								if ( hasGottenFuckedByLeftPath && hasGottenFuckedByRightPath )
								{
									text.addList([
										`<Great. Can’t wait till we get fucked [i]yet ’gain[/i]>, said Autumn.`,
										`<It’s your turn, so your turn to choose${ ( function() { return ( autumnhasGoneBefore ) ? `’gain` : ``; } )() }>, said Dawn.`,
										`<Both paths are excellent choices for reaming us, so I’ll just flip a coin>.`,
										`Autumn pulled her coin out o’ her pocket & flipped, snatched it, & slapped it onto her arm. ’Pon pulling her hand ’way she revealed it to be ${ ( function(){ ( currentPath ) ? `heads-up` : `heads-down`; })() }.`,
										`<${ this.capitalize( direction ) } it is>, Autumn said as she started walking toward that path. <Can’t wait to ${ ( function(){ ( currentPath ) ? `get sent back to the start ’gain` : `go in mo’ time-wasting circles`; })() }>.`
									]);
								}
								else if ( hasGottenFuckedByLeftPath || hasGottenFuckedByRightPath )
								{
									text.addList([
										`<Great. can’t wait till we get fucked ’gain>.`,
										`<It’s your turn, so your turn to choose${ ( function() { return ( autumnhasGoneBefore ) ? `’gain` : ``; } )() }>, said Dawn.`,
										`<Well, certainly not the ${ direction } path>.`,
										`Dawn laughed. <${ this.capitalize( otherDirection ) } it is, I guess>.`
									]);
								}
								else
								{
									const gottenBothPathsBefore:boolean = analyze.secondBranchHasGottenBothPaths( secondForkBranchData );
									if ( gottenBothPathsBefore )
									{
										text.addList([
											`<Well, it’s your turn, Autumn, so it’s your turn to choose${ ( function() { return ( autumnhasGoneBefore ) ? `’gain` : ``; } )() }>, said Dawn.`,
											`<Well, nothing bad to us happened on either path — a’least not by the paths themselves>, said Autumn. She shrugged. <The left path seemed shorter, so let’s go with that>.`,
											``
										]);
									}
									else
									{
										text.addList([
											`<Well, it’s your turn, Autumn, so it’s your turn to choose${ ( function() { return ( autumnhasGoneBefore ) ? `’gain` : ``; } )() }>, said Dawn.`,
											`<Since nothing bad happened from the path we took last time, — a’least nothing that was that path’s fault — it’d be wisest to take that path ’gain. Better to stick with known success than risk failure>.`,
											`<Whatever you say>, Dawn said cheerfully.`,
											`& so they went down the ${ direction } path ’gain.`
										]);
									}
								}
							}
							break;
							case ( `Edgar` ):
							{
							}
							break;
							case ( `Dawn` ):
							{
							}
							break;
							default:
							{
								throw `Invalid character given in pass “secondForkCharactersChoose”: ${ currentPlayer }`;
							}
							break;
						}
					}
					return text.get();
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
					return []; // Ignore, but don’t throw error.
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
							`Before ${ currentPlayer } could roll the next turn, all 3 were startled by the cry o’ a parrot, <¡FINIIIIISH!>. They looked round themselves to find the source, only to stop on the abrupt appearance o’ an elderly turtle man wearing a tuxedo & top hat, face adorned with pinky-sized bifocals & a walrus white moustache o’er his beak nose. He craned o’er a cane grasped tightly in white-glove bedecked hands as he hobbled o’er to them.`,
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
					`<’Course I’m sure>.`,
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
		},
		capitalize: ( text:string ):string => text.charAt( 0 ).toUpperCase() + text.slice( 1 );
		chanceCardText: Object.freeze
		({
			"lose-money1": `Get tricked into joining a religious cult scam. Pay 20 chips`,
			"gain-money1": `200 chips for being an asshole`,
			"half-money": `Your cat, Patches, gets a divorce. Pay half your chips.`,
			"warp-to-final-stretch": `¡Take a train trip straight to the final road!`,
			"warp-to-start": `¡Spring back to the start!`,
			"pay-every-turn": `Your thimble token was caught in in private parking. Pay 10 chips for every turn passed`,
			"gain-every-turn": `Attain capitalist class. Win 10 chips for every turn passed`
		}),
		chanceCardImages: Object.freeze
		({
			"lose-money1": `a man covered in a blue sheet like a ghost`,
			"gain-money1": `an ol’ turtle in a plain black T-shirt, short stubble o’ a beard & combed back white hair facing the reader & shrugging`,
			"half-money": `an ol’ turtle in an ink-black top hat & colorless walrus moustache with a long face o’ shock while next to him is a white cat holding a piece o’ paper that says “DIVORCE”`,
			"warp-to-final-stretch": `an ol’ turtle in an ink-black top hat & colorless walrus moustache skipping down a line o’ sidewalk`,
			"warp-to-start": `an ol’ turtle in an ink-black top hat & colorless walrus moustache leaping on a spring with a jovial smile`,
			"pay-every-turn": `a man in a police uniform waving a baton toward a thimble next to a sign labeled, “PRIVATE PARKING”`,
			"gain-every-turn": `an ol’ turtle in an ink-black top hat & colorless walrus moustache with a fist raised into the air & the words “¡LEVEL UP!” floating ’bove their head`
		}),
		minigames: Object.freeze
		({
			"count":
			{
				name: `Count on Me`,
				area: `into a green meadow covered in butterflies & soft chirps, with a clean dividng line fashioned with a border o’ stones o’ various shapes & sizes. While Autumn, as usual, ate up everything round her with her attention, Dawn focused mainly on the strange touch screen monitor on a sign post in front o’ them with a stylus dangling from a cord`,
				desc: `Within a minute, count how many moving Rockmen there are, but don’t count the ordinary stones or the Rockmen that dissolve into dust`
			},
			"balls":
			{
				name: `Having a Ball on a Roll`,
				area: `on colored balls with stars on them in a small, circular island covered in short hills & snow surrounded by an ocean o’ plastic balls in every color o’ the rainbow. Attached to 4 corners o’ the island were metal boxes. They — ’specially Edgar — struggled to keep their balance on the balls`,
				desc: `A’least 1 o’ you must stay standing on your ball, still on the island, for a whole minute. During that time, avoid the spike balls being shot @ you`
			},
			"tower":
			{
				name: `Treacherous Tower`,
				area: `into a stormy dark place, just before a brown-stoned, dusty crenellated tower that rose so high its head faded in the distance`,
				desc: ``
			}
		})
	});
})();
