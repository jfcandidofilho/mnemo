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
    card;


    // Sets everything anew
    score.current = 0;
    cards.active.number = 0;
    cards.active.index_positions = [];
    cards.paired.index_position = [];
    cards.paired.html_position = [];

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
