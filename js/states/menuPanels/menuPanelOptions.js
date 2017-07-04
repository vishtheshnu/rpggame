var menuPanelOptions = {
    container: null,
    fs: null,
    
    /*
        Called by menuDisplay to create the group that represents the options menu.
        Parameters: coordinates & dimensions of the internal panel where this will be displayed
        Returns: Phaser group that contains the UI elements that make up the options menu
    */
    create: function(x, y, width, height){
        this.container = game.add.group();
        this.container.fixedToCamera = true;
        
        //fullscreen button
        var fs = game.add.text(x+10, y+10, "Toggle Fullscreen", {align: "center"}, this.container);
        fs.inputEnabled = true;
        fs.setTextBounds(0, 0, width-20, height-20);
        fs.events.onInputUp.add(this.gofull, this);
        //this.container.add(fs);
        this.fs = fs;
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
        
    }
    
}