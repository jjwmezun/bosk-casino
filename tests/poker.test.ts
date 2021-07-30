
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

const randRank = ():number => Bosk.randInt( cardRanks.length - 1, 0 );
const randSuit = ():number => Bosk.randInt( 3, 0 );

class PokerCard {
    readonly rankIndex:number;
    readonly suitIndex:number;
    constructor( rankIndex:number, suitIndex:number ) {
        this.rankIndex = rankIndex;
        this.suitIndex = suitIndex;
    }

    getRankText():string { return cardRanks[ this.rankIndex ]; }
    getSuitText():string { return cardSuits[ this.suitIndex ]; }
    getText():string { return `${ this.getSuitText() }${ this.getRankText() }`; }
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
        getHand: ():PokerHand => new PokerHand( [ ...Array( 5 ).keys() ].map( getCard ) )
    };
})());

enum PokerHandType {
    RoyalFlush,
    StraightFlush,
    FourOfAKind,
    FullHouse,
    Flush,
    Straight,
    ThreeOfAKind,
    TwoPair,
    OnePair,
    HighCard
};

const testIsStraightFlush = function( cards:readonly PokerCard[] ):boolean {
    let testRank:number = cards[ 0 ].rankIndex;
    for ( let i = 1; i < cards.length; ++i ) {
        // Make sure all cards after 1st share 1st’s suit & go up in rank sequence from 1st’s.
        if ( cards[ 0 ].suitIndex !== cards[ i ].suitIndex || cards[ i ].rankIndex !== ++testRank ) {
            return false;
        }
    }
    return true;
};

const testIsFlush = function( cards:readonly PokerCard[] ):boolean {   
    for ( let i = 1; i < cards.length; ++i ) {
        if ( cards[ 0 ].suitIndex !== cards[ i ].suitIndex ) {
            return false;
        }
    }
    return true;
};

const testIsStraight = function( cards:readonly PokerCard[] ):boolean {
    let testRank:number = cards[ 0 ].rankIndex;
    for ( let i = 1; i < cards.length; ++i ) {
        // Make sure all cards go up in rank sequence from 1st’s.
        if ( cards[ i ].rankIndex !== ++testRank ) {
            return false;
        }
    }
    return true;
};

const findPairs = function( cards:readonly PokerCard[] ):number[][] {
    const pairs:number[][] = [];
    for ( let i = 0; i < cards.length; ++i ) {
        for ( let j = i + 1; j < cards.length; ++j ) {
            if ( cards[ i ].rankIndex === cards[ j ].rankIndex ) {
                pairs.push( [ i, j ] );
            }
        }
    }
    return pairs;
};

class PokerHand {
    readonly cards:PokerCard[];
    readonly type:PokerHandType;
    readonly kicker:number;
    readonly kickers:number[];
    readonly topRank:number;
    readonly topRanks:number[];

