let game = new Phaser.Game(400, 380, Phaser.CANVAS, 'game-screen');
let player;
let jumpKey;
WebFontConfig = {
    active: function() {
      game.time.events.add(Phaser.Timer.SECOND, createText, this);
    },
    google: {
      families: ['Press Start 2P']
    }
};
let fontConfig = {
  font: "Press Start 2P",
  fontSize: 13,
  fill: "#306230",
  align: "center"
};

let Jumper = function () {};
Jumper.Play = function () {};
Jumper.Boot = function () {};

Jumper.Boot.prototype = {
  init: function() {
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    Phaser.Canvas.setSmoothingEnabled(game.context, false);
  },
  preload: function() {
    game.load.spritesheet('button', 'https://vgy.me/grk8du.png', 100, 100, 4);
    game.load.spritesheet('sPlayer', 'https://vgy.me/jlU05p.png', 32, 32, 2);
    game.load.spritesheet('sEnemy', 'https://vgy.me/dMN0tO.png', 32, 32, 2);
    game.load.spritesheet('sFloor', 'https://vgy.me/CiIVt1.png', 32, 32, 2);
    game.load.image('sBackground', 'https://vgy.me/m5hEwE.png');
    game.load.image('sBackdrop', 'https://vgy.me/JQVqlG.png');
    game.load.image('sPanel', 'https://vgy.me/D7ZeRl.png');
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  },
  create: function() {
    game.state.start('Play');
  }
}

Jumper.Play.prototype = {
  create: function () {
    this.midWorld = {
      x: game.width / 2,
      y: game.height / 2
    }

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 200;

    this.bgimage = game.add.sprite(this.midWorld.x, this.midWorld.y,'sBackground');
    this.bgimage.anchor.set(0.5);
    this.bgimage.scale.setTo(2,2);

    this.createPlayer(60, this.midWorld.y + 32, 'sPlayer');
    this.createFloor();
    this.createEnemy();

    jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    jumpKey.onDown.add(this.jump, this);

    this.lives = 3;
    this.score = 0;
    this.hiscore = JSON.parse(localStorage.ggtzScore) || 0;
    
    let panel = game.add.sprite(290,35,'sPanel');
    panel.anchor.set(0.5);
    
    this.scoreboard = game.add.text(this.midWorld.x, game.height * 0.05, "Score: " + this.score, fontConfig);
    this.hiscoreboard = game.add.text(this.midWorld.x, game.height * 0.1, "Hi-Score: " + this.hiscore, fontConfig);
  },
  update: function () {
    game.physics.arcade.collide(this.player, this.floor);
    game.physics.arcade.collide(this.aliveEnemy, this.floor);
    game.physics.arcade.collide(this.player, this.aliveEnemy, this.takeDamage);

    if (!this.aliveEnemy.alive) {
      this.scorePoint();
    } else {
      this.aliveEnemy.body.velocity.x = -(150 * Math.pow(1.07, this.score));
    }
  },
  // Métodos por G. Aguiar
  createPlayer: function (x = this.midWorld.x, y = this.midWorld.y + 64, sprite = 'sPlayer', anchor = 0.5) {
    this.player = game.add.sprite(x, y, sprite, 0);
    this.player.anchor.set(anchor);
    this.player.scale.setTo(2,2);
    this.player.animations.add('walk');
    this.player.animations.play('walk', 10, true);
    game.physics.arcade.enable(this.player);
  },
  createFloor: function () {
    let singleGround;

    this.floor = game.add.group();

    for (let i = 0; i < 13; i++) {
      singleGround = game.add.sprite(32 * i, this.midWorld.y + 64, 'sFloor', 0);
      game.physics.arcade.enable(singleGround);
      singleGround.body.allowGravity = false;
      singleGround.body.immovable = true;
      this.floor.add(singleGround);
    }
  },
  createEnemy: function () {
    let obstacle;

    this.obstacles = game.add.group();

    for (let i = 0; i < 2; i++) {
      obstacle = game.add.sprite (-1000,-1000,'sEnemy',i);
      obstacle.scale.setTo(1.25,1.25);
      game.physics.arcade.enable(obstacle);
      obstacle.checkWorldBounds = true;
      obstacle.outOfBoundsKill = true;
      obstacle.kill();
      this.obstacles.add(obstacle);
    }
    
    this.currentEnemyFrame = 0;
    this.spawnEnemy();
  },
  spawnEnemy: function () {
    this.aliveEnemy = this.obstacles.getFirstDead();
    this.aliveEnemy.frame = this.currentEnemyFrame;
    this.currentEnemyFrame = this.currentEnemyFrame == 0 ? 1 : 0;
    this.aliveEnemy.reset(game.width - 1, this.midWorld.y + 20);
    this.aliveEnemy.body.velocity.x = -(150 * Math.pow(1.07, this.score));
  },
  jump: function () {
    if (this.player.body.touching.down) {
      game.physics.arcade.gravity.y = 500;
      this.player.body.velocity.y = -350;
    }
  },
  takeDamage: function () {
    this.lives--;
    
    let backdrop = game.add.sprite(0,0,'sBackdrop')
    
    let button = game.add.button(200, 200, 'button', function () {
      game.state.start('Play');
      game.paused = false;
    }, this, 0, 1, 2, 3);
    button.anchor.set(0.5)
    
    let txt = game.add.text(140, 120, "GAME OVER", fontConfig);
    txt.fill = "#fff";    
    
    game.paused = true;
  },
  scorePoint: function () {
    this.score++;
    this.updateScoreboard();
    this.spawnEnemy();
  },
  updateScoreboard: function () {
    this.hiscore = this.score > this.hiscore ? this.score : this.hiscore;
    this.scoreboard.text = "Score: " + this.score;
    this.hiscoreboard.text = "Hi-Score: " + this.hiscore;
    localStorage.ggtzScore = JSON.stringify(this.hiscore);

  }
};

window.onload = function () {
  if (!localStorage.ggtzScore) {
    localStorage.ggtzScore = 0;
  }
  game.state.add('Boot', Jumper.Boot);
  game.state.add('Play', Jumper.Play);
  game.state.start('Boot');
}