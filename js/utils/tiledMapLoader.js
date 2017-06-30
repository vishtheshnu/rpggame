var tiledMapLoader = function(mapData, callback){
    this.load(mapData, callback);
}

tiledMapLoader.prototype.map = null, //previously loaded map
    
tiledMapLoader.prototype.bottom = null, //bottom layer (layer below background for added effects, optional)
tiledMapLoader.prototype.background = null, //background layer (terrain)
tiledMapLoader.prototype.foreground = null, //foreground layer (buildings, obstacles)

tiledMapLoader.prototype.tileSize = 0, //length and width of each tile
tiledMapLoader.prototype.mapWidth = 0, //how many tiles wide the map is
tiledMapLoader.prototype.mapHeight = 0, //how many tiles high the map is

tiledMapLoader.prototype.collision = [], //collision 2D array
tiledMapLoader.prototype.eventGrid = []; //event 2D array
tiledMapLoader.prototype.events = []; //event list (of events in eventGrid)
tiledMapLoader.prototype.selectEvents = [];
tiledMapLoader.prototype.npcs = [];
tiledMapLoader.prototype.npcGrid = [];

tiledMapLoader.prototype.collisionGroup = null;
tiledMapLoader.prototype.eventGroup = null;
tiledMapLoader.prototype.npcGroup = null;

/**
    Loads the map
*/
tiledMapLoader.prototype.load = function(mapData, callback){
    //load tilemap from file
    var loader = new Phaser.Loader(game);
    //loader.json(mapData.name+'-json', 'res/'+mapData.name+'.json');
    loader.tilemap(mapData.name, 'res/'+mapData.name+'.json', null, Phaser.Tilemap.TILED_JSON);
    //wait until files are loaded
    
    
    loader.onLoadComplete.addOnce(function(){
        //debugger;
        //var jmap = game.cache.getJSON(mapData.name+'-json');
        //loader.tilemap(mapData.name, null, jmap, Phaser.Tilemap.TILED_JSON);
        
        this.map = game.add.tilemap(mapData.name);
        //create tilemaps
        var tnames = mapData.tilesets;
        for(var i = 0; i < tnames.length; i++){
            this.map.addTilesetImage(tnames[i], tnames[i]);
        }
        //create tile & object layers
        this.bottom = this.map.createLayer('bottom');
        this.background = this.map.createLayer('background');
        var player = game.add.sprite(64, 64, 'player');
        game.physics.enable(player, Phaser.Physics.ARCADE);
        
        //resize world to match size of this layer (change later)
        //this.background.resizeWorld();

        var self = this;
        //add collision spaces depending on properties TODO
        $.getJSON('res/'+mapData.name+'.json', function(json){
            //fill in tile & map sizes
            self.tileSize = json.tilewidth;
            self.mapWidth = json.width;
            self.mapHeight = json.height;
            game.world.setBounds(0, 0, self.tileSize*self.mapWidth, self.tileSize*self.mapHeight);

            //get collision & events
            for(var i = 0; i < json.layers.length; i++){
                layerName = json.layers[i].name;
                if(layerName == 'collision')
                    self.collision = self._loadCollision(json.layers[i]);
                else if(layerName == 'events')
                    self._loadEvents(json.layers[i]);
                else if(layerName == 'npcs')
                    self._loadNPCs(json.layers[i]);
            }
            self.foreground = self.map.createLayer('foreground'); //loading foreground AFTER npcs
            console.log('Completed loading tilemap');
            
            //Map is loaded, call NPC preload scripts
            var npcList = self.npcGroup.children;
            for(var i = 0; i <npcList.length; i++){
                if(npcList[i].preload != undefined){
                    console.log('preloading '+npcList[i].script);
                    Scripts[npcList[i].preload](npcList[i]);
                }
            }
            
            callback(player, self);
        });
        
    }, this);
    
    loader.start();
    
}

tiledMapLoader.prototype.redrawMap = function(){
    this.bottom.moveUp();
    this.background.moveUp();
    this.foreground.moveUp();
    //this.npcGroup.moveUp();
}

tiledMapLoader.prototype.isSpaceEmpty = function(x, y){
    if(this.collision[x][y] == false && this.npcGrid[x][y] == null)
        return true;
    else
        return false;
}

/**
    Delete/remove all of the previously loaded tilemap data
*/
tiledMapLoader.prototype.delete = function(){
    console.log("Destroying tilemap!");
    this.collisionGroup.destroy();
    this.eventGroup.destroy();
    this.npcGroup.destroy();
    
    this.bottom.destroy();
    this.background.destroy();
    this.foreground.destroy();
    
    this.map.destroy();
}

