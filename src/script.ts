import { BallSurvival } from './ball-survival';
import { Game } from './game';
import { MinigameInfo } from './minigame-info';
import { MinigameStatus } from './minigame-status';
import { Turn } from './turn';
import { TurnStatus } from './turn-status';

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
					const currentMinigame:MinigameStatus = turn.land.minigameStatus;
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
							`{ Great: so this time I know for sure it's my fault if we lose }.`
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
												[ `Dawn grabbed Autumn’s shoulder. <Don’t be such a soggy waffle: we've <em>won</em> mo' than we've lost>.` ]
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
							`<q>I'm guessing we'd better stay on these things or else they'll disqualify us immediately</q>, said Dawn.`,
							`<q>Can't think o' any other reasons to start us standing on these things</q>, replied Autumn.`
						]
					:
						[
							`The announcer continued, <q>The game you&rsquo;ll be playing tonight is &lsquo;${ this.minigames[ currentMinigame.type ].name }&rsquo;, &amp; you&rsquo;ll be betting ${ currentMinigame.bet } chips</q>.`,
							`Before %Autumn% had a chance to reply, the floor opened under them like a maw, dropping them into an abyss.`,
							`@ the end o&rsquo; the tunnel they found themselves falling ${ this.minigames[ currentMinigame.type ].area }.`
						];
					const afterIntro:string[] = ( currentMinigame.type === `balls` ) ?
						[
							`<q>I'm guessing we'd better stay on these things or else they'll disqualify us immediately</q>, said Dawn.`,
							`<q>Can't think o' any other reasons to start us standing on these things</q>, replied Autumn.`
						]
					: [];
					const beforeInstructions:string[] = [
						`The announcer spoke &rsquo;gain: <q>&iquest;Want to hear instructions?</q>.`
					];

					const instructions:string[] = ( analyze.hasPlayedMinigameBefore( minigameInfo, currentMinigame.type ) ) ?
						[ `%Autumn% turned to %Dawn%. %Dawn% said, <q>No</q>.` ]
					:
						this.addParagraphs
						(
							[
								`%Autumn% turned to %Dawn%. %Dawn% said, <q>Yes</q>.`,
								`The announcer continued: <q>${ this.minigames[ currentMinigame.type ].desc }</q>.`,
								`%Autumn% could only say, <q>Ugh</q>.`
							],
							this.addParagraphs
							(
								( function()
								{
									switch( currentMinigame.type )
									{
										case ( `balls` ):
										{
											return [ `With her eyes still on her legs wobbling o'er her green ball, Dawn said, <q>With your great self control, you should have no problem with this</q>.` ];
										}
										break;
										case ( `tower` ):
										{
											return [ `%Dawn% put her hand on %Autumn%&rsquo;s shoulder &amp; said, <q>C&rsquo;mon, with your thief skills @ parkour, you'll be a shoe-in</q>.` ];
										}
										break;
										case ( `count` ):
										{
											return [ `%Dawn% put her hand on %Autumn%&rsquo;s shoulder &amp; said, <q>C&rsquo;mon, this is a brainy, math game: you should be great @ this</q>.` ];
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
									[ `<q>Yeah, yeah, let's just get on with this</q>, replied Autumn.` ]
								:
									[
										`<q>I feel much better knowing I have a reason to be extra disappointed if I lose</q>, said %Autumn%.`,
										`<q>It&rsquo;s just a game meant for fun</q>, said %Dawn%.`,
										`<q>For chips is ne&rsquo;er for fun</q>, replied %Autumn%.`
									]
							)
						);
					const readyToStart:string[] = [
						`The announcer said, <q>&iquest;Ready to start?</q>.`,
						`%Autumn% nodded &amp; %Dawn% said, <q>Yup</q>.`
					];

					const mainMinigameText:string[] = ( function()
					{
						switch ( currentMinigame.type )
						{
							case ( `count` ):
							{
								return [];
							}
							break;

							case `balls`:
							{
								let text = [
									`A clock on a wooden stick rose from the bushes right &rsquo;cross from them on the other side o' the field. Then gray stones rained down from the sky a second, followed just after by the announcer squawking, <q>&iexcl;Start!</q>, &amp; the clock dinging &amp; beginning to tick.`,
									`Not a second passed before the corner cannons began blasting out metal balls as big as the ones they stood on, but covered in spikes.`,
									`%Dawn% scrambled 'way @ a rapid roll, jerking 'way from spike ball to spike ball while %Edgar% stood paralyzed like a hare before a truck. %Autumn%'s eyes moved as quickly as %Dawn% did, but her movements were rarer & slower.'`
								];

								const survival = new BallSurvival( false, false, false );
								if ( survival.dawn )
								{
									if ( survival.edgar )
									{
										if ( survival.autumn )
										{
										}
										else
										{
											text.push( `But Autumn had spread her attention o'er too many pieces that she began to get uneasy & make hasty movements. Then she found herself surrounded by 4 spike balls, all rolling toward her.` );
											text.push( `<span class="autumn-thought">Now, &iquest;how is this e'en possible?</span>.` );
											text.push( `Autumn tried to carefully roll her way 'tween 2 close spike balls, but a spike scratched her ball, causing it to pop & blasting her into the ball pit.` );
											text.push( `<q>&iexcl;Autumn!</q>, exclaimed %Edgar%.` );
											text.push( `But it didn't take long for %Autumn%'s head to pop back up from under the surface o' the ball pit, a moody face slowly releasing ball after ball back to the pit from 'bove her head.` );
											text.push( `<q>Don't worry 'bout me</q>, %Autumn% called out: <q>keep your attention on keeping yourselves in</q>.` );
											text.push( `%Autumn% watched them maneuver round the spike balls, with greater fear as she watched %Edgar% become shakier in his movements, while %Dawn%, in contrast, became quieter & seemed to practice closer diligence to what she was doing, with a notable sweat drop dripping down the side o' her face. While she watched this, %Autumn%'s attention flicked to the clock on the wooden post as it crept toward 0.` );
											text.push( `& then, gainst her expectations, it struck 0, followed by the sound o' a buzzer. %Autumn% noticed %Edgar% jump when the spike balls round them suddenly puffed 'way. Then the parrot-like voice o' the announcer squawked, <q>&iexcl;Success!</q>.` );
											text.push( `Before anyone could say anything further, a hole opened 'neath %Dawn% & %Edgar%, causing them to fall into a black chasm while %Autumn% was sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
										}
									}
									else
									{
										text.push( `Edgar panicked when he saw 2 spike balls roll toward him from opposite directions & scrambled forward, only to go so quickly that his feet slipped on the hem o' his robe, causing him to tumble off his ball.` );
										text.push( `Before he had a chance to so much as sit back up, his ball puffed into smoke before everyone's eyes. %Edgar% jumped back to his feet & eyed the spike balls crawling all round him till he heard %Dawn%'s voice call out, <q>%Edgar%, into the ball pit. It should be safe in there</q>. %Edgar% dutifully sidestepped round the spike balls thankfully moving rather slowly for someone no longer bound to a cumbersome ball & dipped himself feet-1st into the lake o' plastic balls. He was pleasantly surprised to find that they weren't nearly as sinkable for someone like him who couldn't swim as water.` );
										text.push( `<q>Shit</q>, muttered %Autumn%.` );

										if ( survival.autumn )
										{
											text.push( `%Autumn% had been so distracted by %Edgar%'s failure that she lost track o' her own progress for a second & almost rolled into a spike ball before she twisted herself in the opposite direction a millimeter before hitting it.` );
											text.push( `<q>&iexcl;%Autumn%!</q>, %Edgar% called out from the ball pit. <q>&iexcl;Watch out for that spike ball on the right!</q>.` );
											text.push( `%Autumn% ignored him & tried to focus 75% o' her attention on the spike balls round her & the rest on the clock, ticking close to 0.` );
											text.push( `& then, gainst her expectations, it struck 0, followed by the sound o' a buzzer. %Autumn% noticed %Edgar% jump when the spike balls round them suddenly puffed 'way. Then the parrot-like voice o' the announcer squawked, <q>&iexcl;Success!</q>.` );
											text.push( `Before anyone could say anything further, a hole opened 'neath %Autumn% & %Dawn%, causing them to fall into a black chasm while %Edgar% was sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
										}
										else
										{
											text.push( `%Autumn% had been so distracted by %Edgar%'s failure that she lost track o' her own progress & now found herself surrounded by spike balls so close, she couldn't figure out how to maneuver round them. She tried to roll her ball back from 2 spike balls coming toward each other, only to back into yet 'nother spike ball, popping her ball & blasting her into the ball pit.` );
											text.push( `<q>&iexcl;Autumn!</q>, exclaimed %Edgar%.` );
											text.push( `But it didn't take long for %Autumn%'s head to pop back up from under the surface o' the ball pit, a moody face slowly releasing ball after ball back to the pit from 'bove her head.` );
											text.push( `%Edgar% swimmed o'er to %Autumn% & said, <q>&iquest;Are you OK?</q>.` );
											text.push( `<q>Yeah</q>, mumbled %Autumn%.` );
											text.push( `They turned their attention to %Dawn%, still maneuvering round the spike balls with a sweat drop dripping down the side o' her face. %Autumn% kept looking up @ the clock on the wooden post, her breathing becoming tighter as she saw it creep toward 0.` );
											text.push( `& then, gainst her expectations, it struck 0, followed by the sound o' a buzzer. %Autumn% noticed %Edgar% jump when the spike balls round them suddenly puffed 'way. Then the parrot-like voice o' the announcer squawked, <q>&iexcl;Success!</q>.` );
											text.push( `Before anyone could say anything further, a hole opened 'neath %Dawn%, causing her to fall into a black chasm while %Autumn% & %Edgar% were sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
										}
									}
								}
								else
								{
									text.push( `But %Dawn% had gone too quickly, rolling forward so quickly that she couldn't stop anymo' till she ran into a spike ball, popping her ball & knocking her off the platform into the sea o' colored balls.` );
									text.push( `%Edgar% noticed this in the corner o' his eyes & turned to see %Dawn% swim back up to the surface.` );
									text.push( `<q>&iquest;Are you OK?</q>, he asked.` );
									text.push( `<q>%Edgar%, watch 'hind you</q>.` );
									text.push( `%Autumn%, who had been too focused on keeping herself up to notice %Dawn% get hit till she heard %Edgar% call out, was now looking up @ seeing a spike ball head right for %Edgar% & was rolling toward him to push him out o' its way.` );
									text.push( `'Pon hearing %Autumn%, %Edgar% swung his head round in panic. He saw a spike ball only half a meter 'way from him.` );

									if ( survival.edgar )
									{
										text.push( `Luckily, %Autumn% reached him before the spike ball did, & she was able to bounce him out o' the spike ball's way.` );

										if ( survival.autumn )
										{
											text.push( `In the process, she herself almost rolled right into a spike ball, but rolled round it just in time, her ball coming within millimeters o' 1 o' them.` );
											text.push( `<q>&iexcl;%Autumn%! &iexcl;Watch out for that spike ball on the right! &iexcl;%Edgar%! &iexcl;'Hind you!</q>.` );
											text.push( `%Autumn% tried to drown out %Dawn% & focused 75% o' her attention on the spike balls round her & the rest on the clock, ticking close to 0.` );
											text.push( `& then, gainst her expectations, it struck 0, followed by the sound o' a buzzer. %Autumn% noticed %Edgar% jump when the spike balls round them suddenly puffed 'way. Then the parrot-like voice o' the announcer squawked, <q>&iexcl;Success!</q>.` );
										}
										else
										{
											text.push( `Unluckily, in bopping %Edgar% out o' the spike ball's way, her ball richocheted back & into a spike ball, popping her ball instantly & knocking her into the ball pit.` );
											text.push( `<q>&iexcl;Autumn!</q>, exclaimed %Edgar%.` );
											text.push( `But it didn't take long for %Autumn%'s head to pop back up from under the surface o' the ball pit, a moody face slowly releasing ball after ball back to the pit from 'bove her head.` );
											text.push( `%Dawn% swimmed o'er to %Autumn% & said, <q>Awfully polite o' you to come join me</q>.` );
											text.push( `<q>Yeah, we'll say that that's what happened</q>, said %Autumn%.` );
											text.push( `Then they watched %Edgar% wobbly roll out o' the way o' spike ball followed by spike ball, during which %Dawn% began calling out advice till %Autumn% asked her to stop distracting him.` );
											text.push( `As %Autumn% watched %Edgar%, she kept half her attention to the clock slowly ticking down on the post.` );
											text.push( `Then the clock hit 0 & a buzzer went off. %Edgar% jumped as he saw the spike balls round him suddenly puff 'way. Then the parrot-like voice o' the announcer squawked, <q>&iexcl;Success!</q>.` );
											text.push( `Before anyone could say anything further, a hole opened 'neath %Autumn% & %Edgar%, causing them to fall into a black chasm while %Dawn% was sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
										}
									}
									else
									{
										text.push( `However, in his rush to roll his ball 'way, he tripped his feet on the hem o' his robe & slipped off his ball.` );
										text.push( `Before he had a chance to so much as sit back up, his ball puffed into smoke before everyone's eyes. %Edgar% jumped back to his feet & eyed the spike balls crawling all round him till he heard %Dawn%'s voice call out, <q>Here, into the ball pit</q>. %Edgar% dutifully sidestepped round the spike balls thankfully moving rather slowly for someone no longer bound to a cumbersome ball & dipped himself feet-1st into the lake o' plastic balls. He was pleasantly surprised to find that they weren't nearly as sinkable for someone like him who couldn't swim as water.` );
										text.push( `<q>Shit</q>, muttered %Autumn%.` );

										if ( survival.autumn )
										{
											text.push( `%Autumn% had been so distracted by %Edgar%'s failure that she lost track o' her own progress for a second & almost rolled into a spike ball before she twisted herself in the opposite direction a millimeter before hitting it.` );
											text.push( `<q>&iexcl;%Autumn%! &iexcl;Watch out for that spike ball on the right!</q>.` );
											text.push( `%Autumn% tried to drown out %Dawn% & focused 75% o' her attention on the spike balls round her & the rest on the clock, ticking close to 0.` );
											text.push( `& then, gainst her expectations, it struck 0, followed by the sound o' a buzzer. %Autumn% noticed %Edgar% jump when the spike balls round them suddenly puffed 'way. Then the parrot-like voice o' the announcer squawked, <q>&iexcl;Success!</q>.` );
											text.push( `Before anyone could say anything further, a hole opened 'neath %Autumn%, causing her to fall into a black chasm while %Dawn% & %Edgar% were sucked down into the ball pit. After a few seconds falling through darkness, they fell out, back onto the board. Trailing a few meters after fell ${ currentMinigame.bet } chips onto their laps.` );
										}
										else
										{
											text.push( `%Autumn% had been so distracted by %Edgar%'s failure that she lost track o' her own progress & now found herself surrounded by spike balls so close, she couldn't figure out how to maneuver round them. She tried to roll her ball back from 2 spike balls coming toward each other, only to back into yet 'nother spike ball, popping her ball & blasting her into the ball pit.` );
											text.push( `<q>&iexcl;Autumn!</q>, exclaimed %Edgar%.` );
											text.push( `But it didn't take long for %Autumn%'s head to pop back up from under the surface o' the ball pit, a moody face slowly releasing ball after ball back to the pit from 'bove her head.` );
											text.push( `%Dawn% & %Edgar% swimmed o'er to %Autumn%, & %Dawn% said, <q>Awfully polite o' you to come join us</q>.` );
											text.push( `<q>Yeah, we'll say that that's what happened</q>, said %Autumn%.` );
											text.push( `Then they all heard a horn blast, followed by the parrot-like voice o' the announcer call out, <q>&iexcl;Failed!</q>, followed by a jingle o' pure pity.` );
											text.push( `Before anyone could say anything further, they began to feel a pulling force under them, & then found themselves sucked into a black chasm. After a few seconds falling through darkness, they fell out, back onto the board. The fall was so hard that it caused ${ currentMinigame.bet } chips to fall out o' their pockets.` );
										}
									}
								}
								return text;
							}
							break;

							case `TOWER`:
							{
								return [];
							}
							break;
						}
					})();
					return this.addParagraphLists([ start, intro, afterIntro, beforeInstructions, instructions ]);
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
		},
		chanceCardText: Object.freeze
		({
			"lose-money1": `Get tricked into joining a religious cult scam. Pay 20 chips`,
			//"lose-money2": ``,
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
				area: `into a green meadow covered in butterflies & soft chirps, with a clean dividng line fashioned with a border o' stones o' various shapes & sizes. While Autumn, as usual, ate up everything round her with her attention, Dawn focused mainly on the strange touch screen monitor on a sign post in front o' them with a stylus dangling from a cord`,
				desc: `Within a minute, count how many moving Rockmen there are, but don’t count the ordinary stones or the Rockmen that dissolve into dust`
			},
			"balls":
			{
				name: `Having a Ball on a Roll`,
				area: `on colored balls with stars on them in a small, circular island covered in short hills & snow surrounded by an ocean o' plastic balls in every color o' the rainbow. Attached to 4 corners o' the island were metal boxes. They — ’specially Edgar — struggled to keep their balance on the balls`,
				desc: `A'least 1 o' you must stay standing on your ball, still on the island, for a whole minute. During that time, avoid the spike balls being shot @ you`
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
