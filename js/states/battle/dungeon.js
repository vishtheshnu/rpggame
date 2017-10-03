/**
    Loads and generates dungeon from data
*/
var Dungeon = function(dungeonData){
    var json = game.cache.getJSON('dungeonData')[dungeonData]; //get json object for parameter dungeon
    console.log(json);
    
    this.numFloors = json.floors;
    this.tileset = json.tileset;
    
    new Floor(json.complexity[0]);
}

/*Floor object; Dungeon is made up of one or more floors*/
var Floor = function(data){
    this.rooms = [];
    this.generateRooms(data);
    console.log(this.rooms[0]);
}

Floor.prototype.generateRooms = function(data){
    var connectableRooms = [];
    
    //First room
    var startRoom = new Room(5, 5, data); //give starting room set size
    connectableRooms.push(startRoom);
    this.rooms.push(startRoom);
    var areaLeft = gaussianRandom(data.maxArea*.9, data.maxArea*1.1); //10% dist from average area
    
    while(areaLeft > 9){
        //Get next room's dimensions (between 3 and given size*2-3, w/ given size being the most common)
        var x = gaussianRandom(3, data.roomSize*2 - 3);
        var y = gaussianRandom(3, data.roomSize*2 - 3);
        if(x%2 == 0) x++; //Dimensions of room must be odd
        if(y%2 == 0) y++;
        areaLeft -= x*y;
        
        //Create room & connect it
        var nextRoom = new Room(x, y, data);
        var prevRoomIndex = Math.floor(Math.random()*connectableRooms.length);
        var prevRoom = connectableRooms[prevRoomIndex];
        var connectionSide = prevRoom.getUnconnectedSide();
        prevRoom.connectingRooms[connectionSide] = nextRoom;
        var oppositeSide = -1;
        switch(connectionSide){
            case 0: oppositeSide = 2; break;
            case 1: oppositeSide = 3; break;
            case 2: oppositeSide = 0; break;
            case 3: oppositeSide = 1; break;
        }
        nextRoom.connectingRooms[oppositeSide] = prevRoom;
        
        //If previous room is connecting to all sides, then remove from list of connectable rooms
        if(prevRoom.getUnconnectedSide() == -1)
            connectableRooms.splice(prevRoomIndex, 1);
        
        //Add new room to connectable rooms list and full room list
        connectableRooms.push(nextRoom);
        this.rooms.push(nextRoom);
    }
    
}

/*Room object; Floor is made up of one or more rooms*/
var Room = function(length, width, data){
    this.length = length;
    this.width = width;
    this.connectingRooms = [null, null, null, null]; //4 spaces, up, right, down, left (clockwise)
    this.initialEntities = [];
    for(var i = 0; i < length; i++){
        var row = [];
        for(var j = 0; j < width; j++){
            row.push(null);
        }
        this.initialEntities.push(row);
    }
    // ^ Store items, enemies, and obstacles in 2D array (null where empty space, object where entity)
    
    this.fillRoom(data);
}

/**
    Fills the room with obstacles, enemies, and items while maintaining that exits are clear.
*/
Room.prototype.fillRoom = function(data){
    //Calc # of enemies, items, and obstacles
    var numEnemies = this.length*this.width*data.enemyRate/100;
    var numItems = this.length*this.width*data.itemRate/100;
    var numObstacles = this.length*this.width*data.obstacleRate/100;
    
    //Give each of those a non-overlapping location
    for(var i = 0; i < numEnemies; i++){
        var x = Math.floor(Math.random()*this.width);
        var y = Math.floor(Math.random()*this.length);
        if(this.initialEntities[x][y] != null){
            
        }
    }
}

Room.prototype.getUnconnectedSide = function(){
    if(this.connectingRooms[0] != null && this.connectingRooms[1] != null && this.connectingRooms[2] != null && this.connectingRooms[3] != null)
        return -1;
    else{
        var index = Math.floor(Math.random()*4);
        while(this.connectingRooms[index] != null){
            index = Math.floor(Math.random()*4);
        }
        return index;
    }
}


/**
    RNG using gaussian distribution; returns random integer value between "start" and "end"
*/
function gaussianRandom(start, end){
    var gLevel = 6;
    var rand = 0;
    
    for(var i = 0; i < gLevel; i++)
        rand += Math.random();
    
    rand /= gLevel;
    
    var range = rand * (end-start+1);
    return Math.floor(start + range);
}