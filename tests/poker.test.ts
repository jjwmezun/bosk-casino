
class BoskT
{
    constructor()
    {

    }

    public isArray( thing:any ):any
    {
        return thing instanceof Array;
    }

    public dirUploads():string
    {
        return 'http://localhost/bosk2/public/';
    }

    public isEven( n:number ):boolean
    {
        return n % 2 === 0;
    }

    public shuffleList<T>( list:readonly T[] ):T[]
    {
        return list.slice( 0 ).sort( function() { return 0.5 - Math.random() } );
    }

    public inList<T>( list:readonly T[], val:T ):boolean
    {
        return list.some
        (
            function( currentValue )
            {
                return currentValue === val;
            }
        );
    }

    public rand( closure:()=>any, ignore:any ):any
    {
        if ( ignore === undefined )
        {
            ignore = null;
        }

        if ( !this.isArray( ignore ) )
        {
            ignore = [ ignore ];
        }

        var x = null;

        do
        {
            x = closure();
        }
        while ( this.inList( ignore, x ) )

        return x;
    }

    public randInt( max:number, min:number, ignore:any = undefined ):number
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

        return this.rand( function() { return Math.floor( ( Math.random() * ( max + 1 - min ) ) + min ); }, ignore );
    }

    public randListIndex<T>( list:readonly T[], ignore:T = undefined ):number
    {
        return this.randInt( list.length - 1, 0, ignore );
    }

    public randListEntry<T>( list:readonly T[], ignore:T = undefined ):any
    {
        console.log( this );
        return this.rand( function() { return list[ this.randListIndex( list ) ]; }.bind( this ), ignore );
    }

    public randBoolean():boolean
    {
        return 1 === this.randInt( 1, 0 );
    }

    public randPercent( percent )
    {
        return this.randInt( 100, 0 ) < percent;
    }

    public average( list )
    {
        var sum = 0;

        for ( var i = 0; i < list.length; i++ )
        {
            sum += list[ i ];
        }

        return sum / list.length;
    }

    public listMaxorMix( list, comp )
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
    }

    public listMax( list )
    {
        return this.listMaxorMix( list, function( max, item ) { return max < item; } );
    }

    public getEndOfList( list )
    {
        return list[ list.length - 1 ];
    }
};

const Bosk:BoskT = new BoskT();

interface Poker {
    getHand: () => PokerHand;
};

const cardSuits:readonly string[] = Object.freeze([
    `♦`,
    `♣`,
    `♥`,
    `♠`
]);

const cardRanks:readonly string[] = Object.freeze([
    `A`,
    `K`,
    `Q`,
    `J`,
    `10`,
    `9`,
    `8`,
    `7`,
    `6`,
    `5`,
    `4`,
    `3`,
    `2`
]);

class PokerCard {
    readonly rankIndex:number;
    readonly suitIndex:number;
    constructor( rankIndex:number, suitIndex:number ) {
        this.rankIndex = rankIndex;
        this.suitIndex = suitIndex;
    }

    getRankText():string { return cardRanks[ this.rankIndex ]; }
    getSuitText():string { return cardSuits[ this.suitIndex ]; }
    isHeart():boolean { return this.suitIndex === 2 };
    isDiamond():boolean { return this.suitIndex === 0 };
};

const poker:Poker = Object.freeze( ( function() {
    const masterDeck:PokerCard[] = Bosk.shuffleList( ( function():PokerCard[] {
        const list:PokerCard[] = [];
        for ( let suit = 0; suit < cardSuits.length; ++suit ) {
            for ( let rank = 0; rank < cardRanks.length; ++rank ) {
                list.push( new PokerCard( rank, suit ) );
            }
        }
        return list;
    })());
    const getCard = function():PokerCard {
        const cardIndex:number = Bosk.randListIndex( masterDeck );
        return masterDeck.splice( cardIndex, 1 )[ 0 ];
    };
    return {
        getHand: ():PokerHand => new PokerHand( [ ...Array( 5 ).keys() ].map( getCard ).sort( ( a:PokerCard, b:PokerCard ):number => a.rankIndex - b.rankIndex ) )
    };
})());

enum PokerHandType {
    RoyalFlush,
    StraightFlush,
    FourOfAKind,
    FullHouse,
    HighCard
};

class PokerHand {
    readonly cards:PokerCard[];
    readonly type:PokerHandType;
    readonly kicker:number;
    readonly topRank:number;

