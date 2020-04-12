// Flag to lock actions until set time (for sounds or card reading)
var lock = false;

// Defines score
var score = {

    total : 0,

    current: 0

};

// Defines sound effect
var sounds = {

    fail : null,

    success : null

};

// Defines card measurements
var measures = { dx: 10, dy: 10, dw: 50, dh: 65 };

// Prepares a matrix with all the images
var image_list = { 
    
    background : image_directory( false ), 
    foreground : [ 
        
        [0, "arabic", true],      [1, "arabic", true],      [2, "arabic", true],      [3, "arabic", true],
        [4, "arabic", true],      [5, "arabic", true],      [6, "arabic", true],      [7, "arabic", true],
        [8, "arabic", true],      [9, "arabic", true],      [0, "japanese", true],    [1, "japanese", true],
        [2, "japanese", true],    [3, "japanese", true],    [4, "japanese", true],    [5, "japanese", true],
        [6, "japanese", true],    [7, "japanese", true],    [8, "japanese", true],    [9, "japanese", true]

    ]

};

// Storage for all cards situations
var cards = {

    // Storage for ordered cards
    // Deep Clone with JSON: avoids storing the same reference
    ordered : JSON.parse( JSON.stringify( image_list.foreground ) ),

    // Storage for shuffled cards
    shuffled : [],

    // Number of active cards
    active : {

        number : 0,

        index_positions : [],

        html_positions : []

    },

    // Number of cards already paired
    paired : {
        
        index_position : [],

        html_position : []
    
    }

};


// Object for sound
function sound( src ) {

    // Creates a sound element
    this.sound = document.createElement("audio");

    // Defines the source
    this.sound.src = src;

    // Defines atributes and appearance
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";

    // Append to body
    document.body.appendChild(this.sound);

    // Play sound
    this.play = function(){ this.sound.play(); }

    // Stop sound
    this.stop = function(){ this.sound.pause(); }

  }

// Gets the directory of an especific image
function image_directory( type = "arabic", position = 0, isFG ){
    
    return isFG ? "./images/card_fg_0" + position + "_" + type + ".png" : "./images/card_bg.png";
    
}

// Random table with Fisher-Yates algorithm modernized by Durstenfeld for computers
function fisher_yates( sorted_array ) {

    // Source: https://stackoverflow.com/a/2450976/1494516
    // Source: https://stackoverflow.com/a/12646864/1494516 (probably this one)

    var i, random, temp;

    for( i = sorted_array.length - 1; i > 0; i-- ) {

        random = Math.floor( Math.random() * ( i + 1 ) );

        temp                    = sorted_array[ i ];
        sorted_array[ i ]       = sorted_array[ random ];
        sorted_array[ random ]  = temp;

    }

    return sorted_array;

}

// Set a card into destination
function set_card( row, cell, type = "arabic", position = 0, isFG ){

    // Selects the destination
    var e = document.getElementById( "row-" + row ).children[cell];

    // Creates the proper image
    var image = new Image();

    image.src = image_directory( type, position, isFG );

    // Sets the image
    e.innerHTML = image.outerHTML;
    
}

// Set the whole table game
function set_table( cards = null, isFG ){

    var card;

    for( var i = 0; i < 4; i++ ) for( var j = 0; j < 5; j++ ){

        if( isFG ) {
            
            card = cards[ ( i * 5 ) + j ];

            set_card( i, j, card[1], card[0], isFG );

        } else set_card( i, j, "", 0, isFG );

    }

}

// 
function get_cards_row( row, cell ){

    return document.getElementById( "row-" + row ).children[ cell ];

}

// 
function set_backforeground( cards, position ){

    cards[ position ][2] = ! cards[ position ][2];

}

// 
function get_backforeground( cards, position ){

    return cards[ position ][2];

}

// 
function get_active_cards(){

    return( cards.active );

}

// 
function set_active_cards( value, index_position = 0, html_position = [] ){

    cards.active.number += value;

    if( value > 0 ) { 
        
        cards.active.index_positions.push( index_position ); 

        cards.active.html_positions.push( html_position );
    
    } else if( value < 0 ){ 
        
        cards.active.index_positions.splice( 
            cards.active.index_positions.indexOf( index_position ), 1
        );

        cards.active.html_positions.splice( 
            cards.active.html_positions.indexOf( html_position ), 1
        );

    } else ;

}

// 
function cards_are_paired(){

    var x, y;

    // Only executes if there are more than two cards turned face up
    if( cards.active.number >= 2 ){

        x = cards.active.index_positions[0];
        y = cards.active.index_positions[1];

        return cards.shuffled[ x ][0] == cards.shuffled[ y ][0];

    }

}

// 
function get_paired_cards(){

    return cards.paired;

}

// 
function set_paired_cards( index, html ){

    if( index >= 0 ) cards.paired.index_position.push( index );

    // In case index < 0, probably the game reseted. Or error.
    else cards.paired.index_position = [];


    if( index >= 0 ) cards.paired.html_position.push( html );

    // In case index < 0, probably the game reseted. Or error.
    else cards.paired.html_position = [];

}

// 
function update_score( id ){

    document.getElementById( id ).innerHTML = score[ id ];

}

// 
function set_current_score( value ){

    score.current += value;
    score.total += value;

    update_score( "total" );
    update_score( "current" );

}