    constructor( cards:readonly PokerCard[] ) {
        if ( cards.length !== 5 ) {
            throw `Invalid Deck size ${ cards.length }. Must be 5.`;
        }

        this.cards = cards.slice().sort( ( a:PokerCard, b:PokerCard ):number => a.rankIndex - b.rankIndex );
        this.type = PokerHandType.HighCard;
        this.kicker = 0;
        this.topRank = 0;
        this.kickers = [];
        this.topRanks = [];

        // Test for Straight Flush
        if ( testIsStraightFlush( this.cards ) ) {
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
                        return;
                    }
                }
                break;
            }
        }

        // Test for Flush
        if ( testIsFlush( this.cards ) ) {
            this.type = PokerHandType.Flush;
            this.topRank = this.cards[ 0 ].rankIndex;
            return;
        }

        // Test for Straight
        if ( testIsStraight( this.cards ) ) {
            this.type = PokerHandType.Straight;
            this.topRank = this.cards[ 0 ].rankIndex;
            return;
        }

        // Test for 3 o’ a Kind
        for ( let i = 0; i < 3; ++i ) {
            let isThreeKind:boolean = true;
            for ( let j = i + 1; j < i + 3; ++j ) {
                if ( this.cards[ j ].rankIndex !== this.cards[ i ].rankIndex ) {
                    isThreeKind = false;
                    break;
                }
            }
            if ( isThreeKind ) {
                this.type = PokerHandType.ThreeOfAKind;
                this.topRank = this.cards[ i ].rankIndex;

                // Find min ( highest o’ rank ) o’ 2 cards that aren’t part o’ triple.
                const nonTriple:number[] = ( i === 1 ) ? [ 0, 4 ] : ( ( i === 2 ) ? [ 0, 1 ] : [ 3, 4 ] );
                this.kickers = nonTriple.map( ( n:number ) => this.cards[ n ].rankIndex ).sort();
                return;
            }
        }

        // Test for 2 Pair
        const pairs:number[][] = findPairs( this.cards );
        switch ( pairs.length ) {
            case ( 2 ):
            {
                this.type = PokerHandType.TwoPair;
                this.topRanks = pairs.map( ( list:number[] ) => this.cards[ list[ 0 ] ].rankIndex ).sort();
                const flatPairs:number[] = [].concat.apply( [], pairs );
                for ( let i = 0; i < this.cards.length; ++i ) {
                    if ( !flatPairs.includes( i ) ) {
                        this.kicker = this.cards[ i ].rankIndex;
                        return;
                    }
                }
                return;
            }
            case ( 1 ):
            {
                this.type = PokerHandType.OnePair;
                this.topRank = this.cards[ pairs[ 0 ][ 0 ] ].rankIndex;
                // Set kickers as all cards not part o’ pair.
                this.kickers = [ ...Array( 5 ).keys() ]
                    .map( ( n:number ) => ( pairs[ 0 ].includes( n ) ) ? -1 : n )
                    .filter( ( n:number ) => n >= 0 )
                    .map( ( n:number ) => this.cards[ n ].rankIndex )
                    .sort();
            }
        }
    }

    comp( other:PokerHand ):number {
        if ( this.type === other.type ) {
            switch ( this.type ) {
                case ( PokerHandType.StraightFlush ):
                case ( PokerHandType.Straight ):
                    return this.topRank - other.topRank;
                case ( PokerHandType.FourOfAKind ):
                case ( PokerHandType.FullHouse ):
                    return ( this.topRank === other.topRank ) ? this.kicker - other.kicker : this.topRank - other.topRank;
                case ( PokerHandType.HighCard ):
                case ( PokerHandType.Flush ):
                    for ( let i = 0; i < this.cards.length; ++i ) {
                        if ( this.cards[ i ].rankIndex !== other.cards[ i ].rankIndex ) {
                            return this.cards[ i ].rankIndex - other.cards[ i ].rankIndex;
                        }
                    }
                    return 0;
                case ( PokerHandType.ThreeOfAKind ):
                case ( PokerHandType.OnePair ):
                    if ( this.topRank !== other.topRank ) {
                        return this.topRank - other.topRank;
                    }
                    for ( let j = 0; j < this.kickers.length && j < other.kickers.length; ++j ) {
                        if ( this.kickers[ j ] != other.kickers[ j ] ) {
                            return this.kickers[ j ] - other.kickers[ j ];
                        }
                    }
                    return 0;
                case ( PokerHandType.TwoPair ):
                    for ( let i = 0; i < this.topRanks.length && i < other.topRanks.length; ++i ) {
                        if ( this.topRanks[ i ] != other.topRanks[ i ] ) {
                            return this.topRanks[ i ] - other.topRanks[ i ];
                        }
                    }
                    return this.kicker - other.kicker;
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
    return `${ color }${ card.getText() }\x1b[0m`;
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
        const hand1:PokerHand = new PokerHand([ new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 5, randSuit() ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 4, randSuit() ), new PokerCard( 8, randSuit() ), new PokerCard( 8, randSuit() ), new PokerCard( 8, randSuit() ), new PokerCard( 8, randSuit() ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 9, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ) ]);
        const hand4:PokerHand = new PokerHand([ new PokerCard( 5, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ) ]);
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
        const hand1:PokerHand = new PokerHand([ new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 3, randSuit() ), new PokerCard( 3, randSuit() ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 1, randSuit() ), new PokerCard( 1, randSuit() ), new PokerCard( 8, randSuit() ), new PokerCard( 8, randSuit() ), new PokerCard( 8, randSuit() ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 4, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 7, randSuit() ), new PokerCard( 4, randSuit() ) ]);
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

test
(
    `Hand is a Flush`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( randRank(), 1 ), new PokerCard( randRank(), 1 ), new PokerCard( randRank(), 1 ), new PokerCard( randRank(), 1 ), new PokerCard( randRank(), 1 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 3, 2 ), new PokerCard( 5, 2 ), new PokerCard( 8, 2 ), new PokerCard( 4, 2 ), new PokerCard( 4, 2 ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 8, 3 ), new PokerCard( 9, 3 ), new PokerCard( 10, 3 ), new PokerCard( 6, 3 ), new PokerCard( 1, 3 ) ]);
        const hand4:PokerHand = new PokerHand([ new PokerCard( 8, 3 ), new PokerCard( 9, 3 ), new PokerCard( 11, 3 ), new PokerCard( 6, 3 ), new PokerCard( 1, 3 ) ]);
        const hand5:PokerHand = new PokerHand([ new PokerCard( 8, 3 ), new PokerCard( 9, 3 ), new PokerCard( 11, 3 ), new PokerCard( 6, 3 ), new PokerCard( 1, 3 ) ]);
        expect( hand1.type ).toEqual( PokerHandType.Flush );
        expect( hand2.topRank ).toEqual( 3 );
        expect( hand3.topRank ).toEqual( 1 );
        expect( hand3.beats( hand2 ) ).toBeTruthy();
        expect( hand3.beats( hand4 ) ).toBeTruthy();
        expect( hand4.comp( hand5 ) ).toEqual( 0 );
    }
);

