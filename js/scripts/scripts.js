/*
    Parameters for each script is the world, and the coordinates of the script object
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
    
    npcTest: function(world, x, y){ //going to act like a rock
        world.eventActive = true;
        this.world = world;
        
        var sprite = world.map.npcGrid[x][y].sprite;
        var facing = Player.getFacingVector();
        var dx = facing.x+x; var dy = facing.y+y;
        if(world.map.isSpaceEmpty(dx, dy)){
            var tween = game.add.tween(sprite);
            tween.to({x: dx*world.map.tileSize, y: dy*world.map.tileSize}, 300, null, true);
            world.map.collision[dx][dy] = true;
            this.world.map.npcGrid[dx][dy] = this.world.map.npcGrid[x][y];
            this.world.map.npcGrid[x][y] = null;
            tween.onComplete.addOnce(function(){
                this.world.map.collision[x][y] = false;
            }, this);
        }
        this._endEvent();
        //(new Dialogs.dialogNode('Hello, this is an npc!')).execute(this._endEvent);
    },
    
    _endEvent: function(){
        this.world.eventEnding = true;
    }
}