$(function () {
    var socket;
    
    function initWSConnection() {
        socket = io(window.location.origin + ':14630');
        socket
            .on('chat message', function (data) {
                var $template = $($('#instant-message').html());
                $template.find('#message').text(data.message);
                $template.find('#time').text((new Date()).toLocaleDateString());
                if (socket.id === data.socketId) {
                    $template.addClass('own');
                } else {
                    $template.find('#username').text(data.username);
                    playSound('definite')
                }

                $('#messages').append($template);
                window.scrollTo(0, document.body.scrollHeight);
            })
            .on('user connected', function (username) {
                $('#messages').append($('<li>').html('<b>' + username + '</b>' + ' has connected'));
                window.scrollTo(0, document.body.scrollHeight);
            })
            .on('user disconnected', function (username) {
                $('#messages').append($('<li>').html('<b>' + username + '</b>' + ' disconnected'));
                window.scrollTo(0, document.body.scrollHeight);
            })
            .on('user typing start', function (username) {
                if ($('#typing').find('li[data-username="' + username +'"]').length) {
                    return;
                }

                $('#typing').append($('<li>').text(username + ' is typing').attr('data-username', username));
            })
            .on('user typing stop', function (username) {
                $('#typing').find('li[data-username="' + username +'"]').remove();
            });

        return socket;
    }

    function bindFormSubmit() {
        $('form').submit(function () {
            if ($('#m').val()) {
                socket.emit('chat message', $('#m').val());
            }
            $('#m').val('');

            return false;
        });
    }
    
    function bindTypingAction() {
        var timeout;
        $('#m').on('keyup', function () {
            clearTimeout(timeout);
            socket.emit('user typing start', getUsername());
            timeout = setTimeout(function () {
                socket.emit('user typing stop', getUsername());
            }, 1000);
        })
    }

    function getUsername() {
        var username,
            cookies = document.cookie
                .split('; ')
                .map(function (cookieString) {
                    var parts = cookieString.split(/=(.+)/),
                        obj = {};
                    obj[parts[0]] = parts[1];

                    return obj;
                })
                .reduce(function (result, current) {
                    return Object.assign(result, current);
                });
        username = cookies.username ||
            function () {
                return prompt('What is your username?') || 'anonymous'
            }();
        document.cookie = 'username=' + username;

        return username;
    }

    /**
     * @param {string} filename The name of the file WITHOUT ending
     */
    function playSound(filename){
        document.getElementById("sound").innerHTML='' +
            '<audio autoplay="autoplay"><source src="/audio/' + filename + '.mp3" type="audio/mpeg" />' +
                '<source src="/audio/' + filename + '.ogg" type="audio/ogg" />' +
                '<embed hidden="true" autostart="true" loop="false" src="/audio/' + filename +'.mp3" />' +
            '</audio>';
    }

    getUsername();
    socket = initWSConnection();
    bindFormSubmit();
    bindTypingAction();
});
