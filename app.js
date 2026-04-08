const GAME_W = 1280;
const GAME_H = 720;
const FLOOR_Y = 590;

const FIGHTERS = {
  court: {
    id: "court",
    name: "Court MJ",
    subtitle: "No. 23 court scorer",
    color: 0xff7a18,
    accent: 0xffb100,
    skin: 0x4c2d1f,
    speed: 320,
    jump: 760,
    health: 160,
    attack: 18,
    special: 34,
    reach: 96
  },
  stage: {
    id: "stage",
    name: "Stage MJ",
    subtitle: "Long-haired stage striker",
    color: 0x19c8bb,
    accent: 0x60a5fa,
    skin: 0xb77453,
    speed: 390,
    jump: 820,
    health: 124,
    attack: 13,
    special: 28,
    reach: 100
  }
};

const LEVELS = [
  {
    name: "Back Alley Warm-Up",
    waves: [
      ["swarm", "swarm"],
      ["guard", "swarm"],
      ["guard", "guard", "swarm"]
    ]
  },
  {
    name: "Neon Floor",
    waves: [
      ["dancer", "swarm"],
      ["drone", "dancer"],
      ["drone", "guard", "dancer"]
    ]
  },
  {
    name: "Crown Court",
    waves: [
      ["guard", "guard"],
      ["brute", "swarm"],
      ["brute", "dancer", "drone"]
    ]
  },
  {
    name: "Final Spotlight",
    boss: "boss"
  }
];

const ENEMIES = {
  swarm: { health: 28, speed: 190, damage: 10, color: 0xf97316, score: 75, size: [40, 70] },
  guard: { health: 64, speed: 110, damage: 14, color: 0xfb7185, score: 140, size: [54, 94] },
  dancer: { health: 38, speed: 210, damage: 11, color: 0x2dd4bf, score: 115, size: [42, 82] },
  drone: { health: 24, speed: 128, damage: 9, color: 0x93c5fd, score: 90, size: [42, 42], air: true },
  brute: { health: 124, speed: 78, damage: 19, color: 0xf43f5e, score: 240, size: [74, 116] },
  boss: { health: 420, speed: 130, damage: 22, color: 0xfacc15, score: 1000, size: [96, 144], boss: true }
};

function fitText(scene, text, x, y, style, origin = 0.5) {
  return scene.add.text(x, y, text, style).setOrigin(origin);
}

