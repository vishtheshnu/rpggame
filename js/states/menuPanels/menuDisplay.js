var menuDisplay = {
    
    container: null,
    
    panelSelected: 0,
    panels: [],
    hidden: true,
    
    create: function(){
        //Reset vars
        this.panelSelected = 0;
        this.hidden = true;
        this.panels = [];
        
        this.container = game.add.group();
        var back = game.add.sprite(game.scale.width - 320, 0, 'inventory-back');
        this.container.fixedToCamera = true;
        this.container.add(back);
        
        var self = this;
        var button = game.add.text(back.x+26, back.y+31, "O");
        button.inputEnabled = true;
        button.width = 64;
        button.height = 64;
        button.events.onInputDown.add(this.panelButtonClick(0), this);
        this.container.add(button);
        
        button = game.add.text(button.x+68, button.y, "I1");
        button.inputEnabled = true;
        button.width = 64;
        button.height = 64;
        button.events.onInputDown.add(this.panelButtonClick(1), this);
        this.container.add(button);
        
        button = game.add.text(button.x+68, button.y, "Q");
        button.inputEnabled = true;
        button.width = 64;
        button.height = 64;
        button.events.onInputDown.add(this.panelButtonClick(2), this);
        this.container.add(button);
        
        //Create Panels
        menuPanelOptions.create(back.x+35, back.y+235, 250, 450);
        menuPanelOptions.container.visible = false;
        this.panels.push(menuPanelOptions.container);
        
        menuPanelInventory.create(back.x+35, back.y+235, 250, 450);
        menuPanelInventory.container.visible = false;
        this.panels.push(menuPanelInventory.container);
        
        menuPanelQuests.create(back.x+35, back.y+235, 250, 450);
        menuPanelQuests.container.visible = false;
        this.panels.push(menuPanelQuests.container);
        
        this.hide();
    },
    
    panelButtonClick: function(index){
        var self = this;
        return function(item){
            console.log('menuDisplay panel change: '+index);
            self.setPanel(index);
        }
    },
    
    show: function(){
        this.container.visible = true;
        this.panels[this.panelSelected].visible = true;
        game.world.bringToTop(this.container);
        game.world.bringToTop(this.panels[this.panelSelected]);
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
        this.panels[this.panelSelected].visible = false;
        this.panelSelected = panel;
        this.panels[panel].visible = true;
        game.world.bringToTop(this.panels[panel]);
    },
    
}