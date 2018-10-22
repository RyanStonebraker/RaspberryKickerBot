function RobotController (robot) {
  this.robot = robot;
  this.initConnection();
}

RobotController.prototype.status = {
  connected: false
};

RobotController.prototype.initConnection = function () {
  // TODO: Establish handshake with robot
  this.status.connected = true;
}

RobotController.prototype.forward = function () {
  let xMove = 5 * Math.sin(this.robot.angle * Math.PI / 180);
  let yMove = -5 * Math.cos(this.robot.angle * Math.PI / 180);
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
  let xMove = -5 * Math.sin(this.robot.angle * Math.PI / 180);
  let yMove = 5 * Math.cos(this.robot.angle * Math.PI / 180);
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
