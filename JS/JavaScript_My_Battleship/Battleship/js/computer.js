/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        initialImpact: null,
        lastTouched: null,
        lastDirection: null,
        tryFire: 0,
        otherSide: 0,
        secondImpact: false,
        game: null,
        play: function () {
            var self = this;

            setTimeout(function () {
                // console.log('looking, lastTouched :'+self.lastTouched+', I.I :'+self.initialImpact);
                var xPos = 0;
                var yPos = 0;

                if (self.initialImpact === null && self.lastTouched === null && self.lastDirection === null && !self.otherSide) {
                    // console.log('shooting random');
                    var possibleTarget = self.checkTargets();
                    var randomTarget = Math.floor(Math.random() * possibleTarget.length);
                    var targetArea = possibleTarget[randomTarget];
                    yPos = targetArea[0];
                    xPos = targetArea[1];
                }

                if (self.initialImpact !== null && self.lastTouched !== null && self.lastDirection !== null) {
                    // console.log('axe is known, lastDirection :'+self.lastDirection+', otherSide :'+self.otherSide);

                    var factor = (self.otherSide) ? -1 : 1;
                    var test = ( (self.lastTouched[0] - (self.lastDirection * factor)) >= 0 && self.lastTouched[0] - (self.lastDirection * factor) < 9);
                    var test2 = ( (self.lastTouched[1] - (!self.lastDirection * factor)) >= 0 && self.lastTouched[1] - (!self.lastDirection * factor) < 9);
                    if (test && test2) {
                        yPos = self.lastTouched[0] - (self.lastDirection * factor);
                        xPos = self.lastTouched[1] + (!self.lastDirection * factor);
                    } else {
                        self.lastTouched = self.initialImpact;
                        self.otherSide = true;
                        factor = (self.otherSide) ? -1 : 1;
                        yPos = self.lastTouched[0] - (self.lastDirection * factor);
                        xPos = self.lastTouched[1] + (!self.lastDirection * factor);
                    }
                    // console.log('yPos : '+yPos);
                    // console.log('xPos : '+xPos);

                } else if (self.initialImpact !== null && self.lastDirection === null) {
                    /* yPos = self.initialImpact[0] + 1;
                     xPos = self.initialImpact[1] + 1;*/
                    var target = self.checkFire();
                    yPos = target[0];
                    xPos = target[1];
                    // console.log(yPos);
                    // console.log(xPos);
                }

                self.game.fire(this, xPos, yPos, function (hasSucced) {
                    self.tries[yPos][xPos] = hasSucced;
                    if (hasSucced) {
                        // console.log('impact');
                        if (self.initialImpact !== null && self.lastDirection === null) {
                            // console.log('2nd impact, setting axe for next shot');

                            self.lastDirection = (self.tryFire === 1 || self.tryFire === 3) ? 1 : 0;
                            self.otherSide = (self.tryFire === 3 || self.tryFire === 4);

                            // console.log('setting lastDirection : '+self.lastDirection);
                            // console.log('setting otherSide : '+self.otherSide);
                        }
                        self.initialImpact = (self.initialImpact !== null) ? self.initialImpact : [yPos, xPos];
                        self.lastTouched = [yPos, xPos];
                        // console.log(self.initialImpact);
                    } else if (!hasSucced && self.lastTouched !== null && self.lastDirection !== null && !self.otherSide) {
                        // console.log('missed, try the other side from initial impact if not already done');
                        // console.log('setting lastTouched to II');
                        self.lastTouched = self.initialImpact;
                        self.otherSide = true;
                    } else if ((!hasSucced && self.lastTouched !== null && self.otherSide) || self.tryFire >= 4) {
                        // console.log('missed');

                        self.tryFire = 0;
                        self.lastTouched = null;
                        self.initialImpact = null;
                        self.lastDirection = null;
                        self.otherSide = false;
                    }
                });
            }, 500);
        },

        checkFire: function() {
            var yPos = 0;
            var xPos = 0;
            var self = this;
            self.tryFire++;

            // console.log('shot around, lastTouched :'+self.lastTouched+', I.I :'+self.initialImpact);
            // console.log('tryfire[1] : '+self.tryFire);

            switch (self.tryFire) {
                case 1:
                    // console.log('shot up');
                    if (self.initialImpact[0] - 1 >= 0 && self.initialImpact[0] - 1 < 10) {
                        yPos = self.initialImpact[0] - 1;
                        xPos = self.initialImpact[1];
                    } else {
                        // console.log('recursive');
                        self.checkFire();
                    }
                    break;
                case 2:
                    // console.log('shot right');
                    if (self.initialImpact[1] + 1 >= 0 && self.initialImpact[1] + 1 < 10) {
                        yPos = self.initialImpact[0];
                        xPos = self.initialImpact[1] + 1;
                    } else {
                        // console.log('recursive');
                        self.checkFire();
                    }
                    break;
                case 3:
                    // console.log('shot down');
                    if (self.initialImpact[0] + 1 >= 0 && self.initialImpact[0] + 1 < 10) {
                        yPos = self.initialImpact[0] + 1;
                        xPos = self.initialImpact[1];
                    } else {
                        // console.log('recursive');
                        self.checkFire();
                    }
                    break;
                case 4:
                    // console.log('shot left');
                    if (self.initialImpact[1] - 1 >= 0 && self.initialImpact[1] - 1 < 10) {
                        yPos = self.initialImpact[0];
                        xPos = self.initialImpact[1] - 1;
                    } else {
                        // console.log('recursive');
                        self.checkFire();
                    }
                    break;
            }
            // console.log('bruh : '+[yPos, xPos]);
            // console.log('-------------------');
            return [yPos, xPos];
        },
        cheated: function() {
            var player = this.game.players[0];
            var grid = player.grid;
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 10; j++) {
                    if (grid[i][j] !== 0 && grid[i][j] !== 'touched') {
                        return [i,j];
                    }
                }
            }
        },
        checkTargets: function () {
            var self = this;
            var possibleTarget = [];
            self.tries.forEach(function (line, nline) {
                line.forEach(function (col, ncol) {
                    if (self.tries[nline][ncol] === 0) {
                        possibleTarget.push([nline,ncol]);
                    }
                });
            });
            return possibleTarget;
        },
        areShipsOk: function (callback) {
            var self = this;
            var activatedShip = 0;
            
            while (activatedShip < self.fleet.length) {

                var x = Math.floor(Math.random() * 10);
                var y = Math.floor(Math.random() * 10);
                var direction = Math.floor(Math.random() * 2);

                if (self.setActiveShipPosition(x,y,direction)) {
                    activatedShip++;
                    self.activeShip++;
                }
            }

            if (activatedShip >= 4) {
                // console.log(this.grid);
                callback();
            }
        }
    });

    global.computer = computer;

}(this));