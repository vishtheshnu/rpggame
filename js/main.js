var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

InputHandler.init();

game.state.add('load', loadState);
game.state.add('battle', battleState);
game.state.add('world', worldState);

game.state.start('load');