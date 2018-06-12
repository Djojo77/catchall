$(function() {
    let socket = io();
    $('form').submit(function () {
        socket.emit('vberfixbvjhdk', { user:$('#user_id').text(), msg:$('#m').val() });
        $('#m').val('');
        return false;
    });
    socket.on('vberfixbvjhdk', function (msg) {
        $('#messages').append('<li class="flex"><h5>'+msg.user+'</h5><p>'+msg.msg+'</p>');
        window.scrollTo(0, document.body.scrollHeight);
    });

    let chat1 = io('/chat1');
    chat1.on('123456789', (msg) => {
        console.log(msg);
    })

});