class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    this.load.svg("court-portrait", "assets/court-mj.svg?v=20260408-2");
    this.load.svg("stage-portrait", "assets/stage-mj.svg?v=20260408-2");
    this.load.svg("court-fighter", "assets/court-fighter.svg?v=20260408-2");
    this.load.svg("stage-fighter", "assets/stage-fighter.svg?v=20260408-2");
  }

  create() {
    this.makeTextures();
    this.scene.start("menu");
  }

  makeTextures() {
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 220, 260, 28);
    g.generateTexture("panel-card", 220, 260);

    this.makeEnemyTexture("swarm");
    this.makeEnemyTexture("guard");
    this.makeEnemyTexture("dancer");
    this.makeEnemyTexture("drone");
    this.makeEnemyTexture("brute");
    this.makeEnemyTexture("boss");

    g.destroy();
  }
  makeEnemyTexture(type) {
    const config = ENEMIES[type];
    const [w, h] = config.size;
    const g = this.add.graphics();
    g.fillStyle(config.color, 1);

    if (config.air) {
      g.fillEllipse(w / 2, h / 2, w, h * 0.74);
      g.fillStyle(0xeff8ff, 0.75);
      g.fillRect(6, h / 2 - 2, w - 12, 4);
    } else {
      g.fillCircle(w / 2, 14, type === "boss" ? 18 : 12);
      g.fillRoundedRect(w * 0.28, 24, w * 0.44, h * 0.45, 10);
      g.fillRoundedRect(w * 0.08, 42, w * 0.24, 16, 8);
      g.fillRoundedRect(w * 0.68, 42, w * 0.24, 16, 8);
      g.fillRoundedRect(w * 0.3, h * 0.45, w * 0.14, h * 0.38, 8);
      g.fillRoundedRect(w * 0.56, h * 0.45, w * 0.14, h * 0.38, 8);
    }

    g.generateTexture(`enemy-${type}`, Math.max(32, w), Math.max(32, h));
    g.destroy();
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    this.cameras.main.setBackgroundColor("#09111a");
    this.selected = "court";
    this.drawBackdrop();
    this.buildMenu();
  }

  drawBackdrop() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0e1d2c, 0x0e1d2c, 0x09111a, 0x09111a, 1);
    bg.fillRect(0, 0, GAME_W, GAME_H);
    bg.fillStyle(0x162534, 1);
    for (let i = 0; i < 12; i += 1) {
      bg.fillRect(30 + i * 110, FLOOR_Y - 120 - (i % 3) * 30, 70, 120 + (i % 3) * 30);
    }
    bg.fillStyle(0x0a121b, 1);
    bg.fillRect(0, FLOOR_Y, GAME_W, GAME_H - FLOOR_Y);
  }

  buildMenu() {
    fitText(this, "Phaser Browser Game", 80, 56, {
      fontFamily: "Space Grotesk",
      fontSize: "18px",
      color: "#e6dbc9",
      fontStyle: "700"
    }, 0);

    fitText(this, "Which MJ?", 80, 98, {
      fontFamily: "Archivo Black",
      fontSize: "68px",
      color: "#f7efe5"
    }, 0);

    fitText(this, "Pick one fighter before the run starts.", 80, 146, {
      fontFamily: "Space Grotesk",
      fontSize: "24px",
      color: "#c9beaf"
    }, 0);

    this.cards = {
      court: this.createCharacterCard(330, 360, FIGHTERS.court, "court-portrait"),
      stage: this.createCharacterCard(700, 360, FIGHTERS.stage, "stage-portrait")
    };

    this.selectionGlow = this.add.rectangle(330, 360, 250, 340)
      .setStrokeStyle(3, 0xffb100, 1)
      .setOrigin(0.5)
      .setAlpha(0.95);

    this.createStartButton();
    this.createMenuFooter();
    this.updateSelection();
  }

  createCharacterCard(x, y, fighter, texture) {
    const container = this.add.container(x, y);
    const card = this.add.rectangle(0, 0, 250, 340, 0x0d1824, 0.92)
      .setStrokeStyle(2, 0x2a3947, 1)
      .setInteractive({ useHandCursor: true });
    const portrait = this.add.image(0, -48, texture).setDisplaySize(220, 260);
    const name = fitText(this, fighter.name, 0, 116, {
      fontFamily: "Archivo Black",
      fontSize: "28px",
      color: "#f7efe5"
    });
    const sub = fitText(this, fighter.subtitle, 0, 152, {
      fontFamily: "Space Grotesk",
      fontSize: "18px",
      color: "#d1c4b4"
    });

    container.add([card, portrait, name, sub]);
    card.on("pointerdown", () => {
      this.selected = fighter.id;
      this.updateSelection();
    });
    return container;
  }

  createStartButton() {
    const button = this.add.container(GAME_W / 2, 640);
    const bg = this.add.rectangle(0, 0, 280, 68, 0xff7a18, 1)
      .setStrokeStyle(2, 0xffd3b0, 0.6)
      .setInteractive({ useHandCursor: true });
    const label = fitText(this, "Start Fight", 0, 0, {
      fontFamily: "Archivo Black",
      fontSize: "28px",
      color: "#fff7ef"
    });
    button.add([bg, label]);
    bg.on("pointerdown", () => {
      this.scene.start("fight", {
        fighter: this.selected,
        levelIndex: 0,
        score: 0
      });
    });
  }

  createMenuFooter() {
    fitText(this, "Court MJ is the heavier basketball bruiser. Stage MJ is the faster long-haired pressure fighter.", GAME_W / 2, 682, {
      fontFamily: "Space Grotesk",
      fontSize: "18px",
      color: "#c9beaf",
      align: "center"
    });
  }

  updateSelection() {
    const x = this.selected === "court" ? 330 : 700;
    this.selectionGlow.setPosition(x, 360);
    const courtActive = this.selected === "court";
    this.cards.court.first.setStrokeStyle(2, courtActive ? 0xffb100 : 0x2a3947, 1);
    this.cards.stage.first.setStrokeStyle(2, courtActive ? 0x2a3947 : 0x60a5fa, 1);
  }
}

