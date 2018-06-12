$(window).ready(function () {
    let paint = $('#paint');
    let sizeInput = $('#size');

    let x;
    let y;
    let size = 1;
    let interval;
    let start = null;

    paint.mousemove(function (e) {
        x = e.clientX - $(this).offset().left;
        y = e.clientY - $(this).offset().top;
    });
    paint.on('mousedown' ,function (e) {

        let ctx = this.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineJoin = ctx.lineCap = 'round';

        if (start === null) start = [x, y];

        ctx.moveTo(start[0],start[1]);
        if (start !== null) {
            interval = setInterval(function () {
                ctx.lineWidth = size;
                ctx.lineTo(x, y);
                ctx.stroke();
            }, 1);
        }
        start = null;
    });

    let clearInterval = function () {
        clearTimeout(interval);
        start = null;
    };

    let setSize = function () {
        size = (sizeInput.val() !== '') ? sizeInput.val() : 1;
    };

    $('#sizeButton')[0].addEventListener('click', setSize);
    paint.on('mouseup' , clearInterval);
    paint.mouseleave(clearInterval);



});