    constructor( cards:PokerCard[] ) {
        this.cards = cards;
        this.type = PokerHandType.HighCard;
        this.kicker = 0;
        this.topRank = 0;

        // Test for Straight Flush
        let testRank:number = this.cards[ 0 ].rankIndex;
        let testSuit:number = this.cards[ 0 ].suitIndex;
        let isStraightFlush:boolean = true;
        for ( let i = 1; i < this.cards.length; ++i ) {
            // Make sure all cards after 1st share 1st’s suit & go up in rank sequence from 1st’s.
            if ( this.cards[ i ].suitIndex !== testSuit || this.cards[ i ].rankIndex !== ++testRank ) {
                isStraightFlush = false;
                break;
            }
        }

        if ( isStraightFlush ) {
            this.type = ( this.cards[ 0 ].rankIndex === 0 ) ? PokerHandType.RoyalFlush : PokerHandType.StraightFlush;
            this.topRank = this.cards[ 0 ].rankIndex;
            return;
        }

        // Test for 4 o’ a Kind
        for ( let i = 0; i < 2; ++i ) {
            let isFourKind:boolean = true;
            for ( let j = i + 1; j < i + 4; ++j ) {
                if ( this.cards[ j ].rankIndex !== this.cards[ i ].rankIndex ) {
                    isFourKind = false;
                    break;
                }
            }
            if ( isFourKind ) {
                this.type = PokerHandType.FourOfAKind;
                this.kicker = this.cards[ ( i === 0 ) ? 4 : 0 ].rankIndex;
                this.topRank = this.cards[ i ].rankIndex;
                return;
            }
        }

        // Test for Full House
        for ( let i = 1; i < this.cards.length; ++i ) {
            if ( this.cards[ 0 ].rankIndex !== this.cards[ i ].rankIndex ) {
                if ( i === 2 || i === 3 ) {
                    let isFullHouse:boolean = true;
                    for ( let j = i; j < this.cards.length; ++j ) {
                        if ( this.cards[ i ].rankIndex !== this.cards[ j ].rankIndex ) {
                            isFullHouse = false;
                            break;
                        }
                    }

                    if ( isFullHouse ) {
                        this.type = PokerHandType.FullHouse;
                        this.topRank = this.cards[ ( i === 2 ) ? 2 : 0 ].rankIndex;
                        this.kicker = this.cards[ ( i === 2 ) ? 0 : 3 ].rankIndex;
                    }
                }
                break;
            }
        }
        

    }

    comp( other:PokerHand ):number {
        if ( this.type === other.type ) {
            switch ( this.type ) {
                case ( PokerHandType.StraightFlush ):
                    return this.topRank - other.topRank;
                case ( PokerHandType.FourOfAKind ):
                case ( PokerHandType.FullHouse ):
                    return ( this.topRank === other.topRank ) ? this.kicker - other.kicker : this.topRank - other.topRank;
            }
        }
        return this.type - other.type;
    }

    beats( other:PokerHand ):boolean {
        return this.comp( other ) < 0;
    }
};


const consoleFormatCard = function( card:PokerCard ):string {
    const color:string = ( card.isHeart() || card.isDiamond() ) ? `\x1b[31m` : `\x1b[34m`;
    return `${ color }${ card.getSuitText() }${ card.getRankText() }\x1b[0m`;
};


test
(
    `Deck has 5 cards.`,
    function()
    {
        const autumnsHand:PokerHand = poker.getHand();
        const dawnsHand:PokerHand = poker.getHand();

        console.log( `Autumn’s Hand: ${ autumnsHand.cards.map( consoleFormatCard ).join( ", " ) }\n${ autumnsHand.type }` );
        console.log( `Dawn’s Hand: ${ dawnsHand.cards.map( consoleFormatCard ).join( ", " ) }\n${ dawnsHand.type }` );

        expect( autumnsHand.cards.length ).toEqual( 5 );
        expect( dawnsHand.cards.length ).toEqual( 5 );
    }
);

test
(
    `Hand is a Royal Flush`,
    function()
    {
        const hand:PokerHand = new PokerHand( [ ...Array( 5 ).keys() ].map( ( number:number ) => new PokerCard( number, 1 ) ) );
        const hand2:PokerHand = new PokerHand( [ ...Array( 5 ).keys() ].map( ( number:number ) => new PokerCard( number, 3 ) ) );
        console.log( `Hand: ${ hand.cards.map( consoleFormatCard ).join( ", " ) }` );
        expect( hand.type ).toEqual( PokerHandType.RoyalFlush );
        expect( hand.comp( hand2 ) ).toEqual( 0 );
    }
);

