let lastX, lastY;
let lastXSym, lastYSym;
let ctx;
let fill = false;
let eraser = false;

let mousePressed = false;
let moved = false;
let isFirst = true;
let symetricX = false;
let symetricY = false;

let canvasWidth;
let canvasHeight;
let canvasCount = 0;

let mode = 'draw';


$(document).ready(function() {
    canvasWidth = $('#canvasContainer').width();
    canvasHeight = $('#canvasContainer').height();

    $('#eraseAll').click(function () {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        mousePressed = false;
        moved = false;
        isFirst = true;
    });
    $('#download').on('click', function (e) {
        let dataURL;
        $('#canvasContainer').children().each(function () {
            dataURL = this.toDataURL('image/png');
        });
        this.href = dataURL;
    });

    $('#symetricX').click(function () { symetricX = this.checked; });
    $('#symetricY').click(function () { symetricY = this.checked; });

    $('#eraser').click(function () { eraser = (this.checked) ? true : false;});
    $('#draw').click(function () { mode = 'draw'; console.log(mode)});
    $('#rectangle').click(function () { mode = 'rectangle'; console.log(mode)});
    $('#circle').click(function () { mode = 'circle'; console.log(mode)});
    $('#link').click(function () { mode = 'link'; isFirst = true; console.log(mode)});
    $('#line').click(function () { mode = 'link'; isFirst = true; console.log(mode)});
    $('#fill').click(function () { fill = (this.checked) ? true : false; console.log(fill);});

    $('#addLayer').click(function() {
        addLayer();
        $('.seeLayers').click(function() { seeLayer(this) });
        $('.removeLayers').click(function() { removeLayer(this) });
        $('.moveLayers').click(function() { moveLayer(this); });
        $('.activeLayers').click(function() { activeLayer(this); });
        $('#download').on('click', function (e) {
            let dataURL;
            $('#canvasContainer').children().each(function () {
                dataURL = this.toDataURL('image/png');
            });
            this.href = dataURL;
        });
    });
    $('.seeLayers').click(function() { seeLayer(this); });
    $('.removeLayers').click(function() { removeLayer(this); });
    $('.moveLayers').click(function() { moveLayer(this); });
    $('.activeLayers').click(function() { activeLayer(this); });
    $('#size').on( 'input' ,function() { $('#sizeValue').html(this.value); } );
    canvasCount = $('#canvasContainer').children().length;
    $('canvas').each(function () {
        init(this.id);
    });

    $('.collapse_sidebar').click(function() { hideSidebar(this); });

});

