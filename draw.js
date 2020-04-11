// Defines score
var score = {

    total : 0,

    current: 0

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
        
        console.log( 
            "UNSET active : index_positions", 
            cards.active.index_positions.splice( 
                cards.active.index_positions.indexOf( index_position ),
                1
            ) 
        );

        console.log( 
            "UNSET active : html_positions", 
            cards.active.html_positions.splice( 
                cards.active.html_positions.indexOf( html_position ),
                1
            ) 
        );

    } else ;

    console.log( "VAR cards.active: val i l (index)" );
    console.log( value, index_position, cards.active.index_positions );

    console.log( "VAR cards.active: val i l (html)" );
    console.log( value, html_position, cards.active.html_positions );

}

//
function get_paired_cards(){

    console.log( "fn get_paired..", cards.paired.html_position );

    return cards.paired;

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

    // Declarations

    // The DIV row of a card
    var row,
    
    // The cell the cards is located at
    cell,
    
    // An HTML element holder for the card
    e, 

    // The position in the randomized list the card is
    index_position,
    
    // Card details
    card,
    
    // Every thing needed to be throwed into the onclick event function(){}
    stuff;


    // Sets everything anew
    score.current = 0;
    cards.active.number = 0;
    cards.active.index_positions = [];
    cards.paired.index_position = [];
    cards.paired.html_position = [];

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
                var position = [];
                
                // DEBUG
                console.table( get_paired_cards() );
                console.log( get_paired_cards().index_position );

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

        start();
    
    }, 
    false 
    
    );

// DEBUG - To be left at the end of the code
console.log( "SCRIPT FULLY EXECUTED" );
