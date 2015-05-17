# MobeApp

A simple list using the React framework and an express server for the data.
I used Chrome when developing so can't promise cross browser functionality.

## Server
As the data is in an csv file and we want to send it as json I convert it by node-csv-json.

## To use

There are several simple server implementations included. They all serve static files from `public/` and handle requests to `comments.json` to fetch or add data.

Start a server with:

### Node

Make sure you have node.js installed https://nodejs.org/

Open up a console in the root and run
```sh
npm install
node server.js


And go to <http://localhost:3000/>. Click on the items to see player stats