// Start the game
function start(){

    // DECLARATIONS

    // The DIV row of a card
    var row;
    
    // The cell the cards is located at
    var cell;
    
    // An HTML element holder for the card
    var e;

    // The position in the randomized list the card is
    var index_position;
    
    // Card details
    var card;
    
    // Every thing needed to be throwed into the onclick event function(){}
    var stuff;


    // Sets everything anew
    score.current = 0;
    cards.active.number = 0;
    cards.active.index_positions = [];
    cards.paired.index_position = [];
    cards.paired.html_position = [];
    lock = false;

    // Randomizes the locations of cards
    cards.shuffled = fisher_yates( JSON.parse( JSON.stringify( cards.ordered ) ) );

    // Set the cards faced down
    set_table( false );

    // Sets score;
    update_score( "total" );
    update_score( "current" );


    // Add onclick event into every card
    for( row = 0; row < 4; row++ ) for( cell = 0; cell < 5; cell++ ){

        // Gets a row of cards to be considered
        e = get_cards_row( row, cell );

        // Calculates the index that positions the current card
        index_position = ( row * 5 ) + cell;

        // Defines the position of the card in the HTML
        card = cards.shuffled[ index_position ];

        // Throwable content (see next)
        stuff = { 
             
            e : e, 
            row : row, cell : cell,
            card : card, 
            index_position : index_position

        };

        // Throws content to be used inside a function(){} that would be otherwise unreachable
        try{ throw stuff; } catch( everything ) {

            // Source: https://dzone.com/articles/why-does-javascript-loop-only-use-last-value

            everything.e.onclick = function() { 
                
                // Renaming
                var row             = everything.row;
                var cell            = everything.cell;
                var index_position  = everything.index_position;
                var card            = everything.card;

                // Declares active cards variables
                var active = [], index = 0, html = 1, position = [];
                
                // Stops the event if the code is locked
                if( lock ) return ; else ;

                // Stops the event if the card is already paired;
                if( get_paired_cards().index_position.includes( index_position ) ) return ; else ;

                // Declares the variable that defines which side to use
                var side;

                // Defines the HTML position ina variable to be stored with reference (for use with indexOf)
                position = [ row, cell ];

                // Turning cards up and down
                if( get_active_cards().number < 2 ){

                    // Set to turn upside
                    side = get_backforeground( cards.shuffled, index_position );

                    // Contabilizes the card
                    set_active_cards( side ? 1 : -1, index_position, position );
                    set_backforeground( cards.shuffled, index_position );

                // Unturn if turned
                } else if( ! get_backforeground( cards.shuffled, index_position ) ){

                    side = false;

                    set_active_cards( -1, index_position, position );
                    set_backforeground( cards.shuffled, index_position );

                } else ;

                // Set the card based on the side
                set_card( row, cell, card[1], card[0], side );

                // Remove cards from being actionable if a pair was formed
                if( get_active_cards().number >= 2 ) {

                    // Defines the index of both active cards
                    active.push( [ 
                        
                        get_active_cards().index_positions[0],
                        get_active_cards().index_positions[1]

                    ] );

                    // Defines the row and cell of both active cards
                    active.push( [ 
                        
                        get_active_cards().html_positions[0], 
                        get_active_cards().html_positions[1] 

                    ] );

                    // DEBUG - Show active cards to verify pair
                    console.log( 
                        cards.shuffled[ active[ index ][0] ],
                        cards.shuffled[ active[ index ][1] ]
                    );
                    
                    // Paired cards are out
                    if( cards_are_paired() ){

                        // Lock flag to hold code execution
                        lock = true;

                        // Sound: success play
                        sounds.success.play();

                        // Holds code from executing for a period
                        setTimeout( function () {

                            // Stores the indexes and html position of those already paired
                            set_paired_cards( active[ index ][0], active[ html ][0] );
                            set_paired_cards( active[ index ][1], active[ html ][1] );

                            // Remove active cards for both paired cards
                            set_active_cards( -1, active[ index ][1], active[ html ][1] );
                            set_active_cards( -1, active[ index ][0], active[ html ][0] );

                            // Updates score
                            set_current_score( 5 );
                            update_score( "current" );

                            // Unlock the locked code
                            lock = false;

                        }, 100); // Just to avoid missing clicks or wait another player or sound

                    } else { // Turn down the cards if not paired

                        // Lock flag to hold code execution
                        lock = true;

                        // Sound: fail play
                        sounds.fail.play();

                        // Holds code from executing for a period
                        setTimeout( function () {

                            // Updates score
                            set_current_score( -2 );
                            update_score( "current" );

                            // Turn down the first cards
                            set_backforeground( cards.shuffled, active[ index ][0] );
                            set_card( 

                                active[ html ][0][0], 
                                active[ html ][0][1], 
                                cards.shuffled[ active[ index ][0] ][1], 
                                cards.shuffled[ active[ index ][0] ][0], 
                                false 

                            );

                            // Turn down the second card (just clicked on)
                            set_backforeground( cards.shuffled, active[ index ][1] );
                            set_card( 
                                
                                active[ html ][1][0], 
                                active[ html ][1][1], 
                                cards.shuffled[ active[ index ][1] ][1], 
                                cards.shuffled[ active[ index ][1] ][0], 
                                false 
                                
                            );

                            // Remove active cards for both paired cards
                            set_active_cards( -1, active[ index ][1], active[ html ][1] );
                            set_active_cards( -1, active[ index ][0], active[ html ][0] );

                            // Unlock the locked code
                            lock = false;

                        }, 1000);

                    }

                }

            };

        }

        // Disables dragging
        e.ondragstart = function(){ return false; };

        // Disables selection
        // ( See CSS )

    }

}


// Loads screen
window.addEventListener( 
    
    "load", 
    function() {

        // Load sounds
        sounds.success  = new sound("./sounds/success.mp3");
        sounds.fail     = new sound("./sounds/fail.mp3");

        // Start the game
        start();
    
    }, 
    false 
    
    );

// DEBUG - To be left at the end of the code
console.log( "SCRIPT FULLY EXECUTED" );
