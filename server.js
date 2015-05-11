/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var csv  = require('node-csvjsonlite');
var app = express();

var filename = './players.csv';
var playersAsJson = {};

csv.convert(filename).then( function(successData) {
  console.log('CSV converted to JSON');
  playersAsJson = successData;
}, function(errorReason) {
  console.log(errorReason);
  // Error Reason is either a string ("File does not exist") 
  // or an error object returned from require('fs').readFile 
});

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/players', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(playersAsJson);
  /*fs.readFile('comments.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });*/
});

app.post('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    var comments = JSON.parse(data);
    comments.push(req.body);
    fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(comments));
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
