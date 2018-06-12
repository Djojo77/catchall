$(window).ready(function () {
    let paint = $('#paint');
    let sizeInput = $('#size');
    let ctx = paint[0].getContext('2d');
    let start;

    let click = [];
    let clickDrag = [];
    let clickSize = [];
    let colors = [];
    let modes = [];

    let size = 5;
    let eraser = false;
    let mode = 'draw';

    $('#eraseAll').click(function () {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        click = [];
        clickDrag = [];
        clickSize = [];
        colors = [];
    });

    $('#eraser').click(function () { eraser = !eraser; });
    $('#draw').click(function () { mode = 'draw'; });
    $('#rectangle').click(function () { mode = 'rectangle'; console.log(mode)});
    $('#circle').click(function () { mode = 'circle'; });

    paint.mousedown(function(e) {
        // let mouseX = e.pageX - this.offsetLeft;
        // let mouseY = e.pageY - this.offsetTop;
        start = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        redraw();
    });
    paint.mousemove(function(e) {
        if(start && mode === 'draw'){
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    });
    paint.mouseup(function(e) {
        start = false;
    });
    paint.mouseleave(function(e) {
        start = false;
    });

    function addClick(x, y, dragging) {
        click.push([x,y]);
        clickSize.push(sizeInput.val());
        colors.push((!eraser) ? $('#color').val() : '#fff');
        clickDrag.push(dragging);
        modes.push(mode);
    }

    function redraw() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.lineJoin = "round";
        for(let i=0; i < click.length; i++) {
            switch (modes[i]) {
                case 'draw':
                    draw(i);
                    break;
                case 'rectangle':
                    rectangle(i,start);
                    break;
            }
        }
    }

    function draw(i) {
        ctx.beginPath();
        if (clickDrag[i] && i) {
            ctx.moveTo(click[i-1][0], click[i-1][1]);
        } else {
            ctx.moveTo(click[i][0]-1, click[i][1]);
        }
        ctx.lineTo(click[i][0], click[i][1]);
        ctx.closePath();
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = clickSize[i];
        ctx.stroke();
    }
    function rectangle(i) {
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = 0;

        if (clickDrag[i] && i) {

        } else {

        }

        // ctx.rect(20,20,150,100);
        // ctx.stroke();
    }

});