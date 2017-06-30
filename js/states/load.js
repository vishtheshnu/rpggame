var loadState = {
    
    //create = Phaser function, called by default by Phaser when initializing
    preload: function(){
        game.load.image('player', 'res/player.png');
        
        //tileset images
        game.load.image('tiles', 'res/tiles.png');
        game.load.image('tiles', 'res/tiles_village.png');
        game.load.image('mytiles', 'res/mytiles.png');
        game.load.image('textbox', 'res/textbox.png');
        
        //Inventory/Quest/Load screen images
        game.load.image('info-back', 'res/info-back.png');
        game.load.image('highlight', 'res/highlight.png');
        game.load.image('item-back', 'res/item-back.png');
        
        //NPC Images
        game.load.image('boulder', 'res/boulder.png');
        
        //JSON Files
        game.load.json('allQuests', 'res/json/quests.json');
    },
    
    create: function(){
        //Parse Quest List JSON
        QuestDB.quests = game.cache.getJSON('allQuests');
        for(var i = 0; i < QuestDB.quests.length; i++){
            QuestDB.quests[i].stage = 0;
            QuestDB.quests[i].id = i;
        }
        console.log(QuestDB.quests);
        
        //Go into fullscreen mode
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.input.onDown.add(this.gofull, this);
        var style = {align: "center", fill: "#fff", wordWrap: true, wordWrapWidth: 800/*game.scale.viewportWidth*/};
        game.add.text(0, 0, "Click to start game & go fullscreen", style);
        
        /*To actually go into fullscreen mode, make sure to switch to the 'world' state at the end of gofull*/
        
        
    },
    
    gofull: function(){
        console.log("Called gofull!");
        if (game.scale.isFullScreen)
        {
            game.scale.stopFullScreen();
        }
        else
        {
            game.scale.startFullScreen(false);
        }
        
        //Start overworld
        game.state.start('world');
        
    }
}