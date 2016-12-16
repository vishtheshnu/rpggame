var loadState = {
    
    //create = Phaser function, called by default by Phaser when initializing
    preload: function(){
        game.load.image('player', 'res/player.png');
        
        //tileset images
        game.load.image('tiles', 'res/tiles.png');
        game.load.image('tiles', 'res/tiles_village.png');
        game.load.image('textbox', 'res/textbox.png');
        
        //Inventory/Quest/Load screen images
        game.load.image('info-back', 'res/info-back.png');
        game.load.image('highlight', 'res/highlight.png');
        game.load.image('item-back', 'res/item-back.png');
        
        //JSON Files
        game.load.json('allQuests', 'res/json/quests.json');
    },
    
    create: function(){
        //Parse Quest List JSON
        QuestDB.quests = game.cache.getJSON('allQuests');
        console.log(QuestDB.quests);
        
        //Start overworld
        game.state.start('world');
    }
}