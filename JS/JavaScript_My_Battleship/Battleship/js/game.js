/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_FIRST: "PHASE_INIT_FIRST",
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,
        P1: 0,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,
        help: null,

        // liste des joueurs
        players: [],

        direction: null,
        enable: true,
        gameOver: false,

        // lancement du jeu
        init: function () {
            self = this;

            if (this.P1 > 1) {
                this.P1 = Math.floor(Math.random() * 2);
                // this.P1 = 0;
            }

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');
            this.direction = false;

            this.help = document.querySelector('#help');

            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                // this.PHASE_INIT_FIRST,
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 1;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }

            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if (!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                        this.goNextPhase();
                        break;
                    }

                case this.PHASE_INIT_FIRST:
                    break;

                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");
                    this.players[1].areShipsOk(function () {
                        self.stopWaiting();
                        self.currentPhase = (!self.P1) ? self.currentPhase : self.phaseOrder[2];
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("A vous de jouer, choisissez une case !");
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    self.P1 = (self.P1) ? 0 : self.P1;
                    this.players[1].play();
                    break;
            }

        },
        gameIsOver: function () {
            return this.gameOver;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu', _.bind(this.handleRightClick, this));
            this.help.addEventListener('click', _.bind(this.hint, this));
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau

            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                if (!this.direction) {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                } else {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode) - Math.floor((ship.getLife() / 2)) ) * utils.CELL_SIZE + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE + "px";
                }
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    // var test = (this.direction) ? this.players[0].setActiveShipPositionY(utils.eq(e.target), utils.eq(e.target.parentNode)) : this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode));
                    // if (test) {
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode), this.direction)) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        } else {
                            if (this.direction) {
                                var ship = this.players[0].fleet[this.players[0].activeShip];
                                var store = ship.dom.style.height;
                                ship.dom.style.height = ship.dom.style.width;
                                ship.dom.style.width = store;
                                ship.dom.style.top = store;
                            }
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                }
            }
        },
        handleRightClick: function(e) {
            e.preventDefault();
            if (!this.waiting) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                var store = ship.dom.style.height;
                ship.dom.style.height = ship.dom.style.width;
                ship.dom.style.width = store;
                this.direction = !this.direction;
                ship.dom.style.top = (!this.direction)
                    ? "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE + "px"
                    : "" + (utils.eq(e.target.parentNode) - Math.floor((ship.getLife() / 2))) * utils.CELL_SIZE + "px";
                ship.dom.style.left = (!this.direction)
                    ? "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px"
                    : "" + utils.eq(e.target) * utils.CELL_SIZE + "px";
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            var currentPlayer = this.players.indexOf(from) === 0
                ? this.players[0]
                : this.players[1];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }
            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            var boom = new Audio('Boom.mp3');
            var plouf = new Audio('plouf.mp3');

            target.receiveAttack(col, line, function (hasSucceed) {
                var node = self.grid.querySelector('.row:nth-child(' + (line+1) + ') .cell:nth-child(' + (col+1) + ')');

                if (currentPlayer.tries[line][col] === 0) {
                    if (hasSucceed) {
                        msg += "Touché !";
                        boom.play();

                        if (self.players.indexOf(from) === 0) {
                            node.style.background = 'url(img/explosion.gif) no-repeat';
                            node.style.backgroundSize = '100% 100%';
                            setTimeout(function () {
                                node.style.background = 'url(img/explosion.png) no-repeat';
                                node.style.backgroundSize = '100% 100%';
                            }, 500);
                        }

                    } else {
                        msg += "Manqué...";

                        if (self.players.indexOf(from) === 0) {
                            plouf.play();
                            node.style.background = 'url(img/splash.gif) no-repeat';
                            node.style.backgroundSize = '100% 100%';
                            setTimeout(function () {
                                node.style.background = 'url(img/splash.jpg) no-repeat';
                                node.style.backgroundSize = '100% 100%';
                            }, 500);
                        }
                    }
                } else {
                    msg += (currentPlayer.tries[line][col] === true) ? 'Déjà touché' : 'Déjà raté';
                    hasSucceed = false;
                }
                self.checkFleet();
                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaquef

                callback(hasSucceed);
                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                if (self.players[0].deadShips >= self.players[0].fleet.length) {
                    console.log('GAME OVER');
                    self.gameOver = true;
                    return;
                } else if (self.players[1].deadShips >= self.players[1].fleet.length) {
                    console.log('CONGRATULATION');
                    self.gameOver = true;
                    return;
                }
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 500);
            });

        },
        checkFleet: function() {
            var fleet = this.players[0].fleet;
            fleet.forEach(function(ship) {
                if (ship.life <= 0) {
                    var shipName = ship.getName().toLowerCase();
                    document.getElementsByClassName('ship '+shipName)[0].classList.add('sunk');

                }
            });
        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            this.players[0].renderShips(this.miniGrid, this.players[1]);
        },

        hint: function() {
            if (this.currentPhase === this.phaseOrder[2]) {
                var validTargets = [];
                var computerGrid = this.players[1].grid;
                computerGrid.forEach(function (line, y) {
                    line.forEach(function (col, x) {
                        if (col !== 0 && col !== 'touched') {
                            validTargets.push([y, x]);
                        }
                    });
                });
                var target = validTargets[Math.floor(Math.random() * validTargets.length)];

                var offsetY = (Math.floor(Math.random() * 2) && (target[0] - 1) >= 0 || !(target[0] + 1 <= 10)) ? -1 : 1;
                var offsetX = (Math.floor(Math.random() * 2) && (target[1] - 1) >= 0 || !(target[1] + 1 <= 10)) ? -1 : 1;

                var hintTarget = [target[0] + offsetY * Math.floor(Math.random() * 2),
                    target[1] + offsetX * Math.floor(Math.random() * 2)
                ];

                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        if (hintTarget[0] + i >= 0 && hintTarget[0] + i < 9 && hintTarget[1] + i >= 0 && hintTarget[1] + i < 9) {
                            var node = this.grid.querySelector('.row:nth-child(' + (hintTarget[0] + 1 + i) + ') .cell:nth-child(' + (hintTarget[1] + 1 + j) + ')');
                            node.classList.add('hinted');
                        }
                    }
                }
            }
        }
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        var confirmP1 = document.querySelector('#confirmP1');
        var modal = document.querySelector('#p1Modal');

        confirmP1.onclick = function() {
            game.P1 = parseInt(document.querySelector('#selectP1').value);
            modal.style.display = 'none';
            game.init();
        };
    });

}());