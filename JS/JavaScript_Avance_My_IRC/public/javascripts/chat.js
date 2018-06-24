$(function() {
    let socket = {general: io(window.location.href)};

    // SENDING MESSAGE
    $('form').submit(function () {
        let key = $('#mBtn').val();
        socket.general.emit(key, { user:$('#user_id').text(), msg:$('#m').val() });
        console.log('sending : ', $('#m').val(), ' to ', $('#mBtn').val());
        $('#m').val('');
        return false;
    });

    //REQUESTING ALL CHANNELS TO BE SET ON LOAD
    let getChannels = () => {
        $.ajax({
            url: '/getChannels',
            method: 'POST',
            success: function(data) {
                for (let i = 0; i< data.length; i++) {
                    setChannel(data[i]); // SET CHANNELS
                }
            }
        })
    };
    let setChannel = (channel) => {
        socket.general
            .on(channel._id, function (msg) {
                $('#'+channel._id).append(
                    '<li class="flex-centerY msg margin-b-10">' +
                    '   <h5 class="authorMsg">'+msg.user+'</h5><p class="textMsg">'+msg.msg+'</p>' +
                    '</li>');
                $('#messageContainer')[0].scrollTop = $('#messageContainer')[0].scrollHeight;
            });
    };

    getChannels(); //SET EVERYTHING ON LOAD

    // ADD NEW CHANNELS
    $('#addChannelBtn').click(function(event) {
        event.preventDefault();
        let name = $('#channelName').val();
        $('#channelName').val('');
        $('#m')[0].focus();

        $.ajax({
            url: '/',
            method: 'post',
            data: {
                channelName: name
            },
            success: (data) => {
                if (data.status !== 'Exist') {
                    socket.general.emit('channel', {channelName: name, channelData: data.channel});
                }
            }
        }).done((data) => {
            console.log('postResult',data);
        });
    });

    // SETTING NEW CHANNELS
    socket.general
        .on('channel', function (data) {
            console.log('new Channel added');
            $('.channelList').append(
                '<p class="channel" data-channelID="' + data.channel._id + '">' +
                data.channel.channelName  +
                '</p>'
            );
            $('[data-channelID='+data.channel._id+']').click(chActiveChannel);
            $('#messageContainer').append(
                '<ul id="'+data.channel._id+'" class="messages col-sm-12" data-name="'+data.channel.channelName+'"></ul>'
            );
            socket.general
                .on(data.channel._id, function (msg) {
                    $('#'+data.channel._id).append(
                        '<li class="flex-centerY msg margin-b-10">' +
                        '   <h5 class="authorMsg">'+msg.user+'</h5><p class="textMsg">'+msg.msg+'</p>' +
                        '</li>');
                    $('#messageContainer')[0].scrollTop = $('#messageContainer')[0].scrollHeight;
                });
        });

    let chActiveChannel = function() {
        if (!$(this).hasClass('hide')) {
            $('.channelList .active').removeClass('active');
            $('.messageContainer .active').removeClass('active');
            $(this).addClass('active');
            let channel = $(this).attr('data-channelID');
            $('#'+channel).addClass('active');
            $('#mBtn').val(channel);
            $('#m')[0].focus();
        }
    };
    $('.channel').click(chActiveChannel);


});