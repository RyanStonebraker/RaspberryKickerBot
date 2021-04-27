var http = require("http");

function RobotController (robot) {
  this.robot = robot;
  this.saveAngle = this.robot.angle - 90;
  let self = this;
  let persistentConnCheck = setInterval(function () {
    self.initConnection();
    if (self.status.connected)
      clearInterval(persistentConnCheck);
  }, 100);
}

RobotController.prototype.status = {
  connected: false,
  errorMessage: "Disconnected",
  manualMode: false,
  stopMode: false
};

RobotController.prototype.initConnection = function () {
  this.status.connected = true;
  this.reloadConnectionStatus();
}

RobotController.prototype.reloadConnectionStatus = function () {
  let statusArea = document.querySelector("section.status h2");
  if (this.status.connected) {
    statusArea.textContent = "Connected";
    statusArea.classList.remove("error");
    statusArea.classList.add("message");
  }
  else {
    statusArea.textContent = this.status.errorMessage;
    statusArea.classList.remove("message");
    statusArea.classList.add("error");
  }
}

RobotController.prototype.toggleManualMode = function () {
  if (!this.status.manualMode) {
    this.status.manualMode = true;
  }
  else {
    this.status.manualMode = false;
    // TODO: Remove from manual mode, switch to autonomous
  }

  return this.status.manualMode;
}

RobotController.prototype.toggleStopMode = function () {
  if (!this.status.stopMode) {
    this.status.stopMode = true;
    // TODO: Put into stop mode, pause all controls
  }
  else {
    this.status.stopMode = false;
    // TODO: Remove from stop mode
  }

  return this.status.stopMode;
}

RobotController.prototype.pushCommand = function (command, parameters) {
  let fullCommand = {};
  fullCommand.sender = {
    'identifier': 'rpi.controller',
    'type': 'command'
  };
  fullCommand.instruction = command;
  fullCommand.parameters = parameters;
  fullCommand.commandID = this.robot.currentCommand;
  ++this.robot.currentCommand;

  var options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/telemetry/post',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
  };
  var request = http.request(options, function(response) {});
  let self = this;
  request.on('error', function(e) {
    self.status.connected = false;
    self.status.errorMessage = e.message;
    self.reloadConnectionStatus();
    self.initConnection();
  });
  request.write(JSON.stringify(fullCommand));
  request.end();
}

RobotController.prototype.forward = function (stepSize = 10) {
  let xMove = stepSize * Math.sin(this.robot.angle * Math.PI / 180);
  let yMove = -stepSize * Math.cos(this.robot.angle * Math.PI / 180);
  if (!this.status.connected) {
    this.robot.screenPosition.x += xMove;
    this.robot.screenPosition.y += yMove;
  }
  else {
    this.robot.screenPosition.x = viewer.width/2 - this.robot.width/2;
    this.robot.screenPosition.y = viewer.height/2 - this.robot.height/2;

    this.pushCommand("forward", {
      "distance": stepSize
    });
  }
}

RobotController.prototype.backward = function (stepSize = 10) {
  let xMove = -stepSize * Math.sin(this.robot.angle * Math.PI / 180);
  let yMove = stepSize * Math.cos(this.robot.angle * Math.PI / 180);
  if (!this.status.connected) {
    this.robot.screenPosition.x += xMove;
    this.robot.screenPosition.y += yMove;
  }
  else {
    this.robot.screenPosition.x = viewer.width/2 - this.robot.width/2;
    this.robot.screenPosition.y = viewer.height/2 - this.robot.height/2;

    this.pushCommand("backward", {
      "distance": stepSize
    });
  }
}

RobotController.prototype.right = function (stepSize = 5) {
  if (!this.status.connected) {
    this.robot.angle -= stepSize;
  }
  else {
    this.pushCommand("rotate", {
      "angle": -stepSize
    });
  }
}

