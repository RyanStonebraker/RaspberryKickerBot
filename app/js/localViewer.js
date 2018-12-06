var viewer = {
    width: 0,
    height: 0,
    refreshRate: 60,
    minHistoryPrecision: 0,
    backgroundColor: 'rgb(25,25,25)',
    lineColor: 'white',
    robotColor: 'white',
    obstacleColor: 'red',
    obstacleDistanceLimit: 300,
    showObstacles: true,
    showGrid: true
};

var key = {
  "manual": "M".charCodeAt(),
    "forward": "W".charCodeAt(),
    "backward": "S".charCodeAt(),
    "left": "A".charCodeAt(),
    "right": "D".charCodeAt(),
  "stop": " ".charCodeAt(),
  "toggleObstacles": "O".charCodeAt(),
  "toggleGrid": "G".charCodeAt(),
  "autonomous": "1".charCodeAt()
};

function LocalViewer(cnv) {
  this.localCanvas = cnv;
  this.localCtx = null;
  if (this.localCanvas.getContext) {
    this.localCtx = this.localCanvas.getContext("2d");
    viewer.width = window.innerWidth;
    viewer.height = window.innerHeight;
    this.localCtx.canvas.width  = viewer.width;
    this.localCtx.canvas.height = viewer.height;
    this.robot.screenPosition.x = viewer.width/2 - this.robot.width/2;
    this.robot.screenPosition.y = viewer.height/2 - this.robot.height/2;
    this.localCtx.clearRect(0, 0, viewer.width, viewer.height);
  }
  this.robotController = new RobotController(this.robot);

  this.telemetryMonitor = new TelemetryMonitor(this.robot);
  this.telemetryMonitor.monitor();

  this.updateLocalViewer();
  window.addEventListener('keydown', this.keys.bind(this), true);
  document.querySelector("section.manual-mode").addEventListener("click", this.fullToggleManual.bind(this));
  document.querySelector("section.stop-mode").addEventListener("click", this.fullToggleStop.bind(this));

  this.lastTimePressed = new Array(15);
  let self = this;
  window.addEventListener("gamepadconnected", function(e) {
    self.lastController = {};
    setInterval(function () {
      var xboxController = navigator.getGamepads()[e.gamepad.index];
      if (xboxController.buttons[1].pressed && (!self.lastTimePressed[1] || xboxController.timestamp - self.lastTimePressed[1] > 490000000)) {
        this.fullToggleStop();
        self.lastTimePressed[1] = xboxController.timestamp;
      }
      else if (xboxController.buttons[0].pressed && (!self.lastTimePressed[0] || xboxController.timestamp - self.lastTimePressed[0] > 490000000)) {
        this.fullToggleManual();
        self.lastTimePressed[0] = xboxController.timestamp;
      }
      self.lastController = xboxController;
    }.bind(self), 5);
  });
}

LocalViewer.prototype.robot = {
  "width": 145,
  "height": 200,
  "angle": 0,
  "screenPosition": {
    "x": 0,
    "y": 0
  },
  "history": [],
  "telemetry": {},
  "absolutePosition": {
    "x": 0,
    "y": 0
  },
  "extrema": {
    "max": {
      "x": 0,
      "y": 0
    },
    "min": {
      "x": 0,
      "y": 0
    },
  },
  "obstacleField": [],
  "currentCommand": 0,
  "collided": false
};

LocalViewer.prototype.updateLocalViewer = function () {
  var self = this;
  setTimeout(function() {
    requestAnimationFrame(function(){
      self.updateLocalViewer();
    })
  }, 1000/viewer.refreshRate);

  this.localCtx.clearRect(0, 0, viewer.width, viewer.height);
  this.drawScreen();
};

LocalViewer.prototype.drawScreen = function () {
  this.localCtx.fillStyle = viewer.backgroundColor;
  this.localCtx.fillRect(0,0,viewer.width,viewer.height);

  this.drawHistory();
  this.drawRobot();
}

LocalViewer.prototype.drawGrid = function () {
  let unitSize = 100;
  let xViewIncrements = viewer.width * 10;
  let yViewIncrements = viewer.height * 10;
  this.localCtx.strokeStyle = viewer.lineColor;

  let environmentWidth = Math.max(xViewIncrements, viewer.width + (this.robot.extrema.max.x - this.robot.extrema.min.x) * 2);
  let environmentHeight = Math.max(yViewIncrements, viewer.height + (this.robot.extrema.max.y - this.robot.extrema.min.y) * 2);

  let rows = Math.ceil(environmentHeight/unitSize);
  let columns = Math.ceil(environmentWidth/unitSize);
  for (let i = -rows; i < 2 * rows; ++i) {
    this.localCtx.beginPath();
    this.localCtx.moveTo(-environmentWidth, i * unitSize);
    this.localCtx.lineTo(environmentWidth, i * unitSize);
    this.localCtx.stroke();
  }

  for (let i = -columns; i < 2 * columns; ++i) {
    this.localCtx.beginPath();
    this.localCtx.moveTo(i * unitSize, -environmentHeight);
    this.localCtx.lineTo(i * unitSize, environmentHeight);
    this.localCtx.stroke();
  }
}

