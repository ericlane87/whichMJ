const stages = [
  {
    name: "Tunnel Warm-Up",
    note: "Swarmers rush in low. Shield guards force spacing. This stage teaches movement and timing.",
    notes: [
      "Recommended MJ: either one works here.",
      "Enemies arrive in short waves so the player can learn.",
      "Stage clear condition: survive all three waves."
    ],
    waves: [
      [{ type: "swarm", x: 820 }, { type: "swarm", x: 920 }],
      [{ type: "swarm", x: 780 }, { type: "guard", x: 920 }],
      [{ type: "guard", x: 820 }, { type: "swarm", x: 920 }, { type: "swarm", x: 1000 }]
    ]
  },
  {
    name: "Neon Floor",
    note: "Fast movers and ranged pressure test whether your MJ choice matches the stage rhythm.",
    notes: [
      "Recommended MJ: Stage MJ has an easier time controlling speed.",
      "Ranged paparazzi drones punish straight-line movement.",
      "Use dodge invulnerability to break pressure."
    ],
    waves: [
      [{ type: "dancer", x: 820 }, { type: "swarm", x: 940 }],
      [{ type: "drone", x: 850 }, { type: "dancer", x: 940 }],
      [{ type: "drone", x: 800 }, { type: "dancer", x: 910 }, { type: "swarm", x: 1000 }]
    ]
  },
  {
    name: "Crown Court",
    note: "Heavy enemies and mixed patterns make this the hardest standard stage before the boss.",
    notes: [
      "Recommended MJ: Court MJ can break armor more cleanly.",
      "Large enemies absorb weak hits and punish greedy combos.",
      "Meter management matters more than pure speed here."
    ],
    waves: [
      [{ type: "guard", x: 820 }, { type: "guard", x: 940 }],
      [{ type: "brute", x: 880 }, { type: "swarm", x: 1000 }],
      [{ type: "brute", x: 820 }, { type: "dancer", x: 930 }, { type: "drone", x: 1040 }]
    ]
  },
  {
    name: "Final Spotlight",
    note: "A combined-style boss uses rhythm feints and aerial pressure. Commit to your MJ and finish the run.",
    notes: [
      "Boss stage: no standard waves.",
      "Learn the boss wind-up before spending your special.",
      "The arena gets brighter as the fight escalates."
    ],
    boss: { type: "boss", x: 860 }
  }
];

const characters = {
  court: {
    name: "Court MJ",
    color: "#ff7a18",
    accent: "#ffb100",
    skin: "#5c3422",
    hair: null,
    outfit: "#f7f0e8",
    speed: 300,
    jump: 690,
    health: 135,
    attackDamage: 18,
    specialDamage: 28,
    attackReach: 74,
    attackTime: 0.2,
    energyGain: 12,
    dodgeSpeed: 500,
    description: "Heavy-impact style with stronger armor, bigger hits, and a fast ball special."
  },
  stage: {
    name: "Stage MJ",
    color: "#13c7b9",
    accent: "#60a5fa",
    skin: "#b97352",
    hair: "#121212",
    outfit: "#f4f5f7",
    speed: 355,
    jump: 720,
    health: 112,
    attackDamage: 13,
    specialDamage: 24,
    attackReach: 84,
    attackTime: 0.14,
    energyGain: 14,
    dodgeSpeed: 620,
    description: "Fast, evasive style with smoother mobility, better combo flow, and a rhythm burst special."
  }
};

let canvas;
let ctx;

let stageNameEl;
let briefTitleEl;
let briefTextEl;
let stageNotesEl;
let healthFillEl;
let energyFillEl;
let scoreValueEl;
let waveValueEl;
let overlayEl;
let overlayEyebrowEl;
let overlayTitleEl;
let overlayTextEl;
let overlayButtonEl;
let startButtonEl;
let characterButtons = [];
let touchButtons = [];

const world = {
  width: 960,
  height: 540,
  floorY: 432,
  gravity: 1800
};

const input = {
  left: false,
  right: false,
  jumpQueued: false,
  attackQueued: false,
  dodgeQueued: false
};

