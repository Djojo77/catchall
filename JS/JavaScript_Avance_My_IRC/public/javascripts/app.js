$(function(){

    $("#register").on('click', function(event){
        event.preventDefault();
        console.log('click');

        let fullname   = $("#fullname").val();
        let email      = $("#email").val();
        let password   = $("#password").val();
        let cpassword  = $("#cpassword").val();
        let dob        = $("#dob").val();
        let country    = $("#country").val();
        let gender     = $('input[name="gender"]:checked').val();

        if(!fullname || !email || !password || !cpassword || !dob || !country || !gender){
            console.log('err1');
            $("#msgDiv").show().html("All fields are required.");
        } else if(cpassword != password) {
            console.log('err2');
            $("#msgDiv").show().html("Passowrds should match.");
        }
        else{
            console.log('POST');
            $.ajax({
                url: "/users/register",
                method: "POST",
                data: { full_name: fullname,
                        email: email,
                        password: password,
                        cpassword: cpassword,
                        dob: dob,
                        country: country,
                        gender: gender,
                }
            }).done(function( data ) {
                console.log('DONE');
                if ( data ) {

                    if(data.status == 'error'){
                        console.log('ERROR');
                        let errors = '<ul>';
                        $.each( data.message, function( key, value ) {
                            errors = errors +'<li>'+value.msg+'</li>';
                        });
                        errors = errors+ '</ul>';
                        $("#msgDiv").html(errors).show();

                    }else{
                        console.log('SUCCESS');
                        if ($('#msgDiv').hasClass('alert-danger')) {
                            $("#msgDiv").removeClass('alert-danger').addClass('alert-success').html(data.message).show();
                        } else {
                            $('#msgDiv').addClass('alert-success').html(data.message).show();
                        }
                        window.location.href = 'login';
                    }
                }
            });
        }
    });

    $("#login").on('click', function(event) {
        event.preventDefault();
        console.log('click login');

        let email      = $("#email").val();
        let password   = $("#password").val();

        if(!email || !password){

            console.log('err1');
            $("#msgDiv").show().html("All fields are required.");

        } else {

            console.log('POST');

            $.ajax({
                url: "/users/login",
                method: "POST",
                data: {
                    email: email,
                    password: password,
                },
            }).done(function( data ) {

                console.log('DONE');

                if ( data ) {

                    console.log('DATA');

                    if (data.status == 'error') {

                        console.log('ERROR');
                        console.log(data);
                        let errors = '<ul>';
                        $.each( data.message, function( key, value ) {
                            console.log(key, value ,value);
                            errors = errors +'<li>'+value+'</li>';
                        });
                        errors = errors+ '</ul>';
                        $("#msgDiv").html(errors).show();

                    } else {

                        console.log('SUCCESS');

                        if ($('#msgDiv').hasClass('alert-danger')) {
                            $("#msgDiv").removeClass('alert-danger').addClass('alert-success').html(data.message).show();
                        } else {
                            $('#msgDiv').addClass('alert-success').html(data.message).show();
                        }
                        window.location.href = '/';
                    }
                }
                console.log('END');
            });
        }
    });

    $("#logout").on('click', function(event) {
        event.preventDefault();
        $.ajax({
            url: "/users/logout",
            method: "POST",
            data: {
                action: 'logout'
            },
            success: function () {
                window.location.href = '/';
            }
        })
    });

    $('#editPost').submit(function (ev) {
        ev.preventDefault();
        let doc = {
            full_name: $("#fullname").val(),
            email: $("#email").val()
            // password: $("#password").val(),
            // cpassword: $("#cpassword").val(),
            // dob: $("#dob").val(),
            // country: $("#country").val(),
            // gender: $('input[name="gender"]:checked').val()
        };
        let doc1 = {};
        let keys = Object.keys(doc);
        for (let i = 0; i < keys.length; i++) {
            if (doc[keys[i]]) doc1[keys[i]] = doc[keys[i]];
        }

        $.ajax({
            url: '/users/edit',
            method: 'POST',
            data: doc1,
            success: function (data) {

            }
        })

    })
});