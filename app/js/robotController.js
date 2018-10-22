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
  if (!this.status.connected) {
    this.robot.screenPosition.x += 5 * Math.sin(this.robot.angle * Math.PI / 180);
    this.robot.screenPosition.y -= 5 * Math.cos(this.robot.angle * Math.PI / 180);;
  }
}

RobotController.prototype.backward = function () {
  if (!this.status.connected) {
    this.robot.screenPosition.x -= 5 * Math.sin(this.robot.angle * Math.PI / 180);
    this.robot.screenPosition.y += 5 * Math.cos(this.robot.angle * Math.PI / 180);;
  }
}

RobotController.prototype.right = function () {
  this.robot.angle += 5;
}

RobotController.prototype.left = function () {
  this.robot.angle -= 5;
}
