var map = [];
var clean = [];
var score = 0;
var size = $('.size')[0].value;
var startNumber = 2;
var pops = 1;
var nb1 = 4;
var nb2 = 2;
var chances = 3; //chances over 4 to pops nb2


window.onload = function() {
    // console.log(1);
    mapper(size,size);
    randomCase(2);
    printMap();
};

$('.size')[0].onchange = function() {
    size = $('.size')[0].value;
    $('.LOST').html('');
    switch (size) {
        case '4':
            map = [];
            $('.bigsquare')[0].style.width = '25em';
            $('.bigsquare')[0].style.height = '25em';
            mapper(size,size);
            randomCase(2);
            $('.row').remove();
            printMap();
            break;
        case '5':
            map = [];
            $('.bigsquare')[0].style.width = '31em';
            $('.bigsquare')[0].style.height = '31em';
            mapper(size,size);
            randomCase(2);
            $('.row').remove();
            printMap();
            break;
        case '6':
            map = [];
            $('.bigsquare')[0].style.width = '37em';
            $('.bigsquare')[0].style.height = '37em';
            mapper(size,size);
            randomCase(2);
            $('.row').remove();
            printMap();
            break;
        case '7':
            map = [];
            $('.bigsquare')[0].style.width = '43em';
            $('.bigsquare')[0].style.height = '43em';
            mapper(size,size);
            randomCase(2);
            $('.row').remove();
            printMap();
            break;
    }
    size = $('.size')[0].value;
};

$('.difficulty')[0].onchange = function() {
	difficulty = $('.difficulty')[0].value;
	$('.LOST').html('');
	switch (difficulty) {
		case '1':
			map = [];
			pops = 1;
			mapper(size,size);
            randomCase(2);
			$('.row').remove();
			printMap();
			break;

		case '2':
			map = [];
			pops = 3;
			nb1 = 8;
			nb2 = 2;
			mapper(size,size);
            randomCase(2);
			$('.row').remove();
            printMap();
			break;

		case '3':
			map = [];
			pops = size*size;
			mapper(size,size);
            randomCase(2);
			$('.row').remove();
            printMap();
			break;

		case '4':
			map = [];
			pops = size*size;
			nb1 = 16;
			nb2 = 2;
			chances = 2;
			mapper(size,size);
            randomCase(2);
			$('.row').remove();
			printMap();
			break;

		case '5':
			map = [];
			startNumber = 2048;
			pops = 1;
			nb1 = 2048;
			nb2 = 4096;
			chances = 3;
			mapper(size,size);
			randomCase(2);
			$('.row').remove();
			printMap();
			break;

		case '6':
			map = [];
			startNumber = 131072;
			pops = 4;
			nb1 = 131072;
			nb2 = 262144;
			chances = 2;
			mapper(size,size);
			randomCase(2);
			$('.row').remove();
			printMap();
			break;

		case '7':
			map = [];
			startNumber = 524288;
			pops = size*size*size;
			nb1 = 1048576;
			nb2 = 524288;
			chances = 2;
			mapper(size,size);
			randomCase(2);
			$('.row').remove();
			printMap();
			break;

	}
};

var mapper = function mapper(x,y) {
	for (var j=0; j<y; j++) {
		var line = [];
		for (var i=0; i<x; i++) {
			line.push(0);
		}
		map.push(line);
	}
	// console.log(map);
};

var printMap = function() {

	var size = map.length;

	for (var j=0; j<size; j++) {
		$('.bigsquare').append('<div class="row '+j+'"></div>');
		for (var i=0; i<size; i++) {
			var value = map[j][i];
			$('.row.'+j).append('<div class="lilsquare '+j+'-'+i+'"></div>');
			if (value > 0) {
				$('.lilsquare.'+j+'-'+i).append('<div class="num num-'+value+'" value="'+j+'-'+i+'">'+value+'</div>');
			}
		}
	}
};

var reprintMap = function() {
	$('.row').remove();
	printMap();
    hasLost();
};

var randomCase = function(nb) {
    var i = 1;
    while (i <= nb) {
        var x = Math.round((Math.random()) * 10 / 4);
        var y = Math.round((Math.random()) * 10 / 4);
        map[x][y] = startNumber;
        i++;
    }
};

var randomPop = function(nb) {

    for (var cnt = 1; cnt<=nb; cnt++) {
        clean = [];
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map.length; j++) {
                if (map[i][j] == 0) {
                    clean.push([i, j]);
                }
            }
        }
        ranVal = Math.ceil(Math.random() * 4);
        value = (ranVal > chances) ? nb1 : nb2;
        if (clean.length > 0) {
            var random = Math.floor(Math.random() * 100) % clean.length;
            var yPos = clean[random][0];
            var xPos = clean[random][1];
            map[yPos][xPos] = value;
            /*console.log(clean);
            console.log(random);
            console.log('['+yPos+';'+xPos+']');*/
            // reprintMap();
        }
    }
};