const tapState = {
  leftLastTap: 0,
  rightLastTap: 0
};

const state = {
  selectedCharacter: "court",
  screen: "menu",
  stageIndex: 0,
  waveIndex: 0,
  stageStartedAt: 0,
  score: 0,
  player: null,
  enemies: [],
  projectiles: [],
  effects: [],
  cameraShake: 0,
  lastTime: 0
};

function createPlayer(type) {
  const kit = characters[type];
  return {
    type,
    x: 160,
    y: world.floorY,
    vx: 0,
    vy: 0,
    width: 44,
    height: 92,
    facing: 1,
    onGround: true,
    health: kit.health,
    maxHealth: kit.health,
    energy: 0,
    maxEnergy: 100,
    attackTimer: 0,
    specialTimer: 0,
    dodgeTimer: 0,
    hitTimer: 0,
    invulnTimer: 0,
    combo: 0,
    canDoubleJump: type === "stage"
  };
}

function createEnemy(type, x) {
  const configs = {
    swarm: { health: 26, speed: 170, width: 34, height: 58, damage: 10, color: "#f97316", score: 60 },
    guard: { health: 64, speed: 92, width: 44, height: 84, damage: 14, color: "#fb7185", score: 120 },
    drone: { health: 22, speed: 106, width: 34, height: 34, damage: 8, color: "#93c5fd", score: 80, flying: true, cooldown: 1.6 },
    dancer: { health: 34, speed: 210, width: 38, height: 72, damage: 11, color: "#2dd4bf", score: 90 },
    brute: { health: 110, speed: 74, width: 62, height: 102, damage: 18, color: "#f43f5e", score: 200 },
    boss: { health: 280, speed: 126, width: 78, height: 124, damage: 22, color: "#facc15", score: 800, cooldown: 1.2, boss: true }
  };

  const config = configs[type];
  return {
    type,
    x,
    y: config.flying ? 250 : world.floorY,
    baseY: config.flying ? 250 : world.floorY,
    vx: 0,
    vy: 0,
    width: config.width,
    height: config.height,
    health: config.health,
    maxHealth: config.health,
    speed: config.speed,
    damage: config.damage,
    color: config.color,
    score: config.score,
    hitTimer: 0,
    attackTimer: 0,
    cooldown: config.cooldown || 0.85,
    flying: Boolean(config.flying),
    boss: Boolean(config.boss),
    phase: 0
  };
}

function startRun() {
  state.screen = "playing";
  state.stageIndex = 0;
  state.waveIndex = 0;
  state.score = 0;
  state.player = createPlayer(state.selectedCharacter);
  state.enemies = [];
  state.projectiles = [];
  state.effects = [];
  state.stageStartedAt = performance.now();
  updateStageBrief();
  spawnCurrentEncounter();
  hideOverlay();
  updateHud();
}

function showMenu() {
  state.screen = "menu";
  state.stageIndex = 0;
  state.waveIndex = 0;
  state.score = 0;
  state.player = createPlayer(state.selectedCharacter);
  state.player.x = 270;
  state.player.energy = 20;
  state.player.facing = 1;
  state.enemies = [
    createEnemy("guard", 760),
    createEnemy("dancer", 860)
  ];
  state.projectiles = [];
  state.effects = [];
  updateStageBrief();
  stageNameEl.textContent = "Character Select";
  briefTitleEl.textContent = "Pick One Fighter";
  briefTextEl.textContent = "Choose your MJ first. Court MJ is the stronger bruiser. Stage MJ is the quicker pressure fighter.";
  stageNotesEl.innerHTML = "";
  [
    "Court MJ: bald, darker-skinned, heavier build.",
    "Stage MJ: slimmer, lighter-skinned, long-haired.",
    "Tap Start Fight after you choose."
  ].forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    stageNotesEl.appendChild(item);
  });
  waveValueEl.textContent = "Menu";
  showOverlay(
    "Character Select",
    "Pick Your MJ",
    "Pick one MJ, then hit Start Fight.",
    "Start"
  );
  updateHud();
}

