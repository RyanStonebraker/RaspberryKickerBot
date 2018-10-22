function RobotController (robot) {
  this.robot = robot;
  let self = this;
  let persistentConnCheck = setInterval(function () {
    self.initConnection();
    if (self.status.connected)
      clearInterval(persistentConnCheck);
  }, 100);
}

RobotController.prototype.status = {
  connected: false,
  errorMessage: "Disconnected"
};

RobotController.prototype.initConnection = function () {
  // TODO: Establish handshake with robot
  this.status.connected = true;
  
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

RobotController.prototype.forward = function () {
  let xMove = 20 * Math.sin(this.robot.angle * Math.PI / 180);
  let yMove = -20 * Math.cos(this.robot.angle * Math.PI / 180);
  if (!this.status.connected) {
    this.robot.screenPosition.x += xMove;
    this.robot.screenPosition.y += yMove;
  }

  this.robot.history.unshift({
    "x": xMove,
    "y": -yMove
  });
}

RobotController.prototype.backward = function () {
  let xMove = -20 * Math.sin(this.robot.angle * Math.PI / 180);
  let yMove = 20 * Math.cos(this.robot.angle * Math.PI / 180);
  if (!this.status.connected) {
    this.robot.screenPosition.x += xMove;
    this.robot.screenPosition.y += yMove;
  }

  this.robot.history.unshift({
    "x": xMove,
    "y": -yMove
  });
}

RobotController.prototype.right = function () {
  this.robot.angle += 5;
}

RobotController.prototype.left = function () {
  this.robot.angle -= 5;
}
