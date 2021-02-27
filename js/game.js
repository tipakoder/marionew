(function() {

    // Основные переменные
    let canvas = document.getElementById("viewport");
    let ctx = canvas.getContext("2d");
    let tile = 16;
    let started = false;
    let urlToPHP = "/marionew/php/";

    // Таймеры
    let timerPlayerWalk;
    let timerMonsterAnimation;
    let timer;
    let requestFrame;

    // Портал
    let portal = {
        x: [],
        y: [],
        opened: false,
        cnt: true,
    };

    // Фоны
    let backgrounds = {
        simple: "bgSimple",
        dangeon: "bgDangeon",
        forest: "bgForest",
        waterfall: "bgWaterfall",
    };
    // Кол-во монеток для перехода на след. уровень
    let pointreqiured = 6;
    // Кол-во жизней
    let maxLives = 3;
    // Физические постоянные
    let friction = 0.04;
    let impulse = 0.8;
    let accel = 0.04;
    let gravity = 0.01;
    // Максимальная скорость
    let maxvelx = 0.16;
    let maxvely = 0.46;

    // Время
    let seconds = 0;
    let minutes = 0;
    let unitySeconds = 0;
    let unityMinutes = 0;

    // Ресурсы на загрузку
    let resourcesToLoad = [
        // Марио
        { key: "mario_standing_R", src: "img/sprite/mario/mario_standing_R.png" },
        { key: "mario_standing_L", src: "img/sprite/mario/mario_standing_L.png" },
        { key: "mario_damaged", src: "img/sprite/mario/mario_damaged.png" },
        { key: "jump_R", src: "img/sprite/mario/jump_R.png" },
        { key: "jump_L", src: "img/sprite/mario/jump_L.png" },
        { key: "walk_frame_1_R", src: "img/sprite/mario/walk_frame_1_R.png" },
        { key: "walk_frame_1_L", src: "img/sprite/mario/walk_frame_1_L.png" },
        { key: "walk_frame_2_R", src: "img/sprite/mario/walk_frame_2_R.png" },
        { key: "walk_frame_2_L", src: "img/sprite/mario/walk_frame_2_L.png" },
        { key: "walk_frame_3_R", src: "img/sprite/mario/walk_frame_3_R.png" },
        { key: "walk_frame_3_L", src: "img/sprite/mario/walk_frame_3_L.png" },
        // Гриб
        { key: "mushroom_walk_1", src: "img/sprite/mushroom/enemy_mushroom_1.png" },
        { key: "mushroom_walk_2", src: "img/sprite/mushroom/enemy_mushroom_2.png" },
        { key: "mushroom_dead", src: "img/sprite/mushroom/enemy_mushroom_dead.png" },
        // Черепаха
        { key: "turtle_walk_1_L", src: "img/sprite/turtle/enemy_turtle_1_L.png" },
        { key: "turtle_walk_2_L", src: "img/sprite/turtle/enemy_turtle_2_L.png" },
        { key: "turtle_walk_1_R", src: "img/sprite/turtle/enemy_turtle_1_R.png" },
        { key: "turtle_walk_2_R", src: "img/sprite/turtle/enemy_turtle_2_R.png" },
        { key: "turtle_dead", src: "img/sprite/turtle/enemy_turtle_dead.png" },
        // Босс
        { key: "dragon_walk_1_L", src: "img/sprite/boss/dragon_walk_1_L.png" },
        { key: "dragon_walk_2_L", src: "img/sprite/boss/dragon_walk_2_L.png" },
        { key: "dragon_walk_3_L", src: "img/sprite/boss/dragon_walk_3_L.png" },
        { key: "dragon_walk_4_L", src: "img/sprite/boss/dragon_walk_4_L.png" },
        { key: "dragon_walk_1_R", src: "img/sprite/boss/dragon_walk_1_R.png" },
        { key: "dragon_walk_2_R", src: "img/sprite/boss/dragon_walk_2_R.png" },
        { key: "dragon_walk_3_R", src: "img/sprite/boss/dragon_walk_3_R.png" },
        { key: "dragon_walk_4_R", src: "img/sprite/boss/dragon_walk_4_R.png" },
        // Блоки
        { key: "brick", src: "img/sprite/items/brick.png" },
        { key: "brick4", src: "img/sprite/items/brick4.png" },
        { key: "backbrick", src: "img/sprite/items/backbrick.png" },
        { key: "coin", src: "img/sprite/items/coin.png" },
        // Задний фон
        { key: "bgSimple", src: "img/background/simple.png" },
        { key: "bgDangeon", src: "img/background/dangeon.png" },
        { key: "bgForest", src: "img/background/forest.png" },
        { key: "bgWaterfall", src: "img/background/waterfall.png" },
        // Трубы (порталы)
        { key: "tubeT", src: "img/sprite/items/tubeT.png" },
        { key: "tubeL", src: "img/sprite/items/tubeL.png" },
        { key: "tubeR", src: "img/sprite/items/tubeR.png" },
    ];

    // Всё что связанно с игроком
    function playerInit() {
        window.player = {
            velocityx: 0,
            velocityy: 0,
            x: 0,
            y: 0,
            mass: 3,
            points: 0,
            unityPoints: 0,
            lives: maxLives,
            invun: false,
            spawnpointx: 0,
            spawnpointy: 0,
            dead: false,
            god: false,
            cybersport: false,
            jumpstate: "ReadyToJump",
            lastDirection: "right",
        };
    }
    playerInit();

    function setSpawnPoint(x, y) {
        player.spawnpointx = x;
        player.spawnpointy = y;
    }

    function setPosition(x, y) {
        player.x = x;
        player.y = y;
    }

    function killPlayer() {
        console.warn("Вы умерли, перезапуск игры через 5 секунд");
        document.getElementById("gameScreen").style.display = "none";
        document.getElementById("deadScreen").style.display = "flex";
        resetAll();
        // Перезапускаем игру через 5 секунд
        setTimeout(gameStart, 5000);
    }

    function onkey(e) {
        if (!started) return;
        //обработка нажатий
        switch (e.key) {
            case "a":
            case 'ArrowLeft':
                if (e.type == 'keydown') {
                    player.left = true
                } else {
                    player.left = false;
                }
                break;
            case "d":
            case 'ArrowRight':
                if (e.type == 'keydown') {
                    player.right = true
                } else {
                    player.right = false;
                }
                // e.preventDefault();
                break;
            case "w":
            case 'ArrowUp':
                if (e.type == 'keydown') {
                    player.jump = true
                } else {
                    player.jump = false;
                }
                // e.preventDefault();
                break;
            case "G":
                player.god = true;
                break;
            case "p":
            case "P":
                player.god = false;
                break;
            case "R":
            case "r":
                gameStart();
                minutes = 0;
                seconds = 0;
                player.unityScore = 0;
                break;
            case "C":
            case "c":
                if (e.type == "keyup") {
                    player.cybersport = true;
                    console.warn("Активирован режим киберспорт");
                }
                break;
        }
    }

    function updatePlayer() {
        // Если нет жизней - убиваем
        if (player.lives <= 0)
            killPlayer();

        //Перемещение и коллизия игрока
        if ((!player.left) & (!player.right)) {
            //если кнопки горизонтального движения не нажаты, трение уменьшает скорость
            if (player.velocityx > 0) {
                player.velocityx -= friction
            } else {
                player.velocityx += friction
            }
            if ((player.velocityx < 0.05) && (player.velocityx > -0.05)) {
                //если скорость достаточно мала - округлить до нуля
                player.velocityx = 0
            }
        }

        //ускорение в соответствующую сторону, при условии что текущая скорость не превышает максимальную
        if (player.left) {
            player.lastDirection = 'left'
            if (!(player.velocityx - accel < -maxvelx)) {
                player.velocityx -= (!player.god) ? accel : accel * 2;
            } else {
                player.velocityx = -maxvelx
            }
            //Проверка коллизии при двежении вправо
            if (
                level.data[Math.floor(player.x - 0.05 + player.velocityx)][Math.round(player.y)] == 1 ||
                level.data[Math.floor(player.x - 0.05 + player.velocityx)][Math.round(player.y - 0.5)] == 1 ||
                level.data[Math.floor(player.x - 0.05 + player.velocityx)][Math.round(player.y)] == 'b' ||
                level.data[Math.floor(player.x - 0.05 + player.velocityx)][Math.round(player.y - 0.5)] == 'b' || ((
                    level.data[Math.floor(player.x - 0.05 + player.velocityx)][Math.round(player.y)] == '*' ||
                    level.data[Math.floor(player.x - 0.05 + player.velocityx)][Math.round(player.y - 0.5)] == '*') && portal.opened == false)
            ) {
                player.x += 0.01
                player.velocityx = 0
            }
        }
        if (player.right) {
            player.lastDirection = 'right'
            if (!(player.velocityx + accel > maxvelx)) {
                player.velocityx += (!player.god) ? accel : accel * 2;
            } else {
                player.velocityx = maxvelx
            }
            //Проверка коллизии при двежении право
            if (
                level.data[Math.floor(player.x + 1 + player.velocityx)][Math.round(player.y)] == 1 ||
                level.data[Math.floor(player.x + 1 + player.velocityx)][Math.round(player.y - 0.5)] == 1 ||
                level.data[Math.floor(player.x + 1 + player.velocityx)][Math.round(player.y)] == 'b' ||
                level.data[Math.floor(player.x + 1 + player.velocityx)][Math.round(player.y - 0.5)] == 'b' || ((
                    level.data[Math.floor(player.x + 1 + player.velocityx)][Math.round(player.y)] == '*' ||
                    level.data[Math.floor(player.x + 1 + player.velocityx)][Math.round(player.y - 0.5)] == '*') && !portal.opened)
            ) {
                player.x -= 0.005
                player.velocityx = 0
            }
        }

        //Прыжок
        if (player.jump) {
            //Проверка состояния фазы прыжка
            if (player.jumpstate == 'ReadyToJump') {
                player.velocityy = parseFloat((impulse / player.mass).toFixed(3));
                if (player.god) player.velocityy *= 2;
                player.jumpstate = 'IsJumpimg';
            }
        }

        switch (player.jumpstate) {
            case 'IsJumpimg':
                //Проверка столкновенияя при движении вверх
                player.velocityy -= gravity
                if (
                    level.data[Math.ceil(player.x)][Math.ceil((player.y - player.velocityy))] == 1 ||
                    level.data[Math.ceil(player.x)][Math.ceil((player.y - 0.5 - player.velocityy))] == 1 ||
                    level.data[Math.floor(player.x)][Math.floor((player.y - player.velocityy))] == 1 ||
                    level.data[Math.floor(player.x)][Math.floor((player.y - player.velocityy))] == 1 ||
                    level.data[Math.ceil(player.x)][Math.ceil((player.y - player.velocityy))] == 'b' ||
                    level.data[Math.ceil(player.x)][Math.ceil((player.y - 0.5 - player.velocityy))] == 'b' ||
                    level.data[Math.floor(player.x)][Math.floor((player.y - player.velocityy))] == 'b' ||
                    level.data[Math.floor(player.x)][Math.floor((player.y - player.velocityy))] == 'b' || ((
                        level.data[Math.ceil(player.x)][Math.ceil((player.y - 0.5 - player.velocityy))] == '*' ||
                        level.data[Math.floor(player.x)][Math.floor((player.y - player.velocityy))] == '*' ||
                        level.data[Math.floor(player.x)][Math.floor((player.y - player.velocityy))] == '*') && !portal.opened)
                ) {
                    player.velocityy = 0
                    player.jumpstate = 'Descending'
                }
                if (player.velocityy < 0) {
                    player.jumpstate = 'Descending'
                }
                break;
            case 'Descending':
                //При движениив вниз
                if (
                    level.data[Math.round(player.x + 0.4)][Math.round((player.y - player.velocityy))] == 1 ||
                    level.data[Math.round(player.x + 0.4)][Math.floor((player.y + 0.7 - player.velocityy))] == 1 ||
                    level.data[Math.floor(player.x)][Math.round((player.y + 0.7 - player.velocityy))] == 1 ||
                    level.data[Math.round(player.x)][Math.floor((player.y - player.velocityy))] == 1 ||
                    level.data[Math.round(player.x + 0.4)][Math.round((player.y - player.velocityy))] == 'b' ||
                    level.data[Math.round(player.x + 0.4)][Math.floor((player.y + 0.7 - player.velocityy))] == 'b' ||
                    level.data[Math.floor(player.x)][Math.round((player.y + 0.7 - player.velocityy))] == 'b' ||
                    level.data[Math.round(player.x)][Math.floor((player.y - player.velocityy))] == 'b' || (
                        (
                            level.data[Math.round(player.x + 0.4)][Math.round((player.y - player.velocityy))] == '*' ||
                            level.data[Math.round(player.x + 0.4)][Math.floor((player.y + 0.7 - player.velocityy))] == '*' ||
                            level.data[Math.floor(player.x)][Math.round((player.y + 0.7 - player.velocityy))] == '*' ||
                            level.data[Math.round(player.x)][Math.floor((player.y - player.velocityy))] == '*'
                        ) &&
                        !portal.opened)
                ) {
                    player.velocityy = 0;
                    player.jumpstate = 'ReadyToJump'
                    player.y = Math.round(player.y)
                } else {
                    player.velocityy -= gravity
                }
                break;
        }
        if (player.jumpstate == 'ReadyToJump') {
            if (
                level.data[Math.round(player.x + 0.4)][Math.round((player.y + 0.6))] == 0 &&
                level.data[Math.round(player.x)][Math.round((player.y + 0.6))] == 0
            ) {
                player.jumpstate = 'Descending'
            }
        }

        //проверка коллизии с врагами
        //Проверяет 5 точек - 4 вершины и середину игрока
        for (let it of enemys) {
            if (!it.dead && !player.god) {
                switch (it.type) {
                    case 3:
                        if (
                            ((player.x > it.posx) && (player.x < it.posx + 2)) && ((player.y > it.posy - 2) && (player.y < it.posy)) ||
                            ((player.x + 1 > it.posx) && (player.x + 1 < it.posx + 2)) && ((player.y > it.posy - 2) && (player.y < it.posy)) ||
                            ((player.x + 1 > it.posx) && (player.x + 1 < it.posx + 2)) && ((player.y - 1 > it.posy - 2) && (player.y - 1 < it.posy)) ||
                            ((player.x > it.posx) && (player.x < it.posx + 2)) && ((player.y > it.posy - 2) && (player.y < it.posy)) ||
                            ((player.x + 0.5 > it.posx) && (player.x + 0.5 < it.posx + 2)) && ((player.y - 0.5 > it.posy - 2) && (player.y - 0.5 < it.posy))
                        ) {
                            if (player.invun == false) {
                                player.lives -= 3;
                                setTimeout(damagedPlayer, 500);
                                player.invun = true;
                                player.velocityx = -player.velocityx
                                player.velocityy = -player.velocityy
                            } else {
                                player.velocityx = -player.velocityx
                                player.velocityy = -player.velocityy
                            }
                        }
                    default:
                        if (
                            ((player.x > it.posx) && (player.x < it.posx + 1)) && ((player.y > it.posy - 1) && (player.y < it.posy)) ||
                            ((player.x + 1 > it.posx) && (player.x + 1 < it.posx + 1)) && ((player.y > it.posy - 1) && (player.y < it.posy)) ||
                            ((player.x + 1 > it.posx) && (player.x + 1 < it.posx + 1)) && ((player.y - 1 > it.posy - 1) && (player.y - 1 < it.posy)) ||
                            ((player.x > it.posx) && (player.x < it.posx + 1)) && ((player.y > it.posy - 1) && (player.y < it.posy)) ||
                            ((player.x + 0.5 > it.posx) && (player.x + 0.5 < it.posx + 1)) && ((player.y - 0.5 > it.posy - 1) && (player.y - 0.5 < it.posy))
                        ) {
                            if (player.invun == false) {
                                player.lives -= 1;
                                setTimeout(damagedPlayer, 500);
                                player.invun = true;
                                player.velocityx = -player.velocityx
                                player.velocityy = -player.velocityy
                            } else {
                                player.velocityx = -player.velocityx
                                player.velocityy = -player.velocityy
                            }
                        }
                }
            }
            // Урон врагам
            if (
                (((player.x > it.posx) && (player.x < it.posx + 1)) && (player.y > it.posy - 1) ||
                    ((player.x + 1 > it.posx) && (player.x + 1 < it.posx + 1)) && (player.y > it.posy - 1) ||
                    ((player.x + 1 > it.posx) && (player.x + 1 < it.posx + 1)) && (player.y - 1 > it.posy - 1) ||
                    ((player.x > it.posx) && (player.x < it.posx + 1)) && ((player.y > it.posy - 1) && (player.y < it.posy))) &&
                player.invun == false
            ) {
                if (it.healt - 20 > 0) {
                    it.healt -= 20;
                } else {
                    it.healt = 0;
                    // it.dead = true;
                }
            }
        }
        //проверка столкновения с порталом
        if (portal.opened) {
            for (let i = 0; i < portal.x.length; i++) {
                if (
                    ((player.x > portal.x[i]) && (player.x < portal.x[i] + 1)) && ((player.y > portal.y[i]) && (player.y < portal.y[i])) ||
                    ((player.x + 1 > portal.x[i]) && (player.x + 1 < portal.x[i] + 1)) && ((player.y > portal.y[i] - 1) && (player.y < portal.y[i])) ||
                    ((player.x + 1 > portal.x[i]) && (player.x + 1 < portal.x[i] + 1)) && ((player.y - 1 > portal.y[i] - 1) && (player.y - 1 < portal.y[i])) ||
                    ((player.x > portal.x[i]) && (player.x < portal.x[i] + 1)) && ((player.y > portal.y[i] - 1) && (player.y < portal.y[i])) ||
                    ((player.x + 0.5 > portal.x[i]) && (player.x + 0.5 < portal.x[i] + 1)) && ((player.y - 0.5 > portal.y[i] - 1) && (player.y - 0.5 < portal.y[i]))
                ) {
                    win();
                }
            }
        }

        //окргуление значений для облечения дальнейших вычислений...
        player.velocityx = parseFloat(player.velocityx.toFixed(2))
        player.velocityy = parseFloat(player.velocityy.toFixed(2))
        player.x = parseFloat((player.x + player.velocityx).toFixed(2))
        player.y = parseFloat((player.y - player.velocityy).toFixed(2))


        // Анимация
        if (player.invun) {
            //При получении урона
            player.walkFrame = 0;
            ctx.drawImage(getSprite("mario_damaged"), player.x * tile, player.y * tile, 25, 25)
        } else if (player.jumpstate != 'ReadyToJump') {
            //В прыжке
            player.walkFrame = 0;
            switch (player.lastDirection) {
                case 'left':
                    ctx.drawImage(getSprite("jump_L"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    break;
                case 'right':
                    ctx.drawImage(getSprite("jump_R"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    break;
            }
        } else if (player.right || player.left) {
            if (player.walkFrame == 0) {
                player.walkFrame = 1
            }
            //При движении вправо влево
            switch (player.walkFrame) {
                case 1:
                    if (player.right) {
                        ctx.drawImage(getSprite("walk_frame_1_R"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    }
                    if (player.left) {
                        ctx.drawImage(getSprite("walk_frame_1_L"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    }
                    break;
                case 2:
                    if (player.right) {
                        ctx.drawImage(getSprite("walk_frame_2_R"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    }
                    if (player.left) {
                        ctx.drawImage(getSprite("walk_frame_2_L"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    }
                    break;
                case 3:
                    if (player.right) {
                        ctx.drawImage(getSprite("walk_frame_3_R"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    }
                    if (player.left) {
                        ctx.drawImage(getSprite("walk_frame_3_L"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    }
                    break;
            }
        } else {
            player.walkFrame = 0;
            //Если стоит
            switch (player.lastDirection) {
                case 'left':
                    ctx.drawImage(getSprite("mario_standing_L"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    break;
                case 'right':
                    ctx.drawImage(getSprite("mario_standing_R"), player.x * tile, player.y * tile - tile, tile, tile * 2)
                    break;
            }
        }
    }

    function damagedPlayer() {
        player.invun = false;
        player.x = player.spawnpointx;
        player.y = player.spawnpointy;
        if (player.cybersport) gameStart();
    }

    function checkTreasure() {
        //коллизия с сокровищем
        for (let i = 0; i < 8; i++) {
            if (level.data[Math.round(player.x)][Math.round(player.y)] == '2') {
                level.data[Math.round(player.x)][Math.round(player.y)] = '0';
                player.points++;
                player.unityPoints++;
                if (player.lives + 1 >= 3) {
                    player.lives = 3;
                } else {
                    player.lives += 1;
                }
            }
        }
        if (player.points >= pointreqiured) {
            portal.opened = true
        }
    }
    //-------------------------------------------------------

    // Всё что связанно с монстрами
    let enemys = [];
    let enemyToCopy = {
        "3": { type: 1, posx: 0, posy: 0, vel: 0, sprite: undefined, direction: "right", healt: 100, dead: false, animFrame: 0, animFrames: 2, anim: ["mushroom_walk_1", "mushroom_walk_2", "mushroom_walk_1", "mushroom_walk_2", "mushroom_dead"] },
        "@": { type: 2, posx: 0, posy: 0, vel: 0, sprite: undefined, direction: "right", healt: 100, dead: false, animFrame: 0, animFrames: 2, anim: ["turtle_walk_1_L", "turtle_walk_2_L", "turtle_walk_1_R", "turtle_walk_2_R", "turtle_dead"] },
        "]": { type: 3, posx: 0, posy: 0, vel: 0, sprite: undefined, direction: "right", healt: 100, dead: false, animFrame: 0, animFrames: 4, anim: [] },
    };

    function updateMonster() {
        // Перебираем массив с монстрами
        for (let it of enemys) {
            // Если монстр жив
            if (!it.dead) {
                switch (it.direction) {
                    case 'right':
                        switch (it.type) {
                            case 3:
                                if (!(it.vel + (accel / 100) > maxvelx)) {
                                    it.vel += accel / 100;
                                }
                                break;
                            default:
                                if (!(it.vel + accel > maxvelx)) {
                                    it.vel += accel;
                                }
                                break;
                        }
                        switch (it.type) {
                            case 3:
                                if (
                                    level.data[Math.round(it.posx + it.vel) + 2][Math.round(it.posy) + 1] == '0' ||
                                    level.data[Math.round(it.posx + it.vel) + 2][Math.round(it.posy)] == '1' ||
                                    level.data[Math.round(it.posx + it.vel) + 2][Math.round(it.posy)] == 'b' || (
                                        level.data[Math.round(it.posx + it.vel) + 2][Math.round(it.posy)] == '*' && !portal.opened)
                                ) {
                                    it.direction = 'left'
                                    it.vel = 0;
                                }
                            default:
                                if (
                                    level.data[Math.round(it.posx + it.vel) + 1][Math.round(it.posy) + 1] == '0' ||
                                    level.data[Math.round(it.posx + it.vel) + 1][Math.round(it.posy)] == '1' ||
                                    level.data[Math.round(it.posx + it.vel) + 1][Math.round(it.posy)] == 'b' || (
                                        level.data[Math.round(it.posx + it.vel) + 1][Math.round(it.posy)] == '*' && !portal.opened)
                                ) {
                                    it.direction = 'left'
                                }
                                break;
                        }
                        break;
                    case 'left':
                        switch (it.type) {
                            case 3:
                                if (!(it.vel - (accel / 100) < -maxvelx)) {
                                    it.vel -= accel / 100;
                                }
                                break;
                            default:
                                if (!(it.vel - accel < -maxvelx)) {
                                    it.vel -= accel;
                                }
                                break;
                        }
                        switch (it.type) {
                            case 3:
                                if (
                                    level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy) + 1] == '0' ||
                                    level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy)] == '1' ||
                                    level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy)] == 'b' ||
                                    (level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy)] == '*' & !portal.opened)
                                ) {
                                    it.direction = 'right'
                                    it.vel = 0;
                                }
                            default:
                                if (
                                    level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy) + 1] == '0' ||
                                    level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy)] == '1' ||
                                    level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy)] == 'b' ||
                                    (level.data[Math.round(it.posx + it.vel) - 1][Math.round(it.posy)] == '*' & !portal.opened)
                                ) {
                                    it.direction = 'right'
                                }
                                break;
                        }

                }

                it.posx = parseFloat((it.posx + it.vel).toFixed(2));
            }

            // Отрисовываем врага, если у него есть спрайт
            if (it.sprite !== undefined) {
                switch (it.type) {
                    case 3:
                        ctx.drawImage(it.sprite, it.posx * tile, (it.posy * tile) - tile, 32, 32);
                        break;
                    default:
                        ctx.drawImage(it.sprite, it.posx * tile, it.posy * tile, 20, 17);
                        break;
                }
            }
        }
    }

    function animationMonster() {
        // Перебираем массив с монстрами
        for (let it of enemys) {
            if (it.direction == "right") {
                // Анимация движения вправо
                if (it.animFrames * 2 > it.animFrame) {
                    it.animFrame++;
                } else {
                    it.animFrame = it.animFrame;
                }
            } else {
                // Анимация движения влево
                if (it.animFrames > it.animFrame) {
                    it.animFrame++;
                } else {
                    it.animFrame = 0;
                }
            }
            // Приминяем нужный спрайт
            it.sprite = getSprite(it.anim[it.animFrame]);
        }
    }
    //-------------------------------------------------------

    // Всё что связанно со спрайтами (загрузка/использование)
    let sprites = {};
    let spritesToLoad = 0;
    let spritesLoaded = false;

    function loadSprites(list) {
        spritesToLoad += (list.length - 1);
        for (let it of list) {
            if (it.key != undefined) {
                let img = new Image();
                img.src = it.src;
                img.onload = function(e) {
                    e.preventDefault();
                    sprites[it.key] = img;
                    if (spritesToLoad == Object.keys(sprites).length) spritesReady();
                };
                img.onerror = function(e) {
                    e.preventDefault();
                    console.warn("Ошибка загрузки [" + it.key + "] по адресу '" + it.src + "'");
                }
            }
        }
    }

    function spritesReady() {
        console.info("Все ресурсы игры успешно загружены! :-)");
        spritesLoaded = true;
        // Активируем игру
        activeGameStart();
    }

    function getSprite(key) {
        if (sprites[key] != undefined) {
            return sprites[key];
        }
        return false;
    }
    //-------------------------------------------------------

    // Уровни и всё, что с ними связано
    let level = undefined;
    let levels = [];
    let currentLevel = 0;
    let levelsLoaded = false;

    function loadLevels() {
        if (!levelsLoaded) {
            fetchRequest("getLevels.php", new FormData(), (result) => {
                // Помечаем, что уровни загружены
                levelsLoaded = true;
                console.info("Уровни успешно загружены! :-)");
                // Получаем все уровни
                for (let level of result.levels) {
                    let lvlData = JSON.parse(level.data);
                    levels.push({ name: level.name, data: lvlData.data, background: lvlData.background });
                }
                // Активируем игру
                activeGameStart();
            });
        }
    }
    //-------------------------------------------------------

    // Основные функции игрового процесса
    function ready() {
        // Загрузка спрайтов игры
        loadSprites(resourcesToLoad);
        // Загрузка уровней игры
        loadLevels();
    }

    function update() {
        render();
        updatePlayer();
        updateMonster();
        updateStatistic();
        checkTreasure();
        if (started)
            requestFrame = requestAnimationFrame(update);
    }

    function resetAll() {
        started = false;
        // Остановка старых таймеров
        clearInterval(timerPlayerWalk);
        clearInterval(timerMonsterAnimation);
        clearInterval(timer);
        cancelAnimationFrame(requestFrame);
        // Отчистка нужных переменных
        enemys = [];
        playerInit();
    }

    function render() {
        // Задний фон
        if (backgrounds[level.background] !== undefined) {
            ctx.drawImage(getSprite(backgrounds[level.background]), 0, 0, canvas.width, canvas.height);
        } else {
            ctx.drawImage(getSprite(backgrounds.simple), 0, 0, canvas.width, canvas.height);
        }
        // Все объекты
        for (let i = 0; i < canvas.width / tile; i++) {
            for (let j = 0; j < canvas.height / tile; j++) {
                try {
                    switch (level.data[i][j]) {
                        // Кирпичная стена
                        case "1":
                            ctx.drawImage(getSprite("brick"), i * tile, j * tile, tile, tile);
                            break;
                            // Бэдрок
                        case "b":
                            ctx.drawImage(getSprite("backbrick"), i * tile, j * tile, tile, tile)
                            break;
                            // Монетки
                        case "2":
                            ctx.drawImage(getSprite("coin"), i * tile, j * tile, tile, tile)
                            break;
                            // Марио
                        case "5":
                            setPosition(i, j);
                            setSpawnPoint(i, j);
                            // Удаляем его из рендера
                            level.data[i][j] = "0";
                            break;
                            // Монстры
                        case "3":
                        case "@":
                        case "]":
                            let newEnemy = Object.assign({}, enemyToCopy[level.data[i][j]]);
                            newEnemy.posx = i;
                            newEnemy.posy = j;
                            enemys.push(newEnemy);
                            // Удаляем его их рендера
                            level.data[i][j] = "0";
                            break;
                            // Предпортальный блок
                        case '*':
                            if (!portal.opened) {
                                ctx.drawImage(getSprite("brick4"), i * tile, j * tile, tile, tile)
                            }
                            break;
                        case ">":
                        case "<":
                        case "^":
                            if (portal.cnt) {
                                portal.x.push(i);
                                portal.y.push(j);
                            }
                            let sprite;
                            switch (level.data[i][j]) {
                                case "^":
                                    sprite = getSprite("tubeT");
                                    break;
                                case ">":
                                    sprite = getSprite("tubeR");
                                    break;
                                case "<":
                                    sprite = getSprite("tubeL");
                                    break;
                            }
                            ctx.drawImage(sprite, i * tile, j * tile, tile * 2, tile * 2);
                            break;
                    }
                    portal.cnt = false;
                } catch (e) {
                    // console.error(e);
                }
            }
        }
    }

    function loadLevel(i) {
        resetAll();
        // Присваиваем текущий левл в рендер
        currentLevel = i;
        level = Object.assign({}, levels[i]);
        document.getElementById("gameScreenLevelName").textContent = level.name;
        // Запуск таймеров
        timerPlayerWalk = setInterval(() => { player.walkFrame++; if (player.walkFrame > 3) { player.walkFrame = 1; } }, 200);
        timerMonsterAnimation = setInterval(animationMonster, 250);
        timer = setInterval(updateTimer, 1000);
        // Запуск
        started = true;
        update();
    }

    function win() {
        // Если текущий уровень не последний, грузим следующий
        if ((currentLevel + 1) < (levels.length - 1)) {
            currentLevel++;
        } else {
            endGame();
        }
        resetAll();
        // Загружаем следующий уровень
        loadLevel(currentLevel);
    }

    function gameStart() {
        resetAll();
        started = true;
        seconds = 0;
        minutes = 0;
        // Отключаем ненужный экран
        document.getElementById("authUser").style.display = "none";
        document.getElementById("winScreen").style.display = "none";
        document.getElementById("deadScreen").style.display = "none";
        document.getElementById("gameScreen").style.display = "flex";
        // Загружаем уровень
        loadLevel(0);
    }

    function endGame() {
        resetAll();
    }

    function activeGameStart() {
        // Если всё подгружено включаем возможность продолжить
        if (spritesLoaded && levelsLoaded) {
            document.getElementById("startGameLoading").style.display = "none";
            document.getElementById("startGameText").style.display = "block";
            document.getElementById("startGameButton").style.display = "block";
            document.addEventListener("keydown", (e) => { if (e.key === "Enter") authUser(); });
        }
    }

    function updateTimer() {
        seconds++;
        unitySeconds++;
        if (seconds == 60) {
            minutes++;
            seconds = 0;
        }
        if (unitySeconds == 60) {
            unityMinutes++;
            unitySeconds = 0;
        }
    }

    function updateStatistic() {
        document.getElementById("gameScreenCoins").textContent = player.points;
        document.getElementById("gameScreenLives").textContent = player.lives;
        // Время
        let secondsShow = (seconds > 9) ? seconds : "0" + seconds;
        let minutesShow = (minutes > 9) ? minutes : "0" + minutes;
        document.getElementById("gameScreenTime").textContent = minutesShow + ":" + secondsShow;
    }
    //-------------------------------------------------------

    // Fetch-запрос на PHP
    let fetchRequest = async(url, data, func = () => {}, errfunc = () => {}) => {
            fetch(
                urlToPHP + url, {
                    method: "POST",
                    body: data
                }).then(async(res) => {
                let dataRes = await res.json();
                return dataRes;
            }).then((data) => {
                if (data.type != 'success') {
                    console.error('--> ошибка :( <--');
                    errfunc(data.data);
                } else {
                    console.info('--> успех :) <--');
                    func(data.data);
                }
            }).catch((error) => {
                console.log('--> ошибка :( <--');
                errfunc(error);
                console.log(error);
            });
        }
        //-------------------------------------------------------

    // Авторизация пользователя
    function authUser() {
        // Выключаем главный экран
        document.getElementById("startGameScreen").style.display = "none";
        // Идём далее
        if (getCookie("user") !== null) {
            gameStart();
        } else {
            document.getElementById("authUser").style.display = "flex";
        }
    }

    function authUserProcess(e) {
        e.preventDefault();
        let formData = new FormData(this);
        fetchRequest("auth.php", formData, (result) => {
            document.getElementById("authUserFormError").style.display = "none";
            setCookie("user", result.session, 365);
            gameStart();
        }, (result) => {
            document.getElementById("authUserFormError").textContent = result;
            document.getElementById("authUserFormError").style.display = "block";
        });
    }
    //-------------------------------------------------------

    // Функции для работы с Cookie
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    //-------------------------------------------------------

    // Даём компонентам внешний доступ
    window.game = {
        loadSprites: loadSprites,
        fetchRequest: fetchRequest,
        loadLevel: loadLevel,
        levels: levels,
    };

    // Задаём события
    document.addEventListener("DOMContentLoaded", ready);
    // Авторизация
    document.getElementById("startGameButton").addEventListener("click", authUser);
    document.getElementById("authUserForm").addEventListener("submit", authUserProcess);
    // Нажатие клавиш в игре
    document.addEventListener('keydown', onkey);
    document.addEventListener('keyup', onkey);
})();