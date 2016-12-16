var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

InputHandler.init();

game.state.add('load', loadState);
game.state.add('battle', battleState);
game.state.add('world', worldState);
game.state.add('inventory', inventoryState);
game.state.add('quests', questState);

game.state.start('load');