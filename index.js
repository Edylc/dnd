var express = require('express'),
    path = require('path')

var app = express();

app.use(express.static('views'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/home.html');
});

app.get('/creation', function(req, res) {
  res.sendFile(__dirname + '/views/creation.html');
})

app.get('/character', function(req, res) {
  res.sendFile(__dirname + '/views/character.html');
});

app.get('/main.css', function(req, res) {
  res.sendFile('/main.css');
});

app.get('/creation.js', function(req, res) {
  res.sendFile('/creation.js');
});

app.get('/character.js', function(req, res) {
  res.sendFile('/character.js');
});

var port = process.env.PORT || 5000; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");
