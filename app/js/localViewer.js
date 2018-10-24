var viewer = {
    width: 0,
    height: 0,
    refreshRate: 60,
    minHistoryPrecision: 0,
    backgroundColor: 'rgb(25,25,25)',
    lineColor: 'white'
};

var key = {
  "manual": "M".charCodeAt(),
    "forward": "W".charCodeAt(),
    "backward": "S".charCodeAt(),
    "left": "A".charCodeAt(),
    "right": "D".charCodeAt(),
  "stop": " ".charCodeAt()
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
  "width": 200,
  "height": 100,
  "angle": 0,
  "screenPosition": {
    "x": 0,
    "y": 0
  },
  "history": [],
  "telemetry": {}
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

LocalViewer.prototype.relDistance = function (runningTotal) {
  if (!runningTotal)
    return false;
  let distance = Math.sqrt(runningTotal.x * runningTotal.x + runningTotal.y * runningTotal.y);
  return distance;
}

// draws history points with 0,0 as center and +,+ to the right, top
LocalViewer.prototype.drawHistory = function () {
  let runningTotal = {
    "x": 0,
    "y": 0,
    "angle": 0
  };
  for (let i = 0; i < this.robot.history.length; ++i) {
    this.localCtx.translate(-this.robot.history[i].x, this.robot.history[i].y);
    if ((runningTotal.x || runningTotal.y) && this.relDistance(runningTotal) < viewer.minHistoryPrecision) {
      runningTotal.x += this.robot.history[i].x;
      runningTotal.y += this.robot.history[i].y;
      runningTotal.angle += this.robot.history[i].angle;
      continue;
    }
    runningTotal.x = this.robot.history[i].x;
    runningTotal.y = this.robot.history[i].y;
    runningTotal.angle = this.robot.history[i].angle;

    this.localCtx.beginPath();
    this.localCtx.arc(viewer.width/2, viewer.height/2, 10, 0, 2 * Math.PI, false);
    this.localCtx.fillStyle = viewer.lineColor;
    this.localCtx.fill();
  }

  // Reset origin
  for (let i = 0; i < this.robot.history.length; ++i)
    this.localCtx.translate(this.robot.history[i].x, -this.robot.history[i].y);
}

LocalViewer.prototype.drawRobot = function () {
  this.localCtx.strokeStyle = viewer.lineColor;
  let robotMidX = this.robot.screenPosition.x + this.robot.width/2;
  let robotMidY = this.robot.screenPosition.y + this.robot.height/2;
  this.localCtx.save();
  this.localCtx.translate(robotMidX, robotMidY);
  this.localCtx.rotate(-this.robot.angle * Math.PI/180);
  this.localCtx.translate(-robotMidX, -robotMidY);

  this.localCtx.fillStyle = viewer.backgroundColor;
  this.localCtx.fillRect(this.robot.screenPosition.x, this.robot.screenPosition.y, this.robot.width, this.robot.height);

  this.localCtx.strokeRect(this.robot.screenPosition.x, this.robot.screenPosition.y, this.robot.width, this.robot.height);
  this.localCtx.restore();
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
    }
  }
}
