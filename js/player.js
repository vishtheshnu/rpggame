/**
    Global object that stores player data (eg. inventory, stats, facing angle, etc.)
*/

var Player = {
    overworldMovementSpeed: 100,
    directionFacing: 'up',
    facing: {x: 0, y: 1},
    
    /** Returns an object that represents the vector of the direction the player is facing*/
    getFacingVector: function(){
        var x = 0; var y = 0;
        switch(this.directionFacing){
            case 'up': y = -1; break;
            case 'down': y = 1; break;
            case 'left': x = -1; break;
            case 'right': x = 1; break;
        }
        return {x: x, y: y, add: function(vec){return {x: this.x+vec.x, y: this.y+vec.y}}};
    },
    
    saveGame: function(file){
        //Serialize inventory & quests
        var inv = JSON.stringify(this.Inventory);
        var quests = JSON.stringify(this.Quests);
        localStorage.setItem(file+'-inventory', inv);
        localStorage.setItem(file+'-quests', quests);
    },
    
    loadGame: function(file){
        this.Inventory = JSON.parse(localStorage.getItem(file+'-inventory'));
        this.Quests = JSON.parse(localStorage.getItem(file+'-quests'));
    },
    
    Inventory: {
        gear: [],
        tools: [],
        resources: [],
        keyItems: [],
        
    },
    
    Quests: {
        active: [],
        completed: [],
    },
    
}