/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        deadShips: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            var self = this;
            var blast = new Audio('blast.mp3');
            blast.play();

            setTimeout(function() {
                var fall = new Audio('fall.mp3');
                fall.play();
            }, 500);

            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            setTimeout(function() {
                self.game.fire(self, col, line, _.bind(function (hasSucced) {
                    self.tries[line][col] = hasSucced;
                    self.game.renderMap();
                }, self));
            },3300);
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var self = this;
            var succeed = false;
            var val = this.grid[line][col];

            if (val !== 0) {
                this.fleet.forEach(function (ship) {
                    if (ship.id === val) {
                        ship.setLife((ship.life - 1));
                        if (ship.getLife() <= 0) {
                            self.deadShips += 1;
                        }
                    }
                });
                succeed = true;
                this.grid[line][col] = 'touched';
            }
            callback.call(this, succeed);
            this.game.renderMiniMap();
        },

        setActiveShipPosition: function (x, y, direction) { // direction = 1 -> vertical;
            var ship = this.fleet[this.activeShip];
            x = (direction) ? x : Math.ceil(x - ship.getLife()/2);
            y = (direction) ? Math.ceil(y - ship.getLife()/2) : y;

            if ((x < 0 || x > 9) || (y < 0 || y > 9)) {
                return false;
            }

            for (var j=0; j < ship.getLife(); j++) {
                if ( (y + j*direction) > 9 || (x + j*(!direction)) > 9 || this.grid[y + j*direction][x + j*(!direction)] !== 0) {
                    return false;
                }
            }

            var i = 0;
            while (i < ship.getLife()) {
                this.grid[y + i*direction][x + i*(!direction)] = ship.getId();
                i += 1;
            }
            return true;
        },

        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    /*var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                    if (val === true) {
                        node.style.background = 'url(img/explosion.png) no-repeat';
                        node.style.backgroundSize = '100% 100%';
                    } else if (val === false) {
                        node.style.background = 'url(img/splash.jpg) no-repeat';
                        node.style.backgroundSize = '100% 100%';
                    }*/ // No longer usefull -> animation done while receiving or giving damage (game.fire())
                });
            });
        },
        renderShips: function (grid, computer) {
            this.fleet.forEach(function(ship) {
                grid.innerHTML += ship.dom.outerHTML;
            });

            computer.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                    if (val === true) {
                        node.style.background = 'url(img/explosion.png) no-repeat';
                        node.style.backgroundSize = '100% 100%';
                    }
                });
            });

        },
        setGame: function(pGame) {
            this.game = pGame;
        }
    };

    global.player = player;

}(this));