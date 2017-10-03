var game = new Phaser.Game(1280, 720, Phaser.AUTO, ''); //previously 800, 600

InputHandler.init();

game.state.add('load', loadState);
game.state.add('battle', battleState);
game.state.add('world', worldState);
game.state.add('inventory', inventoryState);
game.state.add('quests', questState);

game.state.start('load');


