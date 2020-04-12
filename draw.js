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

// Set a card into a destination facing up or down
function set_card( row, cell, type = "arabic", position = 0, isFG ){

    // Declarations
    var e, image;

    // Selects the destination
    e = document.getElementById( "row-" + row ).children[cell];

    // Creates the proper image
    image = new Image();

    // Sets the image source
    image.src = image_directory( type, position, isFG );

    // Sets the image into the page
    e.innerHTML = image.outerHTML;
    
}

// Set the whole table game
function set_table( cards = null, isFG ){

    // Declarations
    var card;

    // For each card in the matrix
    for( var i = 0; i < 4; i++ ) for( var j = 0; j < 5; j++ ){

        // Checks if the side is the foreground
        if( isFG ) {
            
            // Get the card at a given position in the matrix
            card = cards[ ( i * 5 ) + j ];

            // Set the card as foreground facing up
            set_card( i, j, card[1], card[0], isFG );

        // The side is the background so where the card is doesn't matter
        // as all the cards will be facing down (background up)
        } else set_card( i, j, "", 0, isFG );

    }

}

// Returns a specific card at a given row and inside a cell
function get_card_at( row, cell ){

    return document.getElementById( "row-" + row ).children[ cell ];

}

// Sets a card's next side to be facing up
function set_next_faceup_side( cards, position ){

    // Inverts the value of the boolean
    cards[ position ][2] = ! cards[ position ][2];

}

// Get a cards's next side to be facing up
function get_next_faceup_side( cards, position ){

    return cards[ position ][2];

}

// Get the object listing the active cards
function get_active_cards(){

    return( cards.active );

}

// Sets (add or remove) a card into the active listing object
function set_active_cards( value, index_position = 0, html_position = [] ){

    // Number of cards currently active
    cards.active.number += value;

    // If the value is positive, adds the cards into the listing object
    if( value > 0 ) { 
        
        cards.active.index_positions.push( index_position ); 

        cards.active.html_positions.push( html_position );
    
    // If the value is negative (or zero), removes the card from the listing object
    } else if( value < 0 ){ 
        
        // .splice removes a card given by .indexOf
        // .indexOf searches for the index of a card into the listing 
        //                                 (value by refenrece needed)

        cards.active.index_positions.splice( 
            cards.active.index_positions.indexOf( index_position ), 1
        );

        cards.active.html_positions.splice( 
            cards.active.html_positions.indexOf( html_position ), 1
        );

    } else ;

}

// Verify if both active cards are paired
function cards_are_paired(){

    // Declarations
    var x, y;

    // Only executes if there are two or more cards turned facing up
    if( cards.active.number >= 2 ){

        // Get the cards to be compared
        x = cards.active.index_positions[0];
        y = cards.active.index_positions[1];

        // Return the results
        return cards.shuffled[ x ][0] == cards.shuffled[ y ][0];

    }

}

// Gets a list of cards already paired
function get_paired_cards(){

    return cards.paired;

}

// Sets paired cards into the listing that tracks paired cards
function set_paired_cards( index, html ){

    // Stores the index of the paired card relative to cards.shuffled
    if( index >= 0 ){
    
        // Stores the paired card relative to cards.shuffled        
        cards.paired.index_position.push( index );
        cards.paired.html_position.push( html );

    } else { // In case index < 0, probably the game reseted. Or error.
        
        // Resets the paired card relative to cards.shuffled  
        cards.paired.index_position = [];
        cards.paired.html_position = [];

    }

}

// Draws the score into the HTML given an ID
function draw_score( id ){

    document.getElementById( id ).innerHTML = score[ id ];

}

// Updates the score and draws it
function update_score( value ){

    // Updates the score values
    score.current += value;
    score.total += value;

    // Draws the updated score
    draw_score( "total" );
    draw_score( "current" );

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
    cards.active.html_positions = [];
    cards.paired.index_position = [];
    cards.paired.html_position = [];
    lock = false;

    // Randomizes the locations of cards
    cards.shuffled = fisher_yates( JSON.parse( JSON.stringify( cards.ordered ) ) );

    // Set the cards faced down
    set_table( false );

    // Draws score
    draw_score( "total" );
    draw_score( "current" );


    // Add onclick event into every card
    for( row = 0; row < 4; row++ ) for( cell = 0; cell < 5; cell++ ){

        // Gets a row of cards to be considered
        e = get_card_at( row, cell );

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

                    // Set the card to turn up
                    side = get_next_faceup_side( cards.shuffled, index_position );

                    // Contabilizes the card
                    set_active_cards( side ? 1 : -1, index_position, position );
                    set_next_faceup_side( cards.shuffled, index_position );

                } else { // Turn the card down since we can't have more than 2 active cards up (!= paired)
                    
                    // Verify if possible to turn card down
                    if( ! get_next_faceup_side( cards.shuffled, index_position ) ){

                        // Set to turn face down
                        side = false;

                        // Turn down and make it turnable to face up
                        set_active_cards( -1, index_position, position );
                        set_next_faceup_side( cards.shuffled, index_position );

                    } else ; 
                
                }

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

                            // Updates and draws the score
                            update_score( 5 );
                            draw_score( "current" );

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

                            // Updates and draws the score
                            update_score( -2 );
                            draw_score( "current" );

                            // Turn down the first cards
                            set_next_faceup_side( cards.shuffled, active[ index ][0] );
                            set_card( 

                                active[ html ][0][0], 
                                active[ html ][0][1], 
                                cards.shuffled[ active[ index ][0] ][1], 
                                cards.shuffled[ active[ index ][0] ][0], 
                                false 

                            );

                            // Turn down the second card (just clicked on)
                            set_next_faceup_side( cards.shuffled, active[ index ][1] );
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
