/*
    Parameters for each script is the world, and the coordinates of the script object
    For npcs, only pass in the world, and the npc sprite itself (which contains reference to position)
    
    DON'T CALL END EVENT UNTIL SCRIPT HAS EXECUTED TO COMPLETION, INCLUDING TWEENS AND ANY ACTION THAT PROGRESS AFTER CALLS TO IT HAVE BEEN MADE
*/

var Scripts = {
    world: null,
    
    room3_talkTest: function(world, x, y){
        world.eventActive = true;
        this.world = world;
        var vlong = "This sentence is to test how long I can make a dialog box! It's very long, isn't it? It should wrap around the dialog box, and hopefully "+
            "still look good. It might to over the length it's needed, so I should either add a way to automatically split up a sentence that's too long like this, "+
            "or set up some guidelines on the maximum length of a sentence. Anyway, I hope it all works well! :)";
        var small = "Short text here, not too long!"
        var c1 = new Dialogs.dialogNode("I'm sorry :( Hopefully we can make it better soon!"); c1.chain("Have a nice day!");
        var c2 = new Dialogs.dialogNode("Well I'm glad you liked it! Have a nice day!"); c2.chain("btw you're awesome!");
        var choix = {text: "What did you think of that previous sentence?", choices:[
            {text: "Sucks!", next: c1,},
            {text: "Loved it!", next: c2,},
            
        ]}
        var dlg = new Dialogs.dialogNode("Hello World! This is a dialog test!");
        dlg.chain(choix);
        dlg.execute(this._endEvent);
    },
    
    selectTest: function(world, x, y){
        world.eventActive = true;
        this.world = world;
        (new Dialogs.dialogNode('Select event test!')).execute(this._endEvent);
    },
    
    npcTest: function(world, sprite){ //going to act like a rock
        world.eventActive = true;
        this.world = world;
        
        //var sprite = world.map.npcGrid[x][y].sprite;
        var x = sprite.body.x; var y = sprite.body.y;
        var facing = Player.getFacingVector();
        var dx = facing.x*world.map.tileSize+sprite.body.x; var dy = facing.y*world.map.tileSize+sprite.body.y;
        //console.log("x, y, dx, dy = ("+x+","+y+") , ("+dx+","+dy+")");
        if(world.isSpaceEmpty(dx, dy) && !game.tweens.isTweening(sprite)){
            var tween = game.add.tween(sprite);
            tween.to({x: dx, y: dy}, 300, null, true);
            tween.onComplete.addOnce(function(){
                this._endEvent();
            }, this);
        }
    },
    
    /*Room 1*/
    
    
    
    /*Helper Functions*/
    _endEvent: function(){
        this.world.eventEnding = true;
    }
}