test
(
    `Hand is a Straight`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 4, 1 ), new PokerCard( 7, 3 ), new PokerCard( 5, 2 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 2, 0 ), new PokerCard( 4, 1 ), new PokerCard( 1, 3 ), new PokerCard( 5, 2 ) ]);
        expect( hand1.type ).toEqual( PokerHandType.Straight );
        expect( hand2.beats( hand1 ) ).toBeTruthy();
    }
);

test
(
    `Hand is a 3 o’ a Kind`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 3, 1 ), new PokerCard( 7, 3 ), new PokerCard( 3, 2 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 2, 1 ), new PokerCard( 6, 0 ), new PokerCard( 2, 1 ), new PokerCard( 7, 3 ), new PokerCard( 2, 2 ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 2, 1 ), new PokerCard( 6, 0 ), new PokerCard( 2, 1 ), new PokerCard( 5, 3 ), new PokerCard( 2, 2 ) ]);
        const hand4:PokerHand = new PokerHand([ new PokerCard( 2, 2 ), new PokerCard( 6, 3 ), new PokerCard( 2, 1 ), new PokerCard( 5, 0 ), new PokerCard( 2, 2 ) ]);
        expect( hand1.type ).toEqual( PokerHandType.ThreeOfAKind );
        expect( hand2.beats( hand1 ) ).toBeTruthy();
        expect( hand3.beats( hand2 ) ).toBeTruthy();
        expect( hand3.comp( hand4 ) ).toEqual( 0 );
    }
);

test
(
    `Hand is a 2 Pair`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 6, 1 ), new PokerCard( 7, 3 ), new PokerCard( 3, 2 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 7, 0 ), new PokerCard( 7, 1 ), new PokerCard( 2, 3 ), new PokerCard( 3, 2 ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 2, 1 ), new PokerCard( 6, 0 ), new PokerCard( 6, 1 ), new PokerCard( 9, 3 ), new PokerCard( 2, 2 ) ]);
        expect( hand1.type ).toEqual( PokerHandType.TwoPair );
        expect( hand1.beats( hand2 ) ).toBeTruthy();
        expect( hand3.beats( hand1 ) ).toBeTruthy();
        expect( hand1.comp( hand1 ) ).toEqual( 0 );
    }
);

test
(
    `Hand is a Pair`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 1, 1 ), new PokerCard( 7, 3 ), new PokerCard( 3, 2 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 2, 1 ), new PokerCard( 6, 0 ), new PokerCard( 11, 1 ), new PokerCard( 7, 3 ), new PokerCard( 2, 2 ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 1, 1 ), new PokerCard( 8, 3 ), new PokerCard( 3, 2 ) ]);
        expect( hand1.type ).toEqual( PokerHandType.OnePair );
        expect( hand2.beats( hand1 ) ).toBeTruthy();
        expect( hand1.beats( hand3 ) ).toBeTruthy();
    }
);

test
(
    `Hand is a High Card`,
    function()
    {
        const hand1:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 1, 1 ), new PokerCard( 7, 3 ), new PokerCard( 11, 2 ) ]);
        const hand2:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 1, 1 ), new PokerCard( 7, 3 ), new PokerCard( 12, 2 ) ]);
        const hand3:PokerHand = new PokerHand([ new PokerCard( 3, 1 ), new PokerCard( 6, 0 ), new PokerCard( 0, 1 ), new PokerCard( 7, 3 ), new PokerCard( 11, 2 ) ]);
        expect( hand1.type ).toEqual( PokerHandType.HighCard );
        expect( hand1.beats( hand2 ) ).toBeTruthy();
        expect( hand3.beats( hand1 ) ).toBeTruthy();
    }
);
