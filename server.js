var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

var port = process.env.PORT || 5000;

var router = express.Router();

var robotFeed = {
  "waitingForPi": false, // if not waiting for pi, then the info is from pi, if is waiting for pi, info is to pi
  "commands": [
    // {
    // "instruction": "",
    // "parameters": {}
    // }
  ],
  "telemetry": [
    // {
    //   "displacement": {
    //     "x": 0,
    //     "y": 0
    //   }, // displacement "sensor" just repeats the commands to change position back
    //   "ultrasonic": 0, // distance to object
    //   "angle": 0, // this could either just repeat back the given angle adjustment command or it could get servo value
    // }
  ]
};

router.get('/', function (request, response) {
  response.json(robotFeed);
});

router.post('/post', function (request, response) {
  let postData = request.body;
  console.log(postData);
  let feed = null;
  let id = null;
  let validPost = false;
  if ("sender" in postData) {
    if ("identifier" in postData["sender"] && "type" in postData["sender"]) {
      feed = postData["sender"]["type"] == "command" ? robotFeed.commands : robotFeed.telemetry;
      id = postData["sender"]["identifier"]
      validPost = true;
    }
  }

  if (!validPost) {
    response.send();
    return;
  }

  let currentData = {};
  for (var postParam in postData) {
    if (postParam === "sender")
      continue;
    currentData[postParam] = postData[postParam];
  }

  feed.push(currentData);

  if (id === "rpi.local")
    robotFeed.waitingForPi = false;
  else
    robotFeed.waitingForPi = true;

  response.send(robotFeed);
});

app.use('/telemetry', router);
app.listen(port);
console.log("Listening on localhost:" + port);