/** Parse hitbox data from tilemap's collision Object Layer*/
tiledMapLoader.prototype._loadCollision = function(layer){
    //init collision group
    this.collisionGroup = game.add.group();
    this.collisionGroup.enableBody = true;
    this.collisionGroup.physicsBodyType = Phaser.Physics.ARCADE;
    
    //init collision grid
    var collisions = [];
    for(var w = 0; w < this.mapWidth; w++){
        collisions.push([])
        for(var h = 0; h < this.mapHeight; h++)
            collisions[w].push(false);
    }

    //fill collision grid
    hitboxes = layer.objects;
    for(var i = 0; i < hitboxes.length; i++){
        var box = hitboxes[i];
        
        //Add to collision group
        var spr = this.collisionGroup.create(box.x, box.y); //tiled uses same coordinate system as Phaser! :D
        spr.width = box.width;
        spr.height = box.height;
        spr.body.immovable = true;
        
        //Split into tiles
        for(var x = 0; x < box.width; x+=this.tileSize){
            for(var y = 0; y < box.height; y+=this.tileSize){
                tx = (x+box.x)/this.tileSize;
                ty = (y+box.y)/this.tileSize;
                //collisions[tx][ty] = true;
            }
        }
    }

    return collisions;
}


tiledMapLoader.prototype._loadEvents = function(layer){
    //init event group
    this.eventGroup = game.add.group();
    this.eventGroup.enableBody = true;
    this.eventGroup.physicsBodyType = Phaser.Physics.ARCADE;
    
    //init event grid
    this.events = [];
    eventGrid = [];
    for(var w = 0; w < this.mapWidth; w++){
        eventGrid.push([])
        for(var h = 0; h < this.mapHeight; h++)
            eventGrid[w].push(null);
    }

    evts = layer.objects;
    for(var i = 0; i < layer.objects.length; i++){
        var event = layer.objects[i];
        
        //Add event group
        var evtG = this.eventGroup.create(event.x, event.y);
        evtG.width = event.width;
        evtG.height = event.height;
        
        evtG.gameEventObject = {type: event.type, script: event.name, body: event};
        if(event.type == 'warp'){
            var id = event.name.split('_')[1];
            var dest = event.properties.dest.split('_');
            evtG.gameEventObject.id = id;
            evtG.gameEventObject.destinationRoom = dest[0];
            evtG.gameEventObject.destinationID = dest[1];
            delete evtG.gameEventObject.script;
        }
        
        for(var x = 0; x < event.width; x+=this.tileSize){
            for(var y = 0; y < event.height; y+=this.tileSize){
                tx = (x+event.x)/this.tileSize;
                ty = (y+event.y)/this.tileSize;
                switch(event.type){
                    case 'warp':
                        var id = event.name.split('_')[1]; //gets warp id #
                        var dest = event.properties.dest.split('_'); //room name, warp id #
                        myevt = {type: 'warp', id: id, destinationRoom: dest[0], destinationID: dest[1], x:tx, y: ty};
                        //eventGrid[tx][ty] = myevt;
                        this.events.push(myevt);
                        break;
                    
                    case 'script':
                        var myevt = {type: 'script', name: event.name};
                        //eventGrid[tx][ty] = myevt;
                        this.events.push(myevt);
                        break;
                        
                    case 'activate': //event that requires the user to select to activate
                        console.log('Activate event found and added to eventGrid!')
                        var myevt = {type: 'activate', name: event.name};
                        //eventGrid[tx][ty] = myevt;
                        this.selectEvents.push(myevt);
                        break;
                }
            }
        }
    }
    this.eventGrid = eventGrid;
    console.log(this.events);
}

tiledMapLoader.prototype._loadNPCs = function(layer){
    //init npcGroup
    this.npcGroup = game.add.group();
    this.npcGroup.enableBody = true;
    this.npcGroup.physicsBodyType = Phaser.Physics.ARCADE;
    
    //init npcGrid
    npcGrid = [];
    for(var w = 0; w < this.mapWidth; w++){
        npcGrid.push([])
        for(var h = 0; h < this.mapHeight; h++)
            npcGrid[w].push(null);
    }
    this.npcGrid = npcGrid;
    
    npcs = layer.objects;
    for(var i = 0; i < npcs.length; i++){
        var multicall = 0;
        var npc = npcs[i];
        console.log(npc);
        for(var x = 0; x < npc.width; x+=this.tileSize){ //full size of npc, should be singular
            for(var y = 0; y < npc.height; y+=this.tileSize){ //This nested loop should only ever call once if done properly
                multicall++;
                tx = (x+npc.x)/this.tileSize;
                ty = (y+npc.y)/this.tileSize;
                //name = script name
                //type = sprite name
                var spr = this.npcGroup.create(npc.x, npc.y, npc.name);
                spr.body.immovable = true;
                mynpc = {
                    sprite: spr, //game.add.sprite(npc.x, npc.y, npc.name), //make new instance of spite here
                    script: npc.type,
                    preload: npc.properties.preload,
                }
                spr.script = npc.type;
                spr.type = 'npc';
                spr.preload = npc.properties.preload;
                this.npcs.push(mynpc);
                //this.npcGrid[tx][ty] = mynpc;
            }
        }
        if(multicall > 1) console.warn("NPCs defined through multi-tile objects; this is only best done for non-sentient npcs or large groups of the same npc");
    }
}