class FightScene extends Phaser.Scene {
  constructor() {
    super("fight");
  }

  create(data) {
    this.fighterKey = data.fighter || "court";
    this.levelIndex = data.levelIndex || 0;
    this.score = data.score || 0;
    this.level = LEVELS[this.levelIndex];
    this.waveIndex = 0;
    this.attackCooldown = 0;
    this.specialCooldown = 0;
    this.touchState = { left: false, right: false };

    this.buildArena();
    this.createPlayer();
    this.createUi();
    this.createControls();
    this.spawnEncounter();
  }

  buildArena() {
    const bg = this.add.graphics();
    const colors = [
      [0x0f2032, 0x09111a],
      [0x081722, 0x0b1119],
      [0x1d0e16, 0x100912],
      [0x1a1308, 0x0c0a08]
    ][this.levelIndex] || [0x0f2032, 0x09111a];

    bg.fillGradientStyle(colors[0], colors[0], colors[1], colors[1], 1);
    bg.fillRect(0, 0, GAME_W, GAME_H);
    bg.fillStyle(0xffffff, 0.03);
    for (let i = 0; i < 12; i += 1) {
      bg.fillRect(i * 110, FLOOR_Y - 100 - (i % 4) * 28, 70, 100 + (i % 4) * 28);
    }
    bg.fillStyle(0x0a121b, 1);
    bg.fillRect(0, FLOOR_Y, GAME_W, GAME_H - FLOOR_Y);
    bg.lineStyle(2, 0xffffff, 0.08);
    bg.lineBetween(0, FLOOR_Y, GAME_W, FLOOR_Y);
  }

