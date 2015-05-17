(function () {
  'use strict';

  var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    node_cj = require("node-csv-json"),
    app = express(),

    playersJson = [],
    playersSimplifiedJson = [];

  
  // find the player we are looking for
  function getPlayerById(id) {
    var key;
    if(!playersJson) {return {}}
    for (key in playersJson) {
      if (playersJson.hasOwnProperty(key) && playersJson[key].playerId === id) {
        return playersJson[key];
      }
    }
  }
  
  // convert the csv file into json and create simplified list json
  node_cj({
    input: "./players.csv",
    output: null
  }, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      playersJson = result;

      var key, obj;
      for (key in playersJson) {
        if (playersJson.hasOwnProperty(key)) {
          obj = {'id': playersJson[key].playerId,
                 'name': playersJson[key].name,
                 'ranking': playersJson[key].ranking,
                 'teamName': playersJson[key].teamName,
                 'positionText': playersJson[key].positionText};
          playersSimplifiedJson.push(obj);
        }
      }
    }
  });

  app.set('port', (process.env.PORT || 3000));

  app.use('/', express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  // sending the whole players list (filtered version)
  app.get('/api/players', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(playersSimplifiedJson);
  });

  // send one players full stats
  app.get('/api/player/:id', function (req, res) {
    var obj = getPlayerById(req.params.id);
    res.setHeader('Content-Type', 'application/json');
    res.send(obj);
  });

  app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
  });

}());