function updateStageBrief() {
  const stage = stages[state.stageIndex];
  stageNameEl.textContent = stage.name;
  briefTitleEl.textContent = stage.name;
  briefTextEl.textContent = stage.note;
  stageNotesEl.innerHTML = "";
  stage.notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    stageNotesEl.appendChild(item);
  });
  waveValueEl.textContent = stage.boss
    ? "Boss Stage"
    : `Wave ${Math.min(state.waveIndex + 1, stage.waves.length)} / ${stage.waves.length}`;
}

function spawnCurrentEncounter() {
  const stage = stages[state.stageIndex];
  state.enemies = [];
  state.projectiles = [];

  if (stage.boss) {
    state.enemies.push(createEnemy(stage.boss.type, stage.boss.x));
    return;
  }

  const wave = stage.waves[state.waveIndex];
  wave.forEach((enemy) => {
    state.enemies.push(createEnemy(enemy.type, enemy.x));
  });
}

function queueStageTransition() {
  if (state.stageIndex >= stages.length - 1) {
    state.screen = "victory";
    showOverlay(
      "Run Cleared",
      "You picked the right MJ and beat the full action build.",
      `Final score: ${state.score}. Court MJ plays like a bruiser. Stage MJ plays like a stylish pressure fighter.`,
      "Play Again"
    );
    return;
  }

  state.stageIndex += 1;
  state.waveIndex = 0;
  updateStageBrief();
  spawnCurrentEncounter();
  state.player.x = 160;
  state.player.y = world.floorY;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.energy = Math.min(state.player.energy + 22, state.player.maxEnergy);

  showOverlay(
    "Stage Clear",
    stages[state.stageIndex].name,
    stages[state.stageIndex].note,
    "Continue"
  );
  state.screen = "intermission";
}

function advanceEncounter() {
  const stage = stages[state.stageIndex];

  if (stage.boss) {
    queueStageTransition();
    return;
  }

  if (state.waveIndex < stage.waves.length - 1) {
    state.waveIndex += 1;
    waveValueEl.textContent = `Wave ${state.waveIndex + 1} / ${stage.waves.length}`;
    spawnCurrentEncounter();
    spawnEffect(state.player.x + 120, world.floorY - 20, "Wave In", "#ffffff");
    return;
  }

  queueStageTransition();
}