  createPlayer() {
    const config = FIGHTERS[this.fighterKey];
    const texture = this.fighterKey === "court" ? "court-fighter" : "stage-fighter";

    this.player = this.physics.add.sprite(170, FLOOR_Y - 110, texture)
      .setDisplaySize(132, 162)
      .setDepth(3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(72, 150);
    this.player.body.setOffset(54, 36);
    this.player.setDataEnabled();
    this.player.data.set({
      fighter: config,
      health: config.health,
      maxHealth: config.health,
      energy: 0,
      facing: 1,
      onGround: false
    });
    this.player.body.setGravityY(1700);

    if (this.fighterKey === "court") {
      this.dribbleBall = this.add.circle(this.player.x + 44, this.player.y + 6, 15, 0xd97706, 1).setDepth(4);
      this.dribbleBall.setStrokeStyle(3, 0x7c2d12, 1);
      this.dribbleCross1 = this.add.line(0, 0, -16, 0, 16, 0, 0x7c2d12, 1).setLineWidth(3).setDepth(5);
      this.dribbleCross2 = this.add.line(0, 0, 0, -16, 0, 16, 0x7c2d12, 1).setLineWidth(3).setDepth(5);
    }
  }

  createUi() {
    this.stageLabel = fitText(this, this.level.name, 34, 28, {
      fontFamily: "Archivo Black",
      fontSize: "34px",
      color: "#f7efe5"
    }, 0);

    this.waveLabel = fitText(this, this.level.boss ? "Boss" : `Wave 1 / ${this.level.waves.length}`, 34, 64, {
      fontFamily: "Space Grotesk",
      fontSize: "20px",
      color: "#d1c4b4"
    }, 0);

    this.scoreLabel = fitText(this, `Score ${this.score}`, GAME_W - 34, 32, {
      fontFamily: "Space Grotesk",
      fontSize: "24px",
      color: "#f7efe5"
    }, 1);

    this.healthBarBg = this.add.rectangle(170, 104, 260, 18, 0xffffff, 0.1).setOrigin(0, 0.5);
    this.healthBar = this.add.rectangle(170, 104, 260, 18, 0xfb7185, 1).setOrigin(0, 0.5);
    fitText(this, "Health", 34, 104, {
      fontFamily: "Space Grotesk",
      fontSize: "18px",
      color: "#e5d7c4"
    }, 0);

    this.energyBarBg = this.add.rectangle(170, 134, 260, 14, 0xffffff, 0.1).setOrigin(0, 0.5);
    this.energyBar = this.add.rectangle(170, 134, 0, 14, 0x19c8bb, 1).setOrigin(0, 0.5);
    fitText(this, "Energy", 34, 134, {
      fontFamily: "Space Grotesk",
      fontSize: "18px",
      color: "#e5d7c4"
    }, 0);
  }

  createControls() {
    this.keys = this.input.keyboard.addKeys({
      left: "A",
      right: "D",
      jump: "W",
      attack: "J",
      special: "K"
    });

    this.makeTouchButton(88, 644, 88, "Left", () => {
      this.touchState.left = true;
      this.touchState.right = false;
    }, () => { this.touchState.left = false; });
    this.makeTouchButton(196, 644, 88, "Right", () => {
      this.touchState.right = true;
      this.touchState.left = false;
    }, () => { this.touchState.right = false; });
    this.makeTouchButton(GAME_W - 196, 644, 88, "Jump", () => this.tryJump());
    this.makeTouchButton(GAME_W - 88, 644, 88, "Action", () => this.tryAttack());
    this.input.on("pointerup", () => {
      this.touchState.left = false;
      this.touchState.right = false;
    });
  }

  makeTouchButton(x, y, size, label, onStart, onEnd = () => {}) {
    const circle = this.add.circle(x, y, size / 2, 0x08131d, 0.72)
      .setStrokeStyle(2, 0xffffff, 0.12)
      .setScrollFactor(0)
      .setInteractive();
    fitText(this, label, x, y, {
      fontFamily: "Archivo Black",
      fontSize: "22px",
      color: "#fff6ec"
    });
    circle.on("pointerdown", onStart);
    circle.on("pointerup", onEnd);
    circle.on("pointerout", onEnd);
  }

  spawnEncounter() {
    this.enemies = this.physics.add.group();

    if (this.level.boss) {
      this.spawnEnemy(this.level.boss, 1010);
      return;
    }

    const wave = this.level.waves[this.waveIndex];
    wave.forEach((type, index) => {
      this.spawnEnemy(type, 890 + index * 110);
    });
  }

  spawnEnemy(type, x) {
    const config = ENEMIES[type];
    const sprite = this.enemies.create(x, config.air ? FLOOR_Y - 220 : FLOOR_Y - 60, `enemy-${type}`)
      .setDepth(3);
    sprite.setDisplaySize(config.size[0], config.size[1]);
    sprite.body.setAllowGravity(!config.air);
    if (!config.air) {
      sprite.body.setGravityY(1700);
    }
    sprite.body.setCollideWorldBounds(true);
    sprite.setDataEnabled();
    sprite.data.set({
      type,
      health: config.health,
      maxHealth: config.health,
      damage: config.damage,
      speed: config.speed,
      score: config.score,
      attackTimer: 0,
      air: Boolean(config.air),
      boss: Boolean(config.boss)
    });
  }

  update(_time, deltaMs) {
    const dt = deltaMs / 1000;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt);

    this.updateMovement();
    this.updateDribble(_time);
    this.updateEnemies(dt);
    this.updateUi();
    this.checkProgress();
  }

  updateMovement() {
    const fighter = this.player.data.get("fighter");
    const movingLeft = this.keys.left.isDown || this.touchState.left;
    const movingRight = this.keys.right.isDown || this.touchState.right;

    if (this.fighterKey === "court") {
      if (movingLeft) {
        this.player.setVelocityX(0);
      } else if (movingRight) {
        this.player.setVelocityX(fighter.speed);
      } else {
        this.player.setVelocityX(fighter.speed * 0.55);
      }
      this.player.setFlipX(false);
      this.player.data.set("facing", 1);
    } else {
      if (movingLeft) {
        this.player.setVelocityX(-fighter.speed);
        this.player.setFlipX(true);
        this.player.data.set("facing", -1);
      } else if (movingRight) {
        this.player.setVelocityX(fighter.speed);
        this.player.setFlipX(false);
        this.player.data.set("facing", 1);
      } else {
        this.player.setVelocityX(0);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
      this.tryJump();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
      this.tryAttack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special)) {
      this.trySpecial();
    }
  }

