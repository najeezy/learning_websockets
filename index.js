// create express function
var app = require('express')();

// create server
var http = require('http').Server(app);

// set up io stream
var io = require('socket.io')(http);

// chat history for rooms
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

// serve the homepage
app.get('/', function(req, res){
  res.sendfile('index.html');
});



// serve the chatroom page
app.get('/chatroom/:id/:username', function(req, res) {
  res.sendfile('chatroom.html');
});



// begin the io stream and listen for sockets that connect.
// there is a socket per client side connection that is passed in
// as the first argument of the function on connection event
io.on('connection', function(socket) {

  // grab the url that the socket came from (the users url)
  var splitUrl = socket.handshake.headers.referer.split('/');

  // take the username and chatroom that user is in from url
  var user = {
    username: splitUrl[5],
    chatroom: splitUrl[4]
  }

  // add this user to the list of current users if the name is not already there
  if (MHistory['chatroom' + user.chatroom].currentUsers.indexOf(user.username) === -1) {
    MHistory['chatroom' + user.chatroom].currentUsers.push(user.username);
  }

  // create or join the channel for a specific chat room
  socket.join('chatroom ' + user.chatroom);

  // emit an event with data to the socket that just connected. The data is
  // the current users and the messages that the chatroom has so far.
  socket.emit('load message page', MHistory['chatroom' + user.chatroom]);

  // emit a new event but broadcast only to the sockets that are not this socket
  // on a specific channel. Send the username of this socket as data.
  socket.broadcast.to('chatroom ' + user.chatroom).emit('user enter', user.username);

  // set a listener for chat messages coming from the server side on the current
  // socket. Each socket that connects should have its own listener. The first
  // argument of the function is whatever data was sent from the emission coming
  // from the client side.
  socket.on('chat message', function(msg) {

    // create an object that includes the username of the current socket
    var msgObj = {
      username: user.username,
      message: msg
    }

    // store that object in my global history object
    MHistory['chatroom' + user.chatroom].messages.push(msgObj);

    // send the message object to all sockets connected to the room.
    io.to('chatroom ' + user.chatroom).emit('chat message', msgObj);
  });

  // listen for disconnection from the client side of a specific socket
  socket.on('disconnect', function() {

    // remove the user that left from the current users list in the msg history obj
    var users = MHistory['chatroom' + user.chatroom].currentUsers;
    for (var i = 0; i < users.length; i++) {
      if (users[i] === user.username) {
        MHistory['chatroom' + user.chatroom].currentUsers.splice(i, 1);
      }
    }

    // emit a message to all sockets in the room with the leaving user's username
    // as data
    io.to('chatroom ' + user.chatroom).emit('leaving user', user.username);
  });
});

// start the server
// process.env.PORT is used by heroku to set the port dynamically
http.listen(process.env.PORT || 3000, function(){
  console.log('Server has started');
});