RobotController.prototype.left = function (stepSize = 5) {
  if (!this.status.connected) {
    this.robot.angle += stepSize;
  }
  else {
    this.pushCommand("rotate", {
      "angle": stepSize
    });
  }
}

RobotController.prototype.turnBy = function (angle) {
  // angle -= 90;
  // angle -= this.robot.angle;
  // angle = angle % 360;
  if (angle < 0)
    angle = 360 + angle;

  if (angle <= 180) {
    console.log("left", angle);
    this.left(angle);
  }
  else {
    angle = 360 - angle;
    console.log("right", angle);
    this.right(angle);
  }

  return this.saveAngle + angle;
}

RobotController.prototype.relMoveTo = async function (point) {
  let angle = (Math.atan(point.y/point.x) * 180/Math.PI);
  // angle -= -90;
  angle -= this.saveAngle;
  //
  let distance = Math.sqrt(Math.pow(point.y, 2) + Math.pow(point.x, 2));
  // // console.log("x:", point.x, "y:", point.y, "angle:", angle, "distance:", distance);
  // if (!angle && !distance)
  //   return;

  // angle = 45;
  let angleStepSize = 10;
  let angleSteps = Math.abs(Math.floor(angle/angleStepSize));
  // console.log(angleSteps);
  // if (angle >= 0 && angle <= 180) {
  console.log("Angle", angle);
  let directedAmount = angle > 0 && angle <= 180 ? angleStepSize : -angleStepSize;
    for (let step = 0; step < angleSteps; ++step) {
      // if (step == angleSteps - 1)
      //   this.saveAngle = (this.saveAngle + this.turnBy(directedAmount + angle % directedAmount)) % 360;
      // else
        this.saveAngle = (this.saveAngle + this.turnBy(directedAmount)) % 360;
      await sleep(20);
    }
  // }
  // else {
  //   angle = 180 - Math.abs(angle % 180);
  //   for (let step = 0; step < angleSteps; ++step) {
  //     this.right(angleStepSize);
  //     if (step == angleSteps - 1)
  //       this.right(angle % angleStepSize);
  //     await sleep(20);
  //   }
  // }
  // console.log("turn:", angle, "currentlyAt:", this.robot.angle);

  let stepSize = 20;
  for (let step = 0; step < Math.abs(Math.floor(distance/stepSize)); ++step) {
    if (step == Math.abs(Math.floor(angle/angleStepSize)) - 1)
      this.forward(stepSize + distance % stepSize);
    else
      this.forward(stepSize);
    await sleep(20);
  }
}

RobotController.prototype.absMoveTo = function (point) {
  let xDiff = point.x - this.robot.absolutePosition.x;
  let yDiff = point.y - this.robot.absolutePosition.y;
  console.log("px:", point.x, "py:", point.y, "xDiff:", xDiff, "yDiff:", yDiff);
  this.relMoveTo({x: xDiff, y: yDiff});
}

RobotController.prototype.waitForConfirm = function () {
  return new Promise((resolve, reject) => {
    if (this.robot.history.length === this.robot.telemetry.length)
      resolve();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

RobotController.prototype.followPath = async function (pathArray)  {
  let currentPathPoint = 0;
  while (currentPathPoint < pathArray.length) {
    this.relMoveTo(pathArray[currentPathPoint]);
    // this.waitForConfirm().then(() => {
    //   ++currentPathPoint;
    // });
    await sleep(100);
    ++currentPathPoint;
  }
}

RobotController.prototype.randomWalk = function (step = 20, movements = 10) {
  let randomWalk = [];
  for (let i = 0; i < movements; ++i) {
    let walkAngle = Math.random() * 360;
    let xMove = step * Math.sin(walkAngle * Math.PI / 180);
    let yMove = -step * Math.cos(walkAngle * Math.PI / 180);
    randomWalk.push({x: xMove, y: yMove});
  }
  this.followPath(randomWalk);
}
