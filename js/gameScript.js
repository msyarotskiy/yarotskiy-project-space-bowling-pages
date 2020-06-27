'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = $('#gameCanvas');
    const context = canvas.get(0).getContext('2d');

    let canvasWidth = canvas.width();
    let canvasHeight = canvas.height();

    let playGame;

    const uiIntro = $('#gameIntro');
    const uiStats = $('#gameStats');
    const uiComplete = $('#gameComplete');
    const uiPlay = $('#gamePlay');
    const uiReset = $('.gameReset');
    const uiRemaining = $('#gameRemaining');
    const uiScore = $('.gameScore');
    const uiSave = $('.gameSave');
    const uiGamerName = $('#gamerName');
    const uiGameResult = $('#gameResult');

    let platformX;
    let platformY;
    let platformOuterRadius;
    let platformInnerRadius;
    let asteroids;

    // player
    let player;
    let playerOriginalX;
    let playerOriginalY;
    let playerSelected;
    let playerMaxAbsVelocity;
    let playerVelocityDampener;
    let powerX;
    let powerY;
    let power;
    let playerAngle;
    let score;

    function resetPlayer() {
        player.x = playerOriginalX;
        player.y = playerOriginalY;
        player.vX = 0;
        player.vY = 0;
    }

    // Reset and start the game
    function startGame() {
        playGame = false;
        uiScore.html('0');
        uiStats.show();

        platformX = canvasWidth / 2;
        platformY = 150;
        platformOuterRadius = 100;
        platformInnerRadius = 75;

        // Asteroid
        let Asteroid = function (x, y, radius, mass, friction) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.mass = mass;
            this.friction = friction;
            this.vX = 0;
            this.vY = 0;
            this.player = false;
        };

        asteroids = new Array();

        playerSelected = false;
        playerMaxAbsVelocity = 30;
        playerVelocityDampener = 0.3;
        powerX = -1;
        powerY = -1;
        power = 0;
        playerAngle = 0;
        score = 0;

        let pRadius = 15;
        let pMass = 10;
        let pFriction = 0.97;

        playerOriginalX = canvasWidth / 2;
        playerOriginalY = canvasHeight - 150;
        player = new Asteroid(playerOriginalX, playerOriginalY, pRadius, pMass, pFriction);
        player.player = true;
        asteroids.push(player);

        let outerRing = 8;
        let ringCount = 3;
        let ringSpacing = (platformInnerRadius / (ringCount - 1));

        for (let r = 0; r < ringCount; r++) {
            let currentRing = 0;
            let angle = 0;
            let ringRadius = 0;

            if (r == ringCount - 1) {
                currentRing = 1;
            } else {
                currentRing = outerRing - (r * 3);
                angle = 360 / currentRing;
                ringRadius = platformInnerRadius - (ringSpacing * r);
            }

            for (let a = 0; a < currentRing; a++) {
                let x = 0;
                let y = 0;

                if (r == ringCount - 1) {
                    x = platformX;
                    y = platformY;
                } else {
                    x = platformX + (ringRadius * Math.cos((angle * a) * (Math.PI / 180)));
                    y = platformY + (ringRadius * Math.sin((angle * a) * (Math.PI / 180)));
                }

                let radius = 10;
                let mass = 5;
                let friction = 0.95;

                asteroids.push(new Asteroid(x, y, radius, mass, friction));
            }

            uiRemaining.html(asteroids.length - 1);
        }

        window.addEventListener('mousedown', (e) => {
            if (!playerSelected && player.x == playerOriginalX && player.y == playerOriginalY) {
                let canvasOffset = canvas.offset();
                let canvasX = Math.floor(e.pageX - canvasOffset.left);
                let canvasY = Math.floor(e.pageY - canvasOffset.top);
                if (!playGame) {
                    playGame = true;
                    animate();
                }
                let dX = player.x - canvasX;
                let dY = player.y - canvasY;
                let distance = Math.sqrt((dX * dX) + (dY * dY));
                let padding = 5;
                if (distance < player.radius + padding) {
                    powerX = player.x;
                    powerY = player.y;
                    playerSelected = true;
                }
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (playerSelected) {
                let canvasOffset = canvas.offset();
                let canvasX = Math.floor(e.pageX - canvasOffset.left);
                let canvasY = Math.floor(e.pageY - canvasOffset.top);
                let dX = canvasX - player.x;
                let dY = canvasY - player.y;
                let distance = Math.sqrt((dX * dX) + (dY * dY));
                if (distance * playerVelocityDampener < playerMaxAbsVelocity) {
                    powerX = canvasX;
                    powerY = canvasY;
                    power = Math.round(distance);
                } else {
                    var ratio = playerMaxAbsVelocity / (distance * playerVelocityDampener);
                    powerX = player.x + (dX * ratio);
                    powerY = player.y + (dY * ratio);
                    power = 100;
                }

                playerAngle = Math.round(Math.atan2(canvasX - playerOriginalX, canvasY - playerOriginalY) * 180 / Math.PI);
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (playerSelected) {
                let dX = powerX - player.x;
                let dY = powerY - player.y;
                player.vX = -(dX * playerVelocityDampener);
                player.vY = -(dY * playerVelocityDampener);
                uiScore.html(++score);
            }
            playerSelected = false;
            powerX = -1;
            powerY = -1;
        });

        animate();
    }

    function init() {
        uiStats.hide();
        uiComplete.hide();
        uiGameResult.hide();

        uiPlay.click((e) => {
            e.preventDefault();
            uiIntro.hide();
            startGame();
        });

        uiReset.click((e) => {
            e.preventDefault();
            uiComplete.hide();
            startGame();
        });

        uiSave.click((e) => {
            e.preventDefault();
            SaveResult();
        });
    }

    function animate() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        context.fillStyle = 'rgb(100, 100, 100)';
        context.beginPath();
        context.arc(platformX, platformY, platformOuterRadius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        if (playerSelected) {
            context.strokeStyle = 'rgb(255, 255, 255)';
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(player.x, player.y);
            context.lineTo(powerX, powerY);
            context.closePath();
            context.stroke();

            context.fillStyle = 'rgb(255, 255, 255)';
            context.font = 'normal 20pt Lobster'
            context.fillText(`power: ${power}`, 10, 560);
            if (playerAngle <= 90 && playerAngle >= -90) {
                context.fillText(`angle: ${playerAngle}°`, 10, 580);
            }
        }

        if (player.x != playerOriginalX && player.y != playerOriginalY) {
            if (player.vX == 0 && player.vY == 0) {
                resetPlayer();
            } else if (player.x + player.radius < 0) {
                resetPlayer();
            } else if (player.x - player.radius > canvasWidth) {
                resetPlayer();
            } else if (player.y + player.radius < 0) {
                resetPlayer();
            } else if (player.y - player.radius > canvasHeight) {
                resetPlayer();
            }
        }

        context.fillStyle = 'rgb(255, 255, 255)';

        let deadAsteroids = new Array();
        let asteroidsLength = asteroids.length;

        for (let i = 0; i < asteroidsLength; i++) {
            let tmpAsteroid = asteroids[i];

            for (let j = i + 1; j < asteroidsLength; j++) {
                let tmpAsteroidB = asteroids[j];

                let dX = tmpAsteroidB.x - tmpAsteroid.x;
                let dY = tmpAsteroidB.y - tmpAsteroid.y;
                let distance = Math.sqrt((dX * dX) + (dY * dY));
                if (distance < tmpAsteroid.radius + tmpAsteroidB.radius) {
                    let angle = Math.atan2(dY, dX);
                    let sine = Math.sin(angle);
                    let cosine = Math.cos(angle);

                    let x = 0;
                    let y = 0;

                    let xB = dX * cosine + dY * sine;
                    let yB = dY * cosine - dX * sine;

                    let vX = tmpAsteroid.vX * cosine + tmpAsteroid.vY * sine;
                    let vY = tmpAsteroid.vY * cosine - tmpAsteroid.vX * sine;

                    let vXb = tmpAsteroidB.vX * cosine + tmpAsteroidB.vY * sine;
                    let vYb = tmpAsteroidB.vY * cosine - tmpAsteroidB.vX * sine;

                    let vTotal = vX - vXb;
                    vX = ((tmpAsteroid.mass - tmpAsteroidB.mass) * vX + 2 * tmpAsteroidB.mass *
                        vXb) / (tmpAsteroid.mass + tmpAsteroidB.mass);
                    vXb = vTotal + vX;

                    xB = x + (tmpAsteroid.radius + tmpAsteroidB.radius);

                    tmpAsteroid.x = tmpAsteroid.x + (x * cosine - y * sine);
                    tmpAsteroid.y = tmpAsteroid.y + (y * cosine + x * sine);
                    tmpAsteroidB.x = tmpAsteroid.x + (xB * cosine - yB * sine);
                    tmpAsteroidB.y = tmpAsteroid.y + (yB * cosine + xB * sine);

                    tmpAsteroid.vX = vX * cosine - vY * sine;
                    tmpAsteroid.vY = vY * cosine + vX * sine;
                    tmpAsteroidB.vX = vXb * cosine - vYb * sine;
                    tmpAsteroidB.vY = vYb * cosine + vXb * sine;
                }
            }

            tmpAsteroid.x += tmpAsteroid.vX;
            tmpAsteroid.y += tmpAsteroid.vY;

            if (Math.abs(tmpAsteroid.vX) > 0.1) {
                tmpAsteroid.vX *= tmpAsteroid.friction;
            } else {
                tmpAsteroid.vX = 0;
            }
            if (Math.abs(tmpAsteroid.vY) > 0.1) {
                tmpAsteroid.vY *= tmpAsteroid.friction;
            } else {
                tmpAsteroid.vY = 0;
            }

            if (!tmpAsteroid.player) {
                let dXp = tmpAsteroid.x - platformX;
                let dYp = tmpAsteroid.y - platformY;
                let distanceP = Math.sqrt((dXp * dXp) + (dYp * dYp));
                if (distanceP > platformOuterRadius) {
                    if (tmpAsteroid.radius > 0) {
                        tmpAsteroid.radius -= 2;
                    } else {
                        deadAsteroids.push(tmpAsteroid);
                    }
                }
            }

            context.beginPath();
            context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }

        let deadAsteroidsLength = deadAsteroids.length;
        if (deadAsteroidsLength > 0) {
            for (let di = 0; di < deadAsteroidsLength; di++) {
                let tmpDeadAsteroid = deadAsteroids[di];
                asteroids.splice(asteroids.indexOf(tmpDeadAsteroid), 1);
            }
        }

        let remaining = asteroids.length - 1;
        uiRemaining.html(remaining);
        if (remaining === 0) {
            // Winner!
            playGame = false;
            uiStats.hide();
            uiComplete.show();
            $(window).unbind("mousedown");
            $(window).unbind("mousemove");
            $(window).unbind("mouseup");
        }

        if (playGame) {
            setTimeout(animate, 33);
        }
    }

    function SaveResult() {
        const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
        let updatePassword;
        let result;
        const stringName = 'YAROTSKIY_BOWLING_RECORDS';

        if (!/^[A-Z][a-z]+$/.test(uiGamerName[0].value)) {
            uiGameResult.html("Only English letters are needed!");
            uiGameResult.show();
            return false;
        }
        uiGameResult.hide();

        updatePassword = Math.random();
        $.ajax({
                url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
                data: {f: 'LOCKGET', n: stringName, p: updatePassword},
                success: lockGetReady, error: errorHandler
            }
        );

        function lockGetReady(callresult) {
            if (callresult.error != undefined)
                alert(callresult.error);
            else {
                result = [];
                if (callresult.result != "") {
                    result = JSON.parse(callresult.result);
                    if (!result.length)
                        result = [];
                }
                result.push({name: uiGamerName[0].value, record: score});

                $.ajax({
                        url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
                        data: {f: 'UPDATE', n: stringName, v: JSON.stringify(result), p: updatePassword},
                        success: updateReady, error: errorHandler
                    }
                );
            }
        }

        function updateReady(callresult) {
            if (callresult.error != undefined)
                console.log(callresult.error);
            uiGameResult.html("Your results have been saved!");
            uiGameResult.show();
        }

        function errorHandler(jqXHR, statusStr, errorStr) {
            alert(statusStr + ' ' + errorStr);
        }
    }

    init();

    //insertSorage();

    function insertSorage() {

        const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
        let updatePassword;
        const stringName = 'YAROTSKIY_BOWLING_RECORDS';
        updatePassword = Math.random();

        $.ajax({
                url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
                data: {f: 'INSERT', n: stringName, p: updatePassword},
                success: updateReady, error: errorHandler
            }
        );

        function updateReady(callresult) {
            if (callresult.error != undefined)
                console.log(callresult.error);
        }

        function errorHandler(jqXHR, statusStr, errorStr) {
            alert(statusStr + ' ' + errorStr);
        }
    }

});