function init(paint) {
    console.log(paint);
    ctx = $('#'+paint)[0].getContext("2d");

    $('#'+paint).mousedown(function(e) {
        mousePressed = true;
        switch (mode) {
            case 'draw':
                Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
                break;
            case 'rectangle':
                rectangle(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top);
                break;
            case 'circle':
                circle(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top);
                break;
            case 'link':
                link(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top);
                break;
        }
    });
    $('#'+paint).mousemove(function(e) {
        if (mousePressed && mode === 'draw') {
            moved = true;
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });
    $('#'+paint).mouseup(function(e) {
        if (mousePressed && !moved && mode === 'draw') {

            let radius = $('#size').val()/2;
            ctx.strokeStyle = $('#color').val();
            ctx.lineJoin = "round";
            ctx.beginPath();
            if (eraser) { ctx.globalCompositeOperation = "destination-out"; } else { ctx.globalCompositeOperation = "source-over"; }
            ctx.moveTo(lastX, lastY);
            ctx.arc(lastX, lastY, radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
            if (symetricY || symetricX) {
                let lastX2 = (symetricX) ? lastXSym : lastX;
                let lastY2 = (symetricY) ? lastYSym : lastY;
                let radius = $('#size').val()/2;
                ctx.strokeStyle = $('#color').val();
                ctx.lineJoin = "round";
                ctx.beginPath();
                if (eraser) { ctx.globalCompositeOperation = "destination-out"; } else { ctx.globalCompositeOperation = "source-over"; }
                ctx.moveTo(lastX2, lastY2);
                ctx.arc(lastX2, lastY2, radius, 0, 2*Math.PI);
                ctx.closePath();
                ctx.fill();
            }
        }
        mousePressed = false;
        moved = false;

    });
    $('#'+paint).mouseleave(function(e) {
        mousePressed = false;
        moved = false;
    });

    $('#download').on('click', function (e) {
        let dataURL = $('#'+paint)[0].toDataURL('image/png');
        this.href = dataURL;
    });

}

//--------------------------------------- DRAW ---------------------------------------------

function Draw(x, y, isDown) {
    if (isDown) {
        ctx.strokeStyle = $('#color').val();
        ctx.lineWidth = $('#size').val();
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
        if (symetricX || symetricY) {
            symDraw(x, y);
        }
    }
    lastXSym = (symetricX) ? canvasWidth - x : x;
    lastYSym = (symetricY) ? canvasHeight - y : y;
    lastX = x; lastY = y;
}
function symDraw(x, y) {
    let x2 = (symetricX) ? canvasWidth - x : x;
    let y2 = (symetricY) ? canvasHeight - y : y;
    ctx.beginPath();
    ctx.strokeStyle = $('#color').val();
    ctx.lineWidth = $('#size').val();
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
    ctx.moveTo(lastXSym, lastYSym);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

//--------------------------------------- RECTANGLE ---------------------------------------------

function rectangle(x, y) {
    ctx.strokeStyle = $('#color').val();
    ctx.fillStyle = $('#color').val();
    ctx.lineWidth = $('#size').val();
    ctx.lineJoin = "round";
    if (!isFirst) {
        let width = x - lastX;
        let height = y - lastY;
        ctx.beginPath();
        ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
        ctx.rect(lastX, lastY, width, height);
        if (fill) { ctx.fill(); }
        ctx.closePath();
        ctx.stroke();
        if (symetricX || symetricY) {
            symRect(x, y);
        }
        isFirst = true;
    } else {
        isFirst = false;
    }
    lastXSym = (symetricX) ? canvasWidth - x : x;
    lastYSym = (symetricY) ? canvasHeight - y : y;
    lastX = x; lastY = y;
}
function symRect(x, y) {
    let x2 = (symetricX) ? canvasWidth - x : x;
    let y2 = (symetricY) ? canvasHeight - y : y;
    let width = x2 - lastXSym;
    let height = y2 - lastYSym;
    ctx.beginPath();
    ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
    ctx.rect(lastXSym, lastYSym, width, height);
    if (fill) { ctx.fill(); }
    ctx.closePath();
    ctx.stroke();
}

//--------------------------------------- CIRCLE ---------------------------------------------

function circle(x, y) {
    ctx.strokeStyle = $('#color').val();
    ctx.fillStyle = $('#color').val();
    ctx.lineWidth = $('#size').val();
    ctx.lineJoin = "round";
    if (!isFirst) {
        let radius = Math.sqrt(Math.pow(x-lastX,2) + Math.pow(y-lastY,2));
        ctx.beginPath();
        ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
        ctx.arc(lastX, lastY, radius, 0, 2*Math.PI);
        if (fill) { ctx.fill(); }
        ctx.closePath();
        ctx.stroke();
        if (symetricX || symetricY) {
            symCircle(x, y);
        }
        isFirst = true;
    } else {
        isFirst = false;
    }
    lastXSym = (symetricX) ? canvasWidth - x : x;
    lastYSym = (symetricY) ? canvasHeight - y : y;
    lastX = x; lastY = y;
}
function symCircle(x, y) {
    let x2 = (symetricX) ? canvasWidth - x : x;
    let y2 = (symetricY) ? canvasHeight - y : y;
    let radius = Math.sqrt(Math.pow(x2 - lastXSym, 2) + Math.pow(y2 - lastYSym, 2));
    ctx.beginPath();
    ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
    ctx.arc(lastXSym, lastYSym, radius, 0, 2*Math.PI);
    if (fill) { ctx.fill(); }
    ctx.closePath();
    ctx.stroke();
}

//--------------------------------------- LINK ---------------------------------------------

function link(x, y) {
    ctx.strokeStyle = $('#color').val();
    ctx.fillStyle = $('#color').val();
    ctx.lineWidth = $('#size').val();
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (!isFirst) {
        ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
        if (symetricX || symetricY) {
            symLink(x, y);
        }
        if ($('#line')[0].checked) {
            isFirst = true;
        }
    } else {
        isFirst = false;
    }
    lastXSym = (symetricX) ? canvasWidth - x : x;
    lastYSym = (symetricY) ? canvasHeight - y : y;
    lastX = x; lastY = y;
}
function symLink(x, y) {
    let x2 = (symetricX) ? canvasWidth - x : x;
    let y2 = (symetricY) ? canvasHeight - y : y;
    ctx.beginPath();
    ctx.globalCompositeOperation = (eraser) ? "destination-out" : "source-over";
    ctx.moveTo(lastXSym, lastYSym);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

//--------------------------------------- LAYERS ---------------------------------------------

function addLayer() {
    let cnt = $('.canvasLayer').length;
    $('#layerContainer').append('' +
        '<div class="canvasLayer" id="layer-'+(cnt+1)+'">'
        +   '<h3>layer '+(cnt+1)+'</h3>'
        +   '<div class="float-left">'
        +   '   <div>'
        +   '       <input type="radio" name="active" data-target="paint-'+(cnt+1)+'" id="activeLayer-'+(cnt+1)+'" class="activeLayers" checked>'
        +   '       <label for="activeLayer-'+(cnt+1)+'">Active</label>'
        +   '   </div>'
        +   '   <div>'
        +   '       <input type="checkbox" id="see-'+(cnt+1)+'" class="seeLayers" data-target="paint-'+(cnt+1)+'" checked>'
        +   '       <label for="see-'+(cnt+1)+'">Visible</label>'
        +   '   </div>'
        +   '   <button type="button" class="moveLayers" data-target="layer-'+(cnt+1)+'" value="up">Up</button>'
        +   '   <button type="button" class="moveLayers" data-target="layer-'+(cnt+1)+'" value="down">Down</button>'
        +   '</div>'
        +   '<input type="button" class="removeLayers" data-target="paint-'+(cnt+1)+'" value="remove">'
        +'</div>');
    $('#canvasContainer').append('<canvas id="paint-'+(cnt+1)+'" class="visible" width="1000" height="700"></canvas>');
    init('paint-'+(cnt+1));
}

function removeLayer(self) {
    let target = self.getAttribute('data-target');
    let cnt = target.substr(-1);

    $('#'+target).remove();
    $('#layer-'+cnt).remove();

    if ($('#canvasContainer').children().length > 0) {
        let theLast = $('.visible')[$('.visible').length - 1];
        init(theLast.id);
    }
}

function moveLayer(self) {
    let target = self.getAttribute('data-target');
    let cnt = target.substr(-1);
    let direction = self.value;
    let index = jQuery.inArray($('#'+target)[0], $('#layerContainer').children());
    let theLast = $('.visible')[$('.visible').length - 1];

    console.log(1);

    if ($('#layerContainer').children().length > 1) {
        console.log(2);

        if (direction === 'up' && index > 0) {

            console.log('if');

            $('#'+target).insertBefore($('#layerContainer').children()[index - 1]);
            $('#paint-'+cnt).insertBefore($('#canvasContainer').children()[index - 1]);

            init(theLast.id);

        } else if (direction === 'down' && index < $('#layerContainer').children().length-1) {

            console.log('else');
            console.log($('#layerContainer').children()[index + 1]);

            $('#'+target).insertAfter($('#layerContainer').children()[index+1]);
            $('#paint-'+cnt).insertAfter($('#canvasContainer').children()[index+1]);

            init(theLast.id);
        }
    }
};

function seeLayer(self) {
    let target = self.getAttribute('data-target');
    if (!self.checked) {

        $('#'+target).removeClass('visible');
        $('#'+target).addClass('invisible');

        if ($('.visible').length > 0) {
            let theLast = $('.visible')[$('.visible').length - 1];
            init(theLast.id);
        }
    } else {
        $('#' + target).removeClass('invisible');
        $('#' + target).addClass('visible');

        let theLast = $('.visible')[$('.visible').length - 1];
        init(theLast.id);
    }
}

function activeLayer(self) {
    let target = self.getAttribute('data-target');
    init(target);
}

function hideSidebar(self) {
    let target = self.getAttribute('data-target');
    let value = self.getAttribute('data-value');
    self.setAttribute('data-value', (value == 0) ? 1 : 0);
    self.innerHTML = (value == 0) ? '<p>>></p>' : '<p><<</p>';
    $('#'+target).toggleClass('hide');
}