  updateDribble(time) {
    if (!this.dribbleBall) {
      return;
    }

    const speed = Math.abs(this.player.body.velocity.x);
    const moving = speed > 30;
    const bounce = moving ? Math.abs(Math.sin(time * 0.018)) : 0.15;
    const ballX = this.player.x + 46;
    const ballY = this.player.y - 4 + bounce * 38;

    this.dribbleBall.setPosition(ballX, ballY);
    this.dribbleCross1.setPosition(ballX, ballY);
    this.dribbleCross2.setPosition(ballX, ballY);
    this.dribbleBall.setVisible(true);
    this.dribbleCross1.setVisible(true);
    this.dribbleCross2.setVisible(true);
    this.dribbleBall.setAlpha(moving ? 1 : 0.8);
    this.dribbleCross1.setAlpha(moving ? 1 : 0.8);
    this.dribbleCross2.setAlpha(moving ? 1 : 0.8);
  }

  tryJump() {
    const fighter = this.player.data.get("fighter");
    if (this.player.body.blocked.down) {
      this.player.setVelocityY(-fighter.jump);
    }
  }

  tryAttack() {
    const fighter = this.player.data.get("fighter");
    const energy = this.player.data.get("energy");
    if (energy >= 100) {
      this.trySpecial();
      return;
    }
    if (this.attackCooldown > 0) {
      return;
    }

    this.attackCooldown = 0.22;
    const facing = this.player.data.get("facing");
    const hitX = this.player.x + facing * fighter.reach;
    const slash = this.add.circle(hitX, this.player.y - 46, 28, 0xffffff, 0.35).setDepth(4);
    slash.setStrokeStyle(4, 0xffffff, 0.7);
    this.tweens.add({ targets: slash, alpha: 0, scaleX: 1.7, scaleY: 1.2, duration: 120, onComplete: () => slash.destroy() });

    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) {
        return;
      }
      const distance = Phaser.Math.Distance.Between(hitX, this.player.y - 40, enemy.x, enemy.y - 20);
      if (distance < 86) {
        this.damageEnemy(enemy, fighter.attack, facing * 210);
      }
    });
  }

  trySpecial() {
    const fighter = this.player.data.get("fighter");
    const energy = this.player.data.get("energy");
    if (energy < 100 || this.specialCooldown > 0) {
      return;
    }
    this.specialCooldown = 0.7;
    this.player.data.set("energy", 0);

    const facing = this.player.data.get("facing");
    const blast = this.add.circle(this.player.x + facing * 60, this.player.y - 72, 26, fighter.accent, 0.95).setDepth(4);
    this.tweens.add({
      targets: blast,
      x: blast.x + facing * 220,
      alpha: 0,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 220,
      onComplete: () => blast.destroy()
    });

    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) {
        return;
      }
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < 240) {
        this.damageEnemy(enemy, fighter.special, facing * 320);
      }
    });
  }

  damageEnemy(enemy, amount, knockback) {
    enemy.data.values.health -= amount;
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(90, () => enemy.clearTint());
    enemy.body.velocity.x += knockback;
    this.player.data.set("energy", Math.min(100, this.player.data.get("energy") + 14));
    this.spawnFloat(`${amount}`, enemy.x, enemy.y - 70, "#fff2e8");

    if (enemy.data.values.health <= 0) {
      this.score += enemy.data.values.score;
      this.spawnFloat("KO", enemy.x, enemy.y - 110, "#fef3c7");
      enemy.destroy();
    }
  }

  damagePlayer(amount) {
    const current = Math.max(0, this.player.data.get("health") - amount);
    this.player.data.set("health", current);
    this.spawnFloat(`-${amount}`, this.player.x, this.player.y - 120, "#fecaca");
    this.player.setTintFill(0xffffff);
    this.time.delayedCall(90, () => this.player.clearTint());

    if (current <= 0) {
      this.scene.start("result", {
        win: false,
        fighter: this.fighterKey,
        score: this.score
      });
    }
  }

  updateEnemies(dt) {
    this.enemies.getChildren().forEach((enemy) => {
      const config = enemy.data.values;
      config.attackTimer = Math.max(0, config.attackTimer - dt);

      if (config.air) {
        enemy.y = FLOOR_Y - 220 + Math.sin(this.time.now * 0.004 + enemy.x * 0.01) * 26;
      }

      const dx = this.player.x - enemy.x;
      const dist = Math.abs(dx);
      const dir = Math.sign(dx || -1);

      if (config.air && dist > 140) {
        enemy.setVelocityX(dir * config.speed);
      } else if (dist > 82) {
        enemy.setVelocityX(dir * config.speed);
      } else {
        enemy.setVelocityX(0);
        if (config.attackTimer <= 0) {
          this.damagePlayer(config.damage);
          config.attackTimer = config.boss ? 0.7 : 1;
        }
      }
    });
  }

  checkProgress() {
    if (this.enemies.countActive(true) > 0) {
      return;
    }

    if (this.level.boss) {
      this.scene.start("result", {
        win: true,
        fighter: this.fighterKey,
        score: this.score
      });
      return;
    }

    if (this.waveIndex < this.level.waves.length - 1) {
      this.waveIndex += 1;
      this.waveLabel.setText(`Wave ${this.waveIndex + 1} / ${this.level.waves.length}`);
      this.spawnEncounter();
      return;
    }

    this.scene.start("fight", {
      fighter: this.fighterKey,
      levelIndex: this.levelIndex + 1,
      score: this.score
    });
  }

  spawnFloat(text, x, y, color) {
    const label = fitText(this, text, x, y, {
      fontFamily: "Archivo Black",
      fontSize: "24px",
      color
    });
    this.tweens.add({
      targets: label,
      y: y - 34,
      alpha: 0,
      duration: 480,
      onComplete: () => label.destroy()
    });
  }

  updateUi() {
    const healthRatio = this.player.data.get("health") / this.player.data.get("maxHealth");
    const energyRatio = this.player.data.get("energy") / 100;
    this.healthBar.width = 260 * Phaser.Math.Clamp(healthRatio, 0, 1);
    this.energyBar.width = 260 * Phaser.Math.Clamp(energyRatio, 0, 1);
    this.scoreLabel.setText(`Score ${this.score}`);
  }
}

