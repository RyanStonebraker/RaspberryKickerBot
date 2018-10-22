var viewer = {
    width: 0,
    height: 0,
    refreshRate: 60,
    minHistoryPrecision: 5
};

var key = {
  "manual": "M".charCodeAt(),
    "up": "W".charCodeAt(),
    "down": "S".charCodeAt(),
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

  this.updateLocalViewer();
  window.addEventListener('keydown', this.keys.bind(this), true);
}

LocalViewer.prototype.robot = {
  "width": 200,
  "height": 100,
  "angle": 0,
  "screenPosition": {
    "x": 0,
    "y": 0
  },
  "history": [
    {
      "x": 10,
      "y": 10
    }
  ]
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
  this.localCtx.fillStyle = "rgb(25,25,25)";
  this.localCtx.fillRect(0,0,viewer.width,viewer.height);

  this.drawHistory();
  this.drawRobot();
}

// draws history points with 0,0 as center and +,+ to the left, top
LocalViewer.prototype.drawHistory = function () {
  for (let i = 0; i < this.robot.history.length; ++i) {
    this.localCtx.translate(this.robot.history[i].x, this.robot.history[i].y);
    this.localCtx.beginPath();
    this.localCtx.arc(viewer.width/2, viewer.height/2, 10, 0, 2 * Math.PI, false);
    this.localCtx.fillStyle = "white";
    this.localCtx.fill();
    this.localCtx.translate(-this.robot.history[i].x, -this.robot.history[i].y);
  }
}

LocalViewer.prototype.drawRobot = function () {
  this.localCtx.strokeStyle = "white";
  let robotMidX = this.robot.screenPosition.x + this.robot.width/2;
  let robotMidY = this.robot.screenPosition.y + this.robot.height/2;
  this.localCtx.save();
  this.localCtx.translate(robotMidX, robotMidY);
  this.localCtx.rotate(this.robot.angle * Math.PI/180);
  this.localCtx.translate(-robotMidX, -robotMidY);
  this.localCtx.strokeRect(this.robot.screenPosition.x, this.robot.screenPosition.y, this.robot.width, this.robot.height);
  this.localCtx.restore();
}

LocalViewer.prototype.keys = function (evt) {
  switch(evt.keyCode) {
    case key.manual:
      break;
    case key.right:
      this.robot.angle += 5;
      break;
    case key.left:
      this.robot.angle -= 5;
      break;
    case key.forward:
      break;
  }
}
