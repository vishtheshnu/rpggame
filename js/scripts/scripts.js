/*
    Parameters for each script is the world, and the coordinates of the script object
    For npcs, only pass in the world, and the npc sprite itself (which contains reference to position)
    
    DON'T CALL END EVENT UNTIL SCRIPT HAS EXECUTED TO COMPLETION, INCLUDING TWEENS AND ANY ACTION THAT PROGRESS AFTER CALLS TO IT HAVE BEEN MADE
*/

var Scripts = {
    world: null,
    
    room3_talkTest: function(world, x, y){
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
        this.world = world;
        (new Dialogs.dialogNode('Select event test!')).execute(this._endEvent);
    },
    
    npcTest: function(world, sprite){ //going to act like a rock
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
    
    /*Map 1*/
    map1_signMiddle: function(body){
        var dlg = sclib.dialog.create('Halfway there to Mr. Blue\'s house!');//new Dialogs.dialogNode('Halfway there to Mr. Blue\'s house!');
        console.log(dlg);
        
        dlg.chain({text: 'Yes or No?', choices: [
            {text: "Yes", next: new Dialogs.dialogNode('you chose yes')},
            {text: "No", next: new Dialogs.dialogNode('you chose no')},
            {text: "Maybe So", next: new Dialogs.dialogNode('you chose maybe so')},
            {text: "I don't know", next: new Dialogs.dialogNode('you chose idk')},
            {text: "wtf?", next: new Dialogs.dialogNode('you chose wtf')},
        ]});
        
        dlg.execute(sclib.endEvent);
        sclib.items.add(ItemDB.items[0]);
    },
    
    map1_signHouse: function(body){
        var dlg = sclib.dialog.create('Left: Mr. Blue\'s house');//new Dialogs.dialogNode('Left: Mr. Blue\'s house');
        dlg.chain('Down: Maze');
        dlg.execute(sclib.endEvent);
    },
    
    map1_signMaze: function(body){
        var dlg = new Dialogs.dialogNode('Follow the grass path to the maze. Be careful not to get lost!');
        dlg.chain('If you happen to mess up, leaving the maze will return everything to the way it originally was.');
        dlg.execute(sclib.endEvent);
    },
    
    /*Map 2*/
    map2_npcCorrector: function(body){
        var dlg = new Dialogs.dialogNode('Are you lost? You should\'ve just gone straight when you entered the house.');
        dlg.chain('Seriously, what are you doing in this way-off corner?');
        
        sclib.sprite.move(body, body.x+32, body.y, 500, function(){
           sclib.sprite.move(body, body.x+64, body.y, 500, function(){ //calculates based on the location of body after the above movement is completed (so moves 98 px total)
               dlg.execute(sclib.endEvent);
           });
        });
    },
    
    map2_npcRed: function(body){
        var self = this;
        var dlg = new Dialogs.dialogNode('Default dialog. This should never play!');
        
        if(!sclib.quests.isActive(0) && !sclib.quests.isComplete(0)){ //not yet started
            var dlg = new Dialogs.dialogNode({text: 'Why hello there! I\'m Mr. Red.',
                                                script: function(){
                                                    //start quest 0
                                                    console.log('starting quest 0!');
                                                    sclib.quests.start(0);
                                                }});
            
            dlg.chain('My friend, Mr. Blue, has been looking for a rare treasure, and I believe he has finally found it!')
            .chain('Could you go him and help him get it?').chain('He\'s in the house East of here. And by that, I mean \'right\'.')
            .chain({text: '...What do you mean direction is relative to where you\'re facing? His house has always been to the right!',
            });
            
        }else if(sclib.quests.isActive(0)){ //active
            var dlg = new Dialogs.dialogNode('Ok fine, Mr. Blue is to the EAST of here. Happy now?');
        }else{ //complete
            var dlg = new Dialogs.dialogNode('Thank you for helping Mr. Blue out! You have my gratitude!');
        }
        
        dlg.execute(sclib.endEvent);
    },
    
    /*Map 3*/
    map3_npcBlue: function(body){
        var self = this;
        var dlg;
        var qs = sclib.quests.getStage(0);
        
        if(sclib.quests.isActive(0)){
            if(sclib.quests.getStage(0) == 0){
                dlg = new Dialogs.dialogNode({text: 'Hi there! Mr. Red sent you, didn\'t he? Anyway, I found a treasure I think you could help me find!',
                                                 script: function(){
                                                    sclib.quests.setStage(0, 1);
                                                 }});
                dlg.chain('The treasure is in the Maze to the South.');
                }
            if(qs >= 1)
                dlg = new Dialogs.dialogNode('As I said, go to the maze in the South, or Down if you want to be like Mr. Red.');
            if(qs == 3)
                dlg = new Dialogs.dialogNode({text: 'Thank you for giving me the artifact! Have this shiny trinket!', 
                                              script: function(){
                                                  sclib.quests.setStage(0, 4);
                                                  sclib.quests.complete(0);
                                                  sclib.items.remove(sclib.items._ffValue('name', 'Treasure') ,'keyItems');
                                                  sclib.items.add({name:'Trinket', desc:'A shiny trinket given to you by Mr. Blue.'}, 'keyItems');
                                              }});
        }else{
            var dlg = new Dialogs.dialogNode({text: 'Hey, help me get the artifact in the maze to the South!',
                                                script: function(){
                                                    sclib.quests.start(0);
                                                    sclib.quests.setStage(0, 1);
                                                }});
        }
        dlg.execute(sclib.endEvent);
    },
    
    map3_bluewalk: function(body){
        if(sclib.quests.getStage(0) == 0)
            (new Dialogs.dialogNode('Well hello there! Come on in!')).execute(sclib.endEvent);
        else
            sclib.endEvent();
    },
    
    saveblock: function(body){
        var dlg = sclib.dialog.create(
            {text: 'What would you like to do?',
            choices: [
                {text: 'Save', next: sclib.dialog.create({text: 'Saving...', script: function(){Player.saveGame('testFile')}})},
                {text: 'Load', next: sclib.dialog.create({text: 'Loading...', script: function(){Player.loadGame('testFile')}})},
                {text: 'Nothing', next: sclib.dialog.create('Ok. See you later!')}
            ],
            });
        dlg.execute(sclib.endEvent);
    },
    
    /*Map 4*/
    map4_mazeEnter: function(body){
        if(sclib.quests.getStage(0) == 1)
            sclib.quests.setStage(0, 2);
        sclib.endEvent();
    },
    
    map4_boulder: function(sprite){
        /*
        var x = sprite.body.x; var y = sprite.body.y;
        var facing = Player.getFacingVector();
        var dx = facing.x*worldState.map.tileSize+sprite.body.x; var dy = facing.y*worldState.map.tileSize+sprite.body.y;
        //console.log("x, y, dx, dy = ("+x+","+y+") , ("+dx+","+dy+")");
        if(world.isSpaceEmpty(dx, dy) && !game.tweens.isTweening(sprite)){
            var tween = game.add.tween(sprite);
            tween.to({x: dx, y: dy}, 300, null, true);
            tween.onComplete.addOnce(function(){
                sclib.endEvent();
            }, this);
        }
        */
        if(!game.tweens.isTweening(sprite)){
            var x = sprite.body.x; var y = sprite.body.y;
            var facing = Player.getFacingVector();
            var dx = facing.x*worldState.map.tileSize+sprite.body.x; var dy = facing.y*worldState.map.tileSize+sprite.body.y;
            sclib.sprite.moveWithBounds(sprite, dx, dy, 200, sclib.endEvent);
        }else{
            sclib.endEvent();
        }
    },
    
    map4_treasurePreload: function(sprite){
        if(sclib.quests.isComplete(0) || sclib.quests.getStage(0) == 3){
            console.log('destroyed thing was removed: ' + worldState.map.npcGroup.remove(sprite));
            sprite.destroy();
        }
    },
    
    map4_treasure: function(body){
        var dlg;
        var qs = sclib.quests.getStage(0); //this._questStage(0);
        
        if(qs == 0){ //haven't met mr. blue yet
            dlg = new Dialogs.dialogNode('This could be the artifact Mr. Red was talking about. Better take it to Mr. Blue!');
        }else if(qs == 1 || qs == 2){ //standard find after mr blue's instructions
            dlg = new Dialogs.dialogNode('Found the artifact! Better bring it to Mr. Blue.');
        }else if(qs >= 3)
            dlg = new Dialogs.dialogNode('This dialog should not be accessible :/');
        else if(qs == -1){ //quest not assigned yet
            dlg = sclib.dialog.create({text: 'Look! Treasure! I think Mr. Blue was looking for something like this.'});
            sclib.quests.start(0);
        }
        
        sclib.items.add(ItemDB.items[2]);
        sclib.quests.setStage(0, 3);
        sclib.dialog.execute(dlg, sclib.endEvent);
        
        console.log('destroyed thing was removed: ' + worldState.map.npcGroup.remove(body));
        body.destroy();
    },
    
    /*Helper Functions*/
    /*
    _endEvent: function(){
        worldState.eventEnding = true;
    },
    
    //Assuming quest hasn't been started or completed yet
    _questStart: function(index){
        var quest = QuestDB.quests[index];
        Player.Quests.activeIndeces.push(index);
        Player.Quests.active.push(quest);
    },
    
    //Assuming quest has already been started, and not completed yet
    _questComplete: function(index){
        var ind = Player.Quests.activeIndeces.indexOf(index);
        if(ind != -1){
            Player.Quests.activeIndeces.splice(ind, 1);
            Player.Quests.active.splice(ind, 1);
        }
    },
        
    _questStage: function(index){
        var ind = Player.Quests.activeIndeces.indexOf(index);
        if(ind != -1)
            return Player.Quests.active[ind].stage;
        else{
            console.warn('Quest of index '+index+' not active. Returning null');
            return -1;
        }
    },
    
    _questSetStage: function(index, step){
        Player.Quests.active[Player.Quests.activeIndeces.indexOf(index)].stage = step;
    },
    
    _isQuestActive: function(index){
        var ind = Player.Quests.activeIndeces.indexOf(index);
        if(ind != -1){
            return true;
        }else{
            return false;
        }
    },
    
    _isQuestComplete: function(index){
        var ind = Player.Quests.completedIndeces.indexOf(index);
        if(ind != -1){
            return true;
        }else{
            return false;
        }
    },
    */
}

/**
    Helper object for writing scripts
*/
var sclib = {
    
    /*Quests*/
    quests: {
        
        start: function(index){
            var quest = QuestDB.quests[index];
            Player.Quests.activeIndeces.push(index);
            Player.Quests.active.push(quest);
            menuPanelQuests.refresh();
            worldState.setQuestText("Quest Start", quest);
        },
        
        complete: function(index){
            var ind = Player.Quests.activeIndeces.indexOf(index);
            if(ind != -1){
                Player.Quests.completedIndeces.push(ind.id);
                Player.Quests.completed.push(Player.Quests.active[ind]);
                
                Player.Quests.activeIndeces.splice(ind, 1);
                Player.Quests.active.splice(ind, 1);
            }
            menuPanelQuests.refresh();
        },
        getStage: function(index){
            var ind = Player.Quests.activeIndeces.indexOf(index);
            if(ind != -1)
                return Player.Quests.active[ind].stage;
            else{
                console.warn('Quest of index '+index+' not active. Returning null');
                return -1;
            }
        },
        
        setStage: function(index, step){
            var quest = Player.Quests.active[Player.Quests.activeIndeces.indexOf(index)];
            quest.stage = step;
            menuPanelQuests.refresh();
            worldState.setQuestText("Quest Update", quest);
        },

        isActive: function(index){
            var ind = Player.Quests.activeIndeces.indexOf(index);
            if(ind != -1){
                return true;
            }else{
                return false;
            }
        },

        isComplete: function(index){
            var ind = Player.Quests.completedIndeces.indexOf(index);
            if(ind != -1){
                return true;
            }else{
                return false;
            }
        },
        
    },
    
    items: {
        /*Adds item to inventory.
        item- item object to add (acquireable from ItemDB.items list)
        Returns: boolean value on whether item was addable to inventory. Returns true if successful, false if no space*/
        add: function(item){
            for(var i = 0; i < Player.Inventory.maxSize; i++){
                if(Player.Inventory.items[i] == null){
                    Player.Inventory.items[i] = item;
                    menuPanelInventory.refreshInventory();
                    return true;
                }
            }
            
            return false;
        },
        
        /*
        Returns the index of the parameter item inside the player's inventory. Returns -1 if not found
        item- The item to search for, compares by using '=='
        */
        find: function(item){
            for(var i = 0; i < Player.Inventory.maxSize; i++){
                if(Player.Inventory.items[i] == item)
                    return i;
            }
            return -1;
        },
        
        /*
        Find an item inside the parameter category that fulfills the parameter search function.
        func- search function; should take parameter object (item) and return true if the item being looked for is passed in, false otherwise.
        
        returns the object found,otherwise returns null
        */
        findByFunction: function(func){
            for(var i = 0; i < Player.Inventory.maxSize; i++){
                if(func(Player.Inventory.items[i]))
                    return Player.Inventory.items[i];
            }
            return null;
        },
        
        /*Removes an item based on its index*/
        remove: function(index){
            var toret = Player.Inventory.items[index];
            Player.Inventory.items[index] = null;
            menuPanelInventory.refreshInventory();
            return toret;
        },
        
        /**
        Finds and removes an item that fulfills the parameter search function.
        Same parameters and workings as findByFunction(), but removes the object instead of *just* returning it.
        Returns deleted object if found, null otherwise.
        */
        removeByFunction: function(func){
            for(var i = 0; i < Player.Inventory.maxSize; i++){
                if(func(Player.Inventory.items[i])){
                    var toret = Player.Inventory.items[i];
                    Player.Inventory.items[i] = null;
                    menuPanelInventory.refreshInventory();
                    return toret;
                }
            }
            return null;
        },
        
        /**
        Returns template find function for find().
        field- The field of the object in items to search for.
        value- The value of the field to search for; function will return true if field & value match
        */
        _ffValue: function(field, value){
            return function(item){
                return item[field] == value;
            }
        },
    },
    
    /*Dialogs*/
    dialog: {
        create: function(obj){
            return new Dialogs.dialogNode(obj);
        },
        
        execute: function(dialog, cb){
            if(cb != undefined)
                dialog.execute(cb);
            else
                dialog.execute(sclib.endEvent);
        }
    },
    
    sprite: {
        /*Move sprite to (x,y) in speed milliseconds if it doesn't collide with anything in the world.
        Call callback after movement completed, or immediately if there is no movement. Returns movement
        tween if moving, null otherwise.*/
        moveWithBounds: function(sprite, x, y, speed, callback){
            //check if location x,y doesn't intersect with player, collisions, or npcs
            ox = sprite.x; oy = sprite.y;
            sprite.x = x; sprite.y = y;
            sprite.body.x = x; sprite.body.y = y;
            var collision = false;
            game.physics.arcade.collide(sprite, worldState.player, function(a, b){
                if(a != b) collision = true;
            }, null, this);
            game.physics.arcade.collide(sprite, worldState.map.npcGroup, function(a, b){
                if(a != b) collision = true;
            }, null, this);
            game.physics.arcade.collide(sprite, worldState.map.collisionGroup, function(a, b){
                if(a != b) collision = true;
            }, null, this);
            
            sprite.x = ox; sprite.y = oy;
            sprite.body.x = ox; sprite.body.y = oy;
            
            //no collision, start moving!
            if(!collision){
                return this.move(sprite, x, y, speed, callback);
            }else{
                callback();
                return null;
            }
        },
        
        /*Move sprite to (x,y) in "speed" milliseconds. Performs callback after movement complete.
        Returns the tween used to move the sprite for chaining.*/
        move: function(sprite, x, y, speed, callback){
            var tween = game.add.tween(sprite);
            tween.to({x: x, y: y}, speed, null, true);
            tween.onComplete.addOnce(function(){
                callback();//sclib.endEvent();
            }, this);
            return tween;
        },
    },
    
    /*Ending the event.*/
    endEvent: function(){
        worldState.eventEnding = true;
    }
    
}