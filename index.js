var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MHistory = {
  chatroom1: {
    currentUsers: [],
    messages: []
  },

  chatroom2: {
    currentUsers: [],
    messages: []
  }
};

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/chatroom/:id/:username', function(req, res) {
  res.sendfile('chatroom.html');
});

io.on('connection', function(socket) {
  var splitUrl = socket.handshake.headers.referer.split('/');
  var user = {
    username: splitUrl[5],
    chatroom: splitUrl[4]
  }

  if (MHistory['chatroom' + user.chatroom].currentUsers.indexOf(user.username) === -1) {
    MHistory['chatroom' + user.chatroom].currentUsers.push(user.username);
  }

  socket.join('chatroom ' + user.chatroom);

  socket.emit('load message page', MHistory['chatroom' + user.chatroom]);
  socket.broadcast.to('chatroom ' + user.chatroom).emit('user enter', user.username);

  socket.on('chat message', function(msg) {
    var msgObj = {
      username: user.username,
      message: msg
    }

    console.log(MHistory);
    MHistory['chatroom' + user.chatroom].messages.push(msgObj);
    io.to('chatroom ' + user.chatroom).emit('chat message', msgObj);
  });


  socket.on('disconnect', function() {
    console.log(user.username + ' has left');
    var users = MHistory['chatroom' + user.chatroom].currentUsers;

    for (var i = 0; i < users.length; i++) {
      if (users[i] === user.username) {
        MHistory['chatroom' + user.chatroom].currentUsers.splice(i, 1);
      }
    }

    io.to('chatroom ' + user.chatroom).emit('leaving user', user.username);
  });
});


http.listen(process.env.PORT, function(){
  console.log('listening on *:3000');
});
