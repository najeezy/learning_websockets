$(function() {
  var socket = io();

  $('form').submit(function(event) {
    event.preventDefault();
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('load message page', function(msgObj) {
    console.log(msgObj);
  });

  socket.on('chat message', function(msgObj) {
    $('#messages').append($('<li>').text(msgObj.username + ': ' + msgObj.message));
  });
});