function showOverlay(eyebrow, title, text, buttonLabel) {
  overlayEyebrowEl.textContent = eyebrow;
  overlayTitleEl.textContent = title;
  overlayTextEl.textContent = text;
  overlayButtonEl.textContent = buttonLabel;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function continueFromOverlay() {
  if (state.screen === "victory" || state.screen === "gameover") {
    startRun();
    return;
  }

  if (state.screen === "menu") {
    startRun();
    return;
  }

  if (state.screen === "intermission") {
    state.screen = "playing";
    hideOverlay();
  }
}

function spawnEffect(x, y, text, color) {
  state.effects.push({ x, y, text, color, life: 0.75 });
}

function spawnProjectile(source, kind) {
  if (source === "player") {
    const facing = state.player.facing;
    const config = characters[state.player.type];

    if (state.player.type === "court") {
      state.projectiles.push({
        owner: "player",
        kind,
        x: state.player.x + facing * 28,
        y: state.player.y - 48,
        vx: 560 * facing,
        vy: -120,
        radius: 12,
        damage: config.specialDamage,
        color: config.accent,
        life: 1.15
      });
    } else {
      state.projectiles.push({
        owner: "player",
        kind,
        x: state.player.x + facing * 22,
        y: state.player.y - 52,
        vx: 420 * facing,
        vy: 0,
        radius: 18,
        damage: config.specialDamage,
        color: config.accent,
        life: 0.5,
        pulse: true
      });
    }

    state.player.energy = 0;
    state.player.specialTimer = 0.36;
    state.cameraShake = 10;
    return;
  }

  const enemy = source;
  state.projectiles.push({
    owner: "enemy",
    kind,
    x: enemy.x - 12,
    y: enemy.y - enemy.height * 0.6,
    vx: -280,
    vy: 0,
    radius: enemy.boss ? 16 : 10,
    damage: enemy.boss ? 18 : 9,
    color: enemy.color,
    life: enemy.boss ? 1.4 : 1
  });
}

function updatePlayer(dt) {
  const player = state.player;
  if (!player) {
    return;
  }
  const kit = characters[player.type];

  if (player.invulnTimer > 0) {
    player.invulnTimer -= dt;
  }
  if (player.hitTimer > 0) {
    player.hitTimer -= dt;
  }
  if (player.attackTimer > 0) {
    player.attackTimer -= dt;
  }
  if (player.specialTimer > 0) {
    player.specialTimer -= dt;
  }
  if (player.dodgeTimer > 0) {
    player.dodgeTimer -= dt;
    player.invulnTimer = Math.max(player.invulnTimer, 0.08);
  }

  const moveDir = (input.left ? -1 : 0) + (input.right ? 1 : 0);

  if (moveDir !== 0) {
    player.facing = moveDir;
  }

  if (player.dodgeTimer > 0) {
    player.vx = kit.dodgeSpeed * player.facing;
  } else {
    player.vx = moveDir * kit.speed;
  }

  if (input.jumpQueued) {
    if (player.onGround) {
      player.vy = -kit.jump;
      player.onGround = false;
    } else if (player.type === "stage" && player.canDoubleJump) {
      player.vy = -kit.jump * 0.92;
      player.canDoubleJump = false;
      spawnEffect(player.x, player.y - 70, "Double", kit.accent);
    }
    input.jumpQueued = false;
  }

  if (input.attackQueued && player.attackTimer <= 0 && player.specialTimer <= 0) {
    if (player.energy >= player.maxEnergy) {
      spawnProjectile("player", "special");
    } else {
      player.attackTimer = kit.attackTime;
      player.combo = Math.min(player.combo + 1, 5);
      attackEnemies();
    }
    input.attackQueued = false;
  }

  if (input.dodgeQueued && player.dodgeTimer <= 0) {
    player.dodgeTimer = 0.18;
    player.invulnTimer = 0.22;
    input.dodgeQueued = false;
  }

  player.vy += world.gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  if (player.y >= world.floorY) {
    player.y = world.floorY;
    player.vy = 0;
    player.onGround = true;
    player.canDoubleJump = player.type === "stage";
  }

  player.x = clamp(player.x, 44, world.width - 44);
}

function attackEnemies() {
  const player = state.player;
  const kit = characters[player.type];
  let hits = 0;

  state.enemies.forEach((enemy) => {
    const dx = enemy.x - player.x;
    const closeEnough = Math.abs(dx) <= kit.attackReach && Math.abs(enemy.y - player.y) < 110;
    const inFront = Math.sign(dx || 1) === player.facing || Math.abs(dx) < 18;

    if (closeEnough && inFront) {
      const damage = kit.attackDamage + player.combo * (player.type === "stage" ? 1.5 : 1);
      damageEnemy(enemy, damage, player.facing * (player.type === "court" ? 180 : 120));
      hits += 1;
    }
  });

  if (hits > 0) {
    state.player.energy = Math.min(player.maxEnergy, player.energy + kit.energyGain * hits);
    spawnEffect(player.x + player.facing * 44, player.y - 80, `x${hits}`, kit.accent);
    state.cameraShake = Math.max(state.cameraShake, player.type === "court" ? 8 : 5);
  } else {
    player.combo = Math.max(player.combo - 1, 0);
  }
}

function damageEnemy(enemy, damage, knockback) {
  enemy.health -= damage;
  enemy.hitTimer = 0.16;
  enemy.vx += knockback;
  spawnEffect(enemy.x, enemy.y - enemy.height, `${Math.round(damage)}`, enemy.color);

  if (enemy.health <= 0) {
    state.score += enemy.score;
    spawnEffect(enemy.x, enemy.y - enemy.height, "KO", "#fff7ed");
  }
}

function damagePlayer(amount) {
  const player = state.player;
  if (player.invulnTimer > 0) {
    return;
  }

  player.health -= amount;
  player.hitTimer = 0.22;
  player.invulnTimer = 0.4;
  player.combo = 0;
  state.cameraShake = Math.max(state.cameraShake, 9);
  spawnEffect(player.x, player.y - 86, `-${amount}`, "#fecaca");

  if (player.health <= 0) {
    player.health = 0;
    state.screen = "gameover";
    showOverlay(
      "Run Down",
      "Your MJ got overwhelmed.",
      `Final score: ${state.score}. Try the other MJ if this stage matchup felt rough.`,
      "Retry Run"
    );
  }
}

function updateEnemies(dt, time) {
  const player = state.player;

  state.enemies.forEach((enemy) => {
    if (enemy.hitTimer > 0) {
      enemy.hitTimer -= dt;
    }
    if (enemy.attackTimer > 0) {
      enemy.attackTimer -= dt;
    }

    if (enemy.flying) {
      enemy.y = enemy.baseY + Math.sin(time * 0.003 + enemy.x * 0.01) * 24;
    }

    const dx = player.x - enemy.x;
    const distance = Math.abs(dx);
    const direction = Math.sign(dx || -1);

    if (enemy.type === "drone" || (enemy.boss && distance > 240)) {
      enemy.vx = direction * enemy.speed * 0.5;
      if (enemy.attackTimer <= 0) {
        spawnProjectile(enemy, enemy.boss ? "boss-burst" : "flash");
        enemy.attackTimer = enemy.cooldown;
      }
    } else if (distance > 68) {
      enemy.vx = direction * enemy.speed;
    } else {
      enemy.vx *= 0.86;
      if (enemy.attackTimer <= 0) {
        damagePlayer(enemy.damage);
        enemy.attackTimer = enemy.boss ? 0.72 : enemy.cooldown;
      }
    }

    if (enemy.boss && enemy.health < enemy.maxHealth * 0.5) {
      enemy.speed = 160;
      enemy.cooldown = 0.82;
      enemy.phase = 1;
    }

    enemy.x += enemy.vx * dt;
    enemy.x = clamp(enemy.x, 28, world.width - 28);
  });

  state.enemies = state.enemies.filter((enemy) => enemy.health > 0);

  if (state.screen === "playing" && state.enemies.length === 0) {
    advanceEncounter();
  }
}

function updateProjectiles(dt) {
  state.projectiles.forEach((projectile) => {
    projectile.life -= dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy += projectile.owner === "player" && !projectile.pulse ? 420 * dt : 0;

    if (projectile.owner === "player") {
      state.enemies.forEach((enemy) => {
        if (projectile.life <= 0) {
          return;
        }
        const dx = enemy.x - projectile.x;
        const dy = (enemy.y - enemy.height * 0.6) - projectile.y;
        const radius = projectile.radius + enemy.width * 0.4;

        if (dx * dx + dy * dy <= radius * radius) {
          damageEnemy(enemy, projectile.damage, projectile.vx > 0 ? 220 : -220);
          projectile.life = 0;
          state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 6);
        }
      });
    } else {
      const player = state.player;
      const dx = player.x - projectile.x;
      const dy = (player.y - player.height * 0.55) - projectile.y;
      const radius = projectile.radius + player.width * 0.4;
      if (dx * dx + dy * dy <= radius * radius) {
        damagePlayer(projectile.damage);
        projectile.life = 0;
      }
    }
  });

  state.projectiles = state.projectiles.filter((projectile) => {
    return projectile.life > 0 &&
      projectile.x > -60 &&
      projectile.x < world.width + 60 &&
      projectile.y > -80 &&
      projectile.y < world.height + 80;
  });
}