window.onkeydown = function(pE) {
	var value = pE.keyCode;
	switch (value) {
		case 37: // left
            if (!checkMouv('left')) {
                mouv('left');
            }
			break;
		case 38: // up
            if (!checkMouv('up')) {
                mouv('up');
            }
            break;
		case 39: // right
            if (!checkMouv('right')) {
                mouv('right');
            }
            break;
		case 40: // down
            if (!checkMouv('down')) {
                mouv('down');
            }
            break;
	}
	printScore();
	console.log(map);
};

var mouv = function($direction) {

	switch ($direction) {
        case 'left':
            for (var i = 0; i < map.length; i++) {
                for (var j = 0; j < map.length; j++) {
                    if (map[i][j] > 0) {
                        var x = j;
                        var value = map[i][j];
                        map[i][j] = 0;
                        while (x - 1 >= 0 && (map[i][x - 1] == 0 || map[i][x - 1] == value)) {
                            x--;
                            if (map[i][x] == value) {
                                value += value;
                                score += value;
                                map[i][x] = value;
                                break;
                            }
                        }
                        map[i][x] = value;
                    }
                }
            }
            break;

        case 'right':
            for (var i = map.length-1 ; i >= 0; i--) {
                for (var j = map.length-1 ; j >= 0; j--) {
                    if (map[i][j] > 0) {
                        var x = j;
                        var value = map[i][j];
                        map[i][j] = 0;
                        while (x + 1 < map.length && (map[i][x + 1] == 0 || map[i][x + 1] == value)) {
                            x++;
                            if (map[i][x] == value) {
                                value += value;
                                score += value;
                                map[i][x] = value;
                                break;
                            }
                        }
                        map[i][x] = value;
                    }
                }
            }
            break;

        case 'up':
            for (var i = 0; i<map.length; i++) {
            	for (var j = 0; j<map.length; j++) {
                    if (map[j][i] > 0) {
                        var y = j;
                        var value = map[j][i];
                        map[j][i] = 0;
                        while (y - 1 >= 0 && (map[y - 1][i] == 0 || map[y - 1][i] == value)) {
                            y--;
                            if (map[y][i] == value) {
                                value += value;
                                score += value;
                                map[y][i] = value;
                                break;
                            }
                        }
                        map[y][i] = value;
                    }
				}
			}
            break;

        case 'down':
            for (var i = map.length-1; i>=0; i--) {
                for (var j = map.length-1; j>=0; j--) {
                    if (map[j][i] > 0) {
                        var y = j;
                        var value = map[j][i];
                        map[j][i] = 0;
                        while (y + 1 < map.length && (map[y + 1][i] == 0 || map[y + 1][i] == value)) {
                            y++;
                            if (map[y][i] == value) {
                                value += value;
                                score += value;
                                map[y][i] = value;
                                break;
                            }
                        }
                        map[y][i] = value;
                    }
                }
            }
            break;
    }
    randomPop(pops);

	reprintMap();
};

var checkMouv = function($direction) {
	var checkLose = true;

    switch ($direction) {
        case 'left':
            for (var i = 0; i < map.length; i++) {
                for (var j = 0; j < map.length; j++) {
                    if (map[i][j] > 0) {
                        var x = j;
                        var value = map[i][j];
                        if (x - 1 >= 0 && (map[i][x - 1] == 0 || map[i][x - 1] == value)) {
                            checkLose = false;
                        }
                    }
                }
            }
            return checkLose;

        case 'right':
            for (var i = map.length-1 ; i >= 0; i--) {
                for (var j = map.length-1 ; j >= 0; j--) {
                    if (map[i][j] > 0) {
                        var x = j;
                        var value = map[i][j];
                        if (x + 1 < map.length && (map[i][x + 1] == 0 || map[i][x + 1] == value)) {
                            checkLose = false;
                        }
                    }
                }
            }
            return checkLose;

        case 'up':
            for (var i = 0; i<map.length; i++) {
                for (var j = 0; j<map.length; j++) {
                    if (map[j][i] > 0) {
                        var y = j;
                        var value = map[j][i];
                        if (y - 1 >= 0 && (map[y - 1][i] == 0 || map[y - 1][i] == value)) {
                            checkLose = false;
                        }
                    }
                }
            }
            return checkLose;

        case 'down':
            for (var i = map.length-1; i>=0; i--) {
                for (var j = map.length-1; j>=0; j--) {
                    if (map[j][i] > 0) {
                        var y = j;
                        var value = map[j][i];
                        if (y + 1 < map.length && (map[y + 1][i] == 0 || map[y + 1][i] == value)) {
                            checkLose = false;
                        }
                    }
                }
            }
            return checkLose;
    }
};

var hasLost = function() {
	var lost = [];
	if (checkMouv('left')) {
		lost.push('left')
    }
    if (checkMouv('right')) {
        lost.push('right')
    }
    if (checkMouv('up')) {
        lost.push('up')
    }
    if (checkMouv('down')) {
        lost.push('down')
    }
	// console.log(lost);
	var test = (lost.length == 4);
    if (test) {
		// alert('Game Over : You have lost');
		$('.LOST')[0].style.height = '90%';
		$('.LOST')[0].style.width = '90%';
		$('.LOST')[0].style.left = '10%';
		$('.LOST').html(' GAME OVER!');
    }
};

var printScore = function() {
	$('.score').html(score);
};