LocalViewer.prototype.relDistance = function (runningTotal) {
  if (!runningTotal)
    return false;
  let distance = Math.sqrt(runningTotal.x * runningTotal.x + runningTotal.y * runningTotal.y);
  return distance;
}

LocalViewer.prototype.drawPathPoint = function () {
  this.localCtx.beginPath();
  this.localCtx.arc(viewer.width/2, viewer.height/2, 10, 0, 2 * Math.PI, false);
  this.localCtx.fillStyle = viewer.lineColor;
  this.localCtx.fill();
}

// draws history points with 0,0 as center and +,+ to the right, top
LocalViewer.prototype.drawHistory = function () {
  let obstacleField = [];
  let fixedPosition = {
    "x": 0,
    "y": 0
  };

  for (let i = 0; i < this.robot.history.length; ++i) {
    if (i == this.robot.history.length-1)
      if (viewer.showGrid)
        this.drawGrid();
    this.localCtx.translate(-this.robot.history[i].x, this.robot.history[i].y);
    this.drawPathPoint();
    if (viewer.showObstacles) {
      this.drawObstacle(this.robot.history[i]);
    }
  }

  // Reset origin
  for (let i = 0; i < this.robot.history.length; ++i)
    this.localCtx.translate(this.robot.history[i].x, -this.robot.history[i].y);
}

LocalViewer.prototype.drawRobot = function () {
  this.localCtx.strokeStyle = viewer.robotColor;
  let robotMidX = this.robot.screenPosition.x + this.robot.width/2;
  let robotMidY = this.robot.screenPosition.y + this.robot.height/2;
  this.localCtx.save();
  this.localCtx.translate(robotMidX, robotMidY);
  this.localCtx.rotate(-this.robot.angle * Math.PI/180);
  this.localCtx.translate(-robotMidX, -robotMidY);

  this.localCtx.fillStyle = viewer.backgroundColor;
  this.localCtx.fillRect(this.robot.screenPosition.x, this.robot.screenPosition.y, this.robot.width, this.robot.height);

  this.localCtx.lineWidth = 5;
  this.localCtx.strokeRect(this.robot.screenPosition.x, this.robot.screenPosition.y, this.robot.width, this.robot.height);

  this.localCtx.beginPath();
  this.localCtx.moveTo(this.robot.screenPosition.x + this.robot.width/4, this.robot.screenPosition.y + 5 * this.robot.height/8);
  this.localCtx.lineTo(this.robot.screenPosition.x + this.robot.width/2, this.robot.screenPosition.y + 3 * this.robot.height/8);
  this.localCtx.lineTo(this.robot.screenPosition.x + 3 * this.robot.width/4, this.robot.screenPosition.y + 5 * this.robot.height/8);
  this.localCtx.stroke();
  this.localCtx.restore();
}

LocalViewer.prototype.drawObstacle = function (currentRobot) {
  let distanceToObstacle = currentRobot.obstacle;
  if (distanceToObstacle && distanceToObstacle < viewer.obstacleDistanceLimit) {
    let obstacleXDist = Math.sin(currentRobot.angle * Math.PI/180) * distanceToObstacle;
    let obstacleYDist = Math.cos(currentRobot.angle * Math.PI/180) * distanceToObstacle;
    this.localCtx.beginPath();
    this.localCtx.arc(viewer.width/2 - obstacleXDist, viewer.height/2 - obstacleYDist, 10, 0, 2 * Math.PI, false);
    this.localCtx.fillStyle = viewer.obstacleColor;
    this.localCtx.fill();
  }
}

LocalViewer.prototype.fullToggleManual = function () {
  let manualMode = document.querySelector("section.manual-mode");
  manualMode.classList.toggle('hide');
  this.robotController.toggleManualMode();
}

LocalViewer.prototype.fullToggleStop = function () {
  let stopMode = document.querySelector("section.stop-mode");
  stopMode.classList.toggle('hide');
  this.robotController.toggleStopMode();
}

LocalViewer.prototype.keys = function (evt) {
  if (evt.keyCode === key.stop) {
    this.fullToggleStop();
    return;
  }
  if (!this.robotController.status.stopMode && evt.keyCode === key.manual) {
    this.fullToggleManual();
    return;
  }
  if (!this.robotController.status.stopMode && this.robotController.status.manualMode) {
    switch(evt.keyCode) {
      case key.right:
        this.robotController.right();
        break;
      case key.left:
        this.robotController.left();
        break;
      case key.forward:
        this.robotController.forward();
        break;
      case key.backward:
        this.robotController.backward();
        break;
      case key.autonomous:
        this.robotController.randomWalk();
        break;
    }
  }

  switch(evt.keyCode) {
    case key.toggleObstacles:
      viewer.showObstacles = !viewer.showObstacles;
      break;
    case key.toggleGrid:
      viewer.showGrid = !viewer.showGrid;
  }
}