function updateEffects(dt) {
  state.effects.forEach((effect) => {
    effect.life -= dt;
    effect.y -= 34 * dt;
  });
  state.effects = state.effects.filter((effect) => effect.life > 0);
}

function updateHud() {
  if (!state.player) {
    return;
  }
  healthFillEl.style.width = `${(state.player.health / state.player.maxHealth) * 100}%`;
  energyFillEl.style.width = `${(state.player.energy / state.player.maxEnergy) * 100}%`;
  scoreValueEl.textContent = `Score ${state.score}`;
}

function updateSelectionUi() {
  characterButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.character === state.selectedCharacter);
  });
}

function update(dt, time) {
  if (state.screen === "menu") {
    updateEffects(dt);
    updateHud();
    return;
  }

  if (state.screen !== "playing") {
    updateEffects(dt);
    updateHud();
    return;
  }

  updatePlayer(dt);
  updateEnemies(dt, time);
  updateProjectiles(dt);
  updateEffects(dt);
  updateHud();

  if (state.cameraShake > 0) {
    state.cameraShake = Math.max(0, state.cameraShake - dt * 28);
  }
}

function drawBackground(time) {
  const stage = stages[state.stageIndex];
  const gradient = ctx.createLinearGradient(0, 0, 0, world.height);

  if (stage.name === "Neon Floor") {
    gradient.addColorStop(0, "#081521");
    gradient.addColorStop(0.6, "#15253c");
    gradient.addColorStop(1, "#050a10");
  } else if (stage.name === "Crown Court") {
    gradient.addColorStop(0, "#201014");
    gradient.addColorStop(0.55, "#2b1824");
    gradient.addColorStop(1, "#120b11");
  } else if (stage.name === "Final Spotlight") {
    gradient.addColorStop(0, "#191308");
    gradient.addColorStop(0.55, "#26190b");
    gradient.addColorStop(1, "#09080c");
  } else {
    gradient.addColorStop(0, "#0d2032");
    gradient.addColorStop(0.6, "#122638");
    gradient.addColorStop(1, "#08111a");
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);

  for (let i = 0; i < 5; i += 1) {
    const pulse = 0.35 + Math.sin(time * 0.001 + i) * 0.08;
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.beginPath();
    ctx.arc(120 + i * 180, 100 + (i % 2) * 36, 2 + i * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i < 9; i += 1) {
    const height = 80 + (i % 3) * 42;
    ctx.fillRect(i * 120, world.floorY - height - 40, 70, height);
  }

  const spotlightAlpha = stage.name === "Final Spotlight" ? 0.18 : 0.08;
  ctx.fillStyle = `rgba(255,248,220,${spotlightAlpha})`;
  ctx.beginPath();
  ctx.moveTo(180, 0);
  ctx.lineTo(320, world.floorY);
  ctx.lineTo(40, world.floorY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(760, 0);
  ctx.lineTo(940, world.floorY);
  ctx.lineTo(620, world.floorY);
  ctx.closePath();
  ctx.fill();

  const floorGradient = ctx.createLinearGradient(0, world.floorY - 10, 0, world.height);
  floorGradient.addColorStop(0, "rgba(255,255,255,0.06)");
  floorGradient.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, world.floorY, world.width, world.height - world.floorY);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, world.floorY);
  ctx.lineTo(world.width, world.floorY);
  ctx.stroke();
}