class ResultScene extends Phaser.Scene {
  constructor() {
    super("result");
  }

  create(data) {
    this.cameras.main.setBackgroundColor("#09111a");
    const fighter = FIGHTERS[data.fighter || "court"];
    fitText(this, data.win ? "Run Cleared" : "Run Failed", GAME_W / 2, 170, {
      fontFamily: "Archivo Black",
      fontSize: "76px",
      color: "#f7efe5"
    });
    fitText(this, `${fighter.name} Score: ${data.score || 0}`, GAME_W / 2, 254, {
      fontFamily: "Space Grotesk",
      fontSize: "28px",
      color: "#d4c8ba"
    });

    this.add.image(GAME_W / 2, 430, fighter.id === "court" ? "court-portrait" : "stage-portrait")
      .setDisplaySize(250, 296);

    const button = this.add.container(GAME_W / 2, 628);
    const bg = this.add.rectangle(0, 0, 320, 72, fighter.color, 1)
      .setStrokeStyle(2, 0xffffff, 0.18)
      .setInteractive({ useHandCursor: true });
    const label = fitText(this, "Back To Character Select", 0, 0, {
      fontFamily: "Archivo Black",
      fontSize: "24px",
      color: "#fff8ef"
    });
    button.add([bg, label]);
    bg.on("pointerdown", () => this.scene.start("menu"));
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: GAME_W,
  height: GAME_H,
  backgroundColor: "#09111a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, FightScene, ResultScene]
};

new Phaser.Game(config);
