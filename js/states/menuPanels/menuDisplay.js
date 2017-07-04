var menuDisplay = {
    
    container: null,
    
    panelSelected: 0,
    panels: [],
    hidden: true,
    
    create: function(){
        this.container = game.add.group();
        var back = game.add.sprite(game.scale.width - 350, 10, 'inventory-back');
        this.container.fixedToCamera = true;
        this.container.add(back);
        
        var self = this;
        var button = game.add.text(back.x+16, back.y+16, "O");
        button.inputEnabled = true;
        button.width = 64;
        button.height = 64;
        button.events.onInputDown.add(this.panelButtonClick(0), this);
        this.container.add(button);
        
        button = game.add.text(button.x+68+16, button.y+16, "I1");
        button.inputEnabled = true;
        button.width = 64;
        button.height = 64;
        button.events.onInputDown.add(this.panelButtonClick(1), this);
        this.container.add(button);
        
        //Create Panels
        menuPanelOptions.create(back.x+22, back.y+102, 256, 576);
        this.panels.push(menuPanelOptions.container);
        
        menuPanelInventory.create(back.x+22, back.y+102, 256, 576);
        this.panels.push(menuPanelInventory.container);
        
        this.hide();
    },
    
    panelButtonClick: function(index){
        var self = this;
        return function(item){
            console.log('clicked options button, index '+index);
            //if(self.panelSelected != index){
                self.setPanel(index);
            //}
        }
    },
    
    show: function(){
        this.container.visible = true;
        this.panels[this.panelSelected].visible = true;
        game.world.bringToTop(this.container);
    },
    
    hide: function(){
        this.container.visible = false;
        this.panels[this.panelSelected].visible = false;
    },
    
    toggle: function(){
        if(this.hidden)
            this.show();
        else
            this.hide();
        
        this.hidden = !this.hidden;
    },
    
    setPanel: function(panel){
        console.log("calling setPanel; changing from "+this.panelSelected+" to "+panel);
        this.panels[this.panelSelected].visible = false;
        this.panelSelected = panel;
        this.panels[panel].visible = true;
        game.world.bringToTop(this.panels[panel]);
    },
    
}