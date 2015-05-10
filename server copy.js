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
var converter = require('json-2-csv');
var app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/players.csv', function(req, res) {
  console.log("app.GET called");
  fs.readFile('players.csv', function(err, data) {
    if (err) throw err;
    console.log(data);
    converter.csv2json(data.toString(), function(err, json) {
      console.log(json);
      res.setHeader('Content-Type', 'application/json');
      res.send(json);
    });
  });
});

app.post('/players.csv', function(req, res) {
  console.log("app.POST called");
  fs.readFile('players.csv', function(err, data) {
    converter.csv2json(data.toString(), function(err, json) {
      console.log(json);
      var comments = JSON.parse(json);
      comments.push(req.body);
      fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function(err) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(JSON.stringify(comments));
      });
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
