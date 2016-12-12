var loadState = {
    
    //create = Phaser function, called by default by Phaser when initializing
    preload: function(){
        game.load.image('player', 'res/player.png');
        
        //tileset images
        game.load.image('tiles', 'res/tiles.png');
        game.load.image('tiles', 'res/tiles_village.png');
        game.load.image('textbox', 'res/textbox.png');
    },
    
    create: function(){
        game.state.start('world');
    }
}