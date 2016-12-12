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
        this.foreground = this.map.createLayer('foreground');
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
            console.log('Completed loading tilemap');
            callback(player, self);
        });
        
    }, this);
    
    loader.start();
    
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
    this.bottom.destroy();
    this.background.destroy();
    this.foreground.destroy();
    
    this.map.destroy();
}

/** Parse hitbox data from tilemap's collision Object Layer*/
tiledMapLoader.prototype._loadCollision = function(layer){
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
        for(var x = 0; x < box.width; x+=this.tileSize){
            for(var y = 0; y < box.height; y+=this.tileSize){
                tx = (x+box.x)/this.tileSize;
                ty = (y+box.y)/this.tileSize;
                collisions[tx][ty] = true;
            }
        }
    }

    return collisions;
}


tiledMapLoader.prototype._loadEvents = function(layer){
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
        for(var x = 0; x < event.width; x+=this.tileSize){
            for(var y = 0; y < event.height; y+=this.tileSize){
                tx = (x+event.x)/this.tileSize;
                ty = (y+event.y)/this.tileSize;
                switch(event.type){
                    case 'warp':
                        var id = event.name.split('_')[1]; //gets warp id #
                        var dest = event.properties.dest.split('_'); //room name, warp id #
                        myevt = {type: 'warp', id: id, destinationRoom: dest[0], destinationID: dest[1], x:tx, y: ty};
                        eventGrid[tx][ty] = myevt;
                        this.events.push(myevt);
                        break;
                    
                    case 'script':
                        var myevt = {type: 'script', name: event.name};
                        eventGrid[tx][ty] = myevt;
                        this.events.push(myevt);
                        break;
                        
                    case 'activate': //event that requires the user to select to activate
                        console.log('Activate event found and added to eventGrid!')
                        var myevt = {type: 'activate', name: event.name};
                        eventGrid[tx][ty] = myevt;
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
    npcGrid = [];
    for(var w = 0; w < this.mapWidth; w++){
        npcGrid.push([])
        for(var h = 0; h < this.mapHeight; h++)
            npcGrid[w].push(null);
    }
    this.npcGrid = npcGrid;
    
    npcs = layer.objects;
    for(var i = 0; i < npcs.length; i++){
        var npc = npcs[i];
        for(var x = 0; x < npc.width; x+=this.tileSize){ //full size of npc, should be singular
            for(var y = 0; y < npc.height; y+=this.tileSize){
                tx = (x+npc.x)/this.tileSize;
                ty = (y+npc.y)/this.tileSize;
                //name = script name
                //type = sprite name
                mynpc = {
                    sprite: game.add.sprite(npc.x, npc.y, npc.name), //make new instance of spite here
                    script: npc.type,
                }
                this.npcs.push(mynpc);
                this.npcGrid[tx][ty] = mynpc;
            }
        }
    }
}

