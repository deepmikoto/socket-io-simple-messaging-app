#!/usr/bin/env node

const io = require('socket.io')({
    serveClient: false
});

io.on('connection', (client) => {
    const username = getCookies(client.handshake.headers.cookie)['username'];
    client.broadcast.emit('user connected', username);
    console.log(username + ' connected');
    client
        .on('disconnect', () => {
            client.broadcast.emit('user disconnected', username);
            console.log(username + ' disconnected')
        })
        .on('chat message', msg => {
            console.log(username + ': ' + msg);
            io.emit('chat message', {
                socketId: client.id,
                username: username,
                message: msg,
            })
        })
        .on('user typing start', username => {
            client.broadcast.emit('user typing start', username);
        })
        .on('user typing stop', username => {
            client.broadcast.emit('user typing stop', username);
        });
});

io.attach(16430);

const getCookies = cookieString => cookieString
    .split('; ')
    .map((cookieString) => {
        let parts = cookieString.split(/=(.+)/),
            obj = {};
        obj[parts[0]] = parts[1];

        return obj;
    })
    .reduce((result, current) => Object.assign(result, current))
    || {};