function drawPlayer() {
  const player = state.player;
  if (!player) {
    return;
  }

  const kit = characters[player.type];
  const flash = player.hitTimer > 0 ? "#ffffff" : kit.color;
  const x = player.x;
  const y = player.y;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(player.facing, 1);
  ctx.globalAlpha = player.invulnTimer > 0 && Math.floor(player.invulnTimer * 30) % 2 === 0 ? 0.55 : 1;

  ctx.fillStyle = kit.skin;
  ctx.beginPath();
  ctx.arc(0, -78, 15, 0, Math.PI * 2);
  ctx.fill();

  if (player.type === "stage") {
    ctx.fillStyle = kit.hair;
    ctx.beginPath();
    ctx.ellipse(0, -86, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-15, -76, 8, 34);
    ctx.fillRect(7, -76, 8, 34);
  }

  ctx.fillStyle = flash;
  ctx.fillRect(-12, -66, 24, 48);
  ctx.fillStyle = kit.outfit;
  ctx.fillRect(-20, -46, 40, 18);

  if (player.type === "court") {
    ctx.fillStyle = kit.color;
    ctx.fillRect(-31, -22, 18, 42);
    ctx.fillRect(13, -20, 16, 42);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(-11, -22, 14, 52);
    ctx.fillRect(3, -22, 14, 52);
    ctx.beginPath();
    ctx.arc(28, -42, 10, 0, Math.PI * 2);
    ctx.fillStyle = kit.accent;
    ctx.fill();
  } else {
    ctx.fillStyle = kit.color;
    ctx.fillRect(-30, -20, 16, 44);
    ctx.fillRect(14, -34, 12, 48);
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(-12, -22, 12, 56);
    ctx.fillRect(4, -34, 12, 64);
    ctx.strokeStyle = kit.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(20, -30);
    ctx.lineTo(64, -48);
    ctx.stroke();
  }

  if (player.attackTimer > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(28, -54, 34, 12);
  }

  if (player.specialTimer > 0) {
    ctx.strokeStyle = kit.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -38, 34 + player.specialTimer * 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEnemy(enemy) {
  const flash = enemy.hitTimer > 0 ? "#fff1f2" : enemy.color;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = flash;

  if (enemy.flying) {
    ctx.beginPath();
    ctx.ellipse(0, -18, enemy.width * 0.48, enemy.height * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-18, -16, 36, 6);
  } else if (enemy.boss) {
    ctx.beginPath();
    ctx.arc(0, -100, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-18, -88, 36, 54);
    ctx.fillRect(-36, -68, 22, 18);
    ctx.fillRect(14, -72, 26, 18);
    ctx.fillRect(-18, -34, 16, 62);
    ctx.fillRect(4, -34, 16, 62);
    ctx.strokeStyle = "#fff7ed";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(24, -62);
    ctx.lineTo(68, -76);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, -enemy.height + 14, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-enemy.width * 0.22, -enemy.height + 24, enemy.width * 0.44, enemy.height * 0.52);
    ctx.fillRect(-enemy.width * 0.42, -enemy.height + 42, enemy.width * 0.3, 14);
    ctx.fillRect(enemy.width * 0.1, -enemy.height + 42, enemy.width * 0.3, 14);
    ctx.fillRect(-enemy.width * 0.18, -enemy.height * 0.34, enemy.width * 0.16, enemy.height * 0.34);
    ctx.fillRect(enemy.width * 0.02, -enemy.height * 0.34, enemy.width * 0.16, enemy.height * 0.34);
  }

  const healthRatio = Math.max(enemy.health, 0) / enemy.maxHealth;
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(-22, -enemy.height - 22, 44, 5);
  ctx.fillStyle = "#fff7ed";
  ctx.fillRect(-22, -enemy.height - 22, 44 * healthRatio, 5);
  ctx.restore();
}

function drawProjectiles() {
  state.projectiles.forEach((projectile) => {
    ctx.save();
    ctx.fillStyle = projectile.color;
    ctx.shadowBlur = projectile.pulse ? 24 : 14;
    ctx.shadowColor = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawEffects() {
  state.effects.forEach((effect) => {
    ctx.save();
    ctx.globalAlpha = Math.max(effect.life, 0);
    ctx.fillStyle = effect.color;
    ctx.font = "700 18px Space Grotesk";
    ctx.fillText(effect.text, effect.x, effect.y);
    ctx.restore();
  });
}

function drawCharacterHint() {
  const activeType = state.player ? state.player.type : state.selectedCharacter;
  const kit = characters[activeType];
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "700 18px Space Grotesk";
    ctx.fillText(`${kit.name}: ${kit.description}`, 26, 34);
  ctx.restore();
}

function render(time) {
  ctx.clearRect(0, 0, world.width, world.height);
  ctx.save();

  if (state.cameraShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.cameraShake;
    const shakeY = (Math.random() - 0.5) * state.cameraShake;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground(time);
  if (state.player) {
    drawPlayer();
  }
  state.enemies.forEach(drawEnemy);
  drawProjectiles();
  drawEffects();
  drawCharacterHint();
  ctx.restore();
}

function frame(time) {
  const dt = Math.min((time - state.lastTime) / 1000 || 0, 0.033);
  state.lastTime = time;
  update(dt, time);
  render(time);
  requestAnimationFrame(frame);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  if (key === "a") {
    input.left = true;
  } else if (key === "d") {
    input.right = true;
  } else if (key === "w") {
    input.jumpQueued = true;
  } else if (key === " ") {
    input.jumpQueued = true;
  } else if (key === "j") {
    input.attackQueued = true;
  } else if (key === "l") {
    input.dodgeQueued = true;
  } else if (key === "enter" && state.screen !== "playing") {
    continueFromOverlay();
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (key === "a") {
    input.left = false;
  } else if (key === "d") {
    input.right = false;
  }
}

function releaseMoveInputs() {
  input.left = false;
  input.right = false;
}

function handleDirectionalTap(direction) {
  const now = performance.now();
  if (direction === "left") {
    input.left = true;
    input.right = false;
    if (now - tapState.leftLastTap < 260) {
      input.dodgeQueued = true;
    }
    tapState.leftLastTap = now;
  } else {
    input.right = true;
    input.left = false;
    if (now - tapState.rightLastTap < 260) {
      input.dodgeQueued = true;
    }
    tapState.rightLastTap = now;
  }
}

function bindTouchButton(button) {
  const control = button.dataset.touch;
  const start = (event) => {
    event.preventDefault();
    if (control === "left" || control === "right") {
      handleDirectionalTap(control);
    } else if (control === "jump") {
      input.jumpQueued = true;
    } else if (control === "action") {
      input.attackQueued = true;
    }
  };

  const end = (event) => {
    event.preventDefault();
    if (control === "left" || control === "right") {
      releaseMoveInputs();
    }
  };

  button.addEventListener("touchstart", start, { passive: false });
  button.addEventListener("touchend", end, { passive: false });
  button.addEventListener("touchcancel", end, { passive: false });
  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", end);
  button.addEventListener("mouseleave", end);
}

function initGame() {
  canvas = document.getElementById("gameCanvas");
  stageNameEl = document.getElementById("stageName");
  briefTitleEl = document.getElementById("briefTitle");
  briefTextEl = document.getElementById("briefText");
  stageNotesEl = document.getElementById("stageNotes");
  healthFillEl = document.getElementById("healthFill");
  energyFillEl = document.getElementById("energyFill");
  scoreValueEl = document.getElementById("scoreValue");
  waveValueEl = document.getElementById("waveValue");
  overlayEl = document.getElementById("overlay");
  overlayEyebrowEl = document.getElementById("overlayEyebrow");
  overlayTitleEl = document.getElementById("overlayTitle");
  overlayTextEl = document.getElementById("overlayText");
  overlayButtonEl = document.getElementById("overlayButton");
  startButtonEl = document.getElementById("startButton");
  characterButtons = [...document.querySelectorAll("[data-character]")];
  touchButtons = [...document.querySelectorAll(".touch-btn")];

  if (
    !canvas ||
    !stageNameEl ||
    !briefTitleEl ||
    !briefTextEl ||
    !stageNotesEl ||
    !healthFillEl ||
    !energyFillEl ||
    !scoreValueEl ||
    !waveValueEl ||
    !overlayEl ||
    !overlayEyebrowEl ||
    !overlayTitleEl ||
    !overlayTextEl ||
    !overlayButtonEl ||
    !startButtonEl
  ) {
    console.error("Which MJ failed to initialize because required DOM nodes were not found.");
    return;
  }

  ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Which MJ failed to initialize because the canvas context could not be created.");
    return;
  }

  world.width = canvas.width;
  world.height = canvas.height;

  characterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCharacter = button.dataset.character;
      updateSelectionUi();
      if (state.screen === "menu") {
        showMenu();
      }
      drawCharacterHint();
    });
  });

  touchButtons.forEach(bindTouchButton);
  startButtonEl.addEventListener("click", startRun);
  overlayButtonEl.addEventListener("click", continueFromOverlay);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  updateSelectionUi();
  showMenu();
  requestAnimationFrame(frame);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame, { once: true });
} else {
  initGame();
}
