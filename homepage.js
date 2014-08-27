$(function() {
  $('#username-button').on('click', function() {
    var chatrooms = $('.chatroom');

    for (var i = 0; i < chatrooms.length; i++) {
      var link = chatrooms.eq(i).attr('href');
      chatrooms.eq(i).attr('href', link + $('#username').val());
    }

    $('#username').val('');
  });
});
