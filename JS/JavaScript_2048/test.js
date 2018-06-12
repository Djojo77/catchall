var map = [];
var clean = [];
var score = 0;
var size = $('.size')[0].value;
var startNumber = 2;


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

var mapper = function mapper(x,y) {
    for (var j=0; j<y; j++) {
        var line = [];
        for (var i=0; i<x; i++) {
            line.push(0);
        }
        map.push(line);
    }
    console.log(map);
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

var randomPop = function() {
    clean = [];
    for (var i=0; i < map.length; i++) {
        for (var j=0; j<map.length; j++) {
            if (map[i][j] == 0) {
                clean.push([i,j]);
            }
        }
    }
    if (clean.length > 0) {
        var random = Math.floor(Math.random() * 100) % clean.length;
        var yPos = clean[random][0];
        var xPos = clean[random][1];
        map[yPos][xPos] = startNumber;
        /*console.log(clean);
        console.log(random);
        console.log('['+yPos+';'+xPos+']');*/
        // reprintMap();
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
            takeAMouv(true,true);
            break;

        case 'right':
            takeAMouv(false,true);
            break;

        case 'up':
            takeAMouv(true,false);
            break;

        case 'down':
            takeAMouv(false,false);
            break;
    }
    randomPop();
    reprintMap();
};

var takeAMouv = function(pNormal, pAxeX) {
    var vA = (pNormal == true) ? 0 : map.length;
    var vB = (vA == 0) ? map.length : 0;
    var fact = (vA == 0) ? 1 : (-1);

    console.log(vA+'-'+vB+'-'+fact);

    for (var i = vA; i < vB; i=i+fact) {
        for (var j = vA; j < vB; j=j+fact) {
            if (pAxeX == true) {

                if (map[i][j] > 0) {
                    var x = j;
                    var value = map[i][j];
                    map[i][x] = 0;

                    var test = (vA == 0) ? (x-1 >= 0 && x-1<map.length) : (x+1 < 0 && x+1>=map.length);
                    var test2 = (vA == 0) ? (map[i][x-1] == 0 || map[i][x-1] == value) : (map[i][x+1] == 0 || map[i][x+1] == value);

                    while (test && test2) {
                        x = (vA == 0) ? x-1 : x+1;
                        // console.log(x);
                        if (map[i][x] == value) {
                            value += value;
                            score += value;
                            map[i][x] = value;
                            break;
                        }
                    }
                    map[i][x] = value;
                }

            } else {

                if (map[j][i] > 0) {
                    var y = j;
                    var value = map[j][i];
                    map[y][i] = 0;

                    var test = (vA == 0) ? (y-1 >= vA) : (y+1 < vA);
                    var test2 = (vA == 0) ? (map[y - (fact)][i] == 0 || map[y - (fact)][i] == value) : (map[y + (fact)][i] == 0 || map[y + (fact)][i] == value);
                    while (test && test2) {
                        y = (vA == 0) ? y - (fact) : y + (fact);
                        console.log('Y');
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
    }
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
        $('.LOST')[0].style.left = '	10%';
        $('.LOST').html(' GAME OVER!');
    }
};

var printScore = function() {
    $('.score').html(score);
};