test
(
    `Hand is a Straight Flush`,
    function()
    {
        const hand1:PokerHand = new PokerHand( [ ...Array( 5 ).keys() ].map( ( number:number ) => new PokerCard( number + 2, 1 ) ) );
        const hand2:PokerHand = new PokerHand( [ ...Array( 5 ).keys() ].map( ( number:number ) => new PokerCard( number + 4, 1 ) ) );
        const hand3:PokerHand = new PokerHand( [ ...Array( 5 ).keys() ].map( ( number:number ) => new PokerCard( number + 2, 3 ) ) );
        console.log( `Hand 1: ${ hand1.cards.map( consoleFormatCard ).join( ", " ) }` );
        console.log( `Hand 2: ${ hand2.cards.map( consoleFormatCard ).join( ", " ) }` );
        expect( hand1.type ).toEqual( PokerHandType.StraightFlush );
        expect( hand1.beats( hand2 ) ).toBeTruthy();
        expect( hand2.beats( hand1 ) ).toBeFalsy();
        expect( hand1.comp( hand3 ) ).toEqual( 0 );
    }
);

test
(
    `Hand is not a Straight Flush`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 7, 2 ), new PokerCard( 7, 2 ), new PokerCard( 7, 2 ), new PokerCard( 7, 2 ), new PokerCard( 7, 2 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 2, 3 ), new PokerCard( 3, 2 ), new PokerCard( 4, 1 ), new PokerCard( 5, 2 ), new PokerCard( 6, 1 ) ]);
        console.log( `Hand 1: ${ hand1.cards.map( consoleFormatCard ).join( ", " ) }` );
        console.log( `Hand 2: ${ hand2.cards.map( consoleFormatCard ).join( ", " ) }` );
        expect( hand1.type ).not.toEqual( PokerHandType.StraightFlush );
        expect( hand2.type ).not.toEqual( PokerHandType.StraightFlush );
    }
);

test
(
    `Hand is a 4 o’ a Kind`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 5, Bosk.randInt( 3, 0 ) ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 4, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 9, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ) ]);
        const hand4:PokerHand = new PokerHand([ new PokerCard( 5, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ) ]);
        console.log( `Hand 1: ${ hand1.cards.map( consoleFormatCard ).join( ", " ) }` );
        console.log( `Hand 2: ${ hand2.cards.map( consoleFormatCard ).join( ", " ) }` );
        expect( hand1.type ).toEqual( PokerHandType.FourOfAKind );
        expect( hand2.type ).toEqual( PokerHandType.FourOfAKind );
        expect( hand1.kicker ).toEqual( 5 );
        expect( hand2.kicker ).toEqual( 4 );
        expect( hand1.topRank ).toEqual( 7 );
        expect( hand2.topRank ).toEqual( 8 );
        expect( hand1.beats( hand2 ) ).toBeTruthy();
        expect( hand2.beats( hand1 ) ).toBeFalsy();
        expect( hand1.beats( hand3 ) ).toBeTruthy();
        expect( hand1.comp( hand4 ) ).toEqual( 0 );
    }
);

test
(
    `Hand is a Full House`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 3, Bosk.randInt( 3, 0 ) ), new PokerCard( 3, Bosk.randInt( 3, 0 ) ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 1, Bosk.randInt( 3, 0 ) ), new PokerCard( 1, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ), new PokerCard( 8, Bosk.randInt( 3, 0 ) ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 4, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 7, Bosk.randInt( 3, 0 ) ), new PokerCard( 4, Bosk.randInt( 3, 0 ) ) ]);
        expect( hand1.type ).toEqual( PokerHandType.FullHouse );
        expect( hand2.type ).toEqual( PokerHandType.FullHouse );
        expect( hand1.topRank ).toEqual( 7 );
        expect( hand1.kicker ).toEqual( 3 );
        expect( hand1.beats( hand2 ) ).toBeTruthy();
        expect( hand1.beats( hand3 ) ).toBeTruthy();
    }
);

test
(
    `Hand is not a Full House`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 7, 2 ), new PokerCard( 7, 2 ), new PokerCard( 2, 2 ), new PokerCard( 3, 2 ), new PokerCard( 3, 2 ) ]);
        expect( hand1.type ).not.toEqual( PokerHandType.FullHouse );
    }
);
