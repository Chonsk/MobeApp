
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var node_cj = require("node-csv-json");
var app = express();

var playersJson = [];
var playersSimplifiedJson = [];

// convert the csv file into json and create simplified list json
node_cj({
  input: "./players.csv",
  output: null
}, function (err, result) {
  if(err) {
    console.error(err);
  }else {
    playersAsJson = result;

    var i = 0;
    for (var key in playersAsJson) {
      if (playersAsJson.hasOwnProperty(key)) {
        var obj = {'id': playersAsJson[key].playerId,
                   'name': playersAsJson[key].name,
                   'ranking': playersAsJson[key].ranking,
                   'teamName':playersAsJson[key].teamName,
                   'positionText':playersAsJson[key].positionText};
        playersSimplifiedJson[i] = obj;
        i++;
      }
    }
    console.log('simplified JSON:', playersSimplifiedJson);
  }
});



app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/players', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(playersAsJson);
});

///api/player/:id
app.get('/api/player/:id', function (req, res) {
  console.log('asking for ', req.params.id);
  res.end();
});

app.listen(app.get('port'), function () {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
