var http = require("http");
var os = require('os');

function TelemetryMonitor (robot) {
  this.robot = robot;
  this.robot.telemetry = {};
  this.telemetryChanged = false;
}

TelemetryMonitor.prototype.updateViewer = function (xMove, yMove, angle) {
  this.robot.history.unshift({
    "x": xMove,
    "y": yMove
  });
  this.robot.angle = angle;
}

TelemetryMonitor.prototype.getTelemetry = function () {
  let self = this;
  http.get({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/telemetry',
    method: 'GET',
  }, function(response) {
      var feed = '';
      response.on('data', function(data) {
          feed += data;
      });
      response.on('end', function() {
        let currentFeed = JSON.parse(feed);
        if ("commands" in self.robot.telemetry && "commands" in currentFeed) {
          let recordedCommandCount = self.robot.telemetry.commands.length;
          let currentFeedCommandCount = currentFeed.commands.length;
          self.telemetryChanged = recordedCommandCount != currentFeedCommandCount;
        }
        else {
          self.telemetryChanged = true;
        }
        self.robot.telemetry = currentFeed;
      });
  });
}

TelemetryMonitor.prototype.getAbsoluteData = function () {
  let self = this;
  http.get({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/telemetry/absolute',
    method: 'GET'
  }, function(response) {
    var absFeed = '';
    response.on('data', function(data) {
      absFeed += data;
    });
    response.on('end', function () {
      let currentAbsFeed = JSON.parse(absFeed);
      self.robot.absolutePosition = currentAbsFeed.position;
      self.robot.extrema = currentAbsFeed.extrema;
      self.robot.obstacleField = currentAbsFeed.obstacleField;
    });
  });
}

TelemetryMonitor.prototype.monitor = function () {
  let self = this;
  setInterval(function () {
    self.getTelemetry();
    self.getAbsoluteData();
    if (self.telemetryChanged && self.robot.telemetry.telemetry.length >= self.robot.history.length) {
      for (let i = self.robot.history.length; i < self.robot.telemetry.telemetry.length; ++i) {
        self.robot.history.unshift({
          'x': self.robot.telemetry.telemetry[i].displacement.x,
          'y': self.robot.telemetry.telemetry[i].displacement.y,
          'angle': self.robot.telemetry.telemetry[i].angle,
          'obstacle': self.robot.telemetry.telemetry[i].ultrasonic
        });
        self.robot.angle = self.robot.telemetry.telemetry[i].angle % 360;
      }
    }
  }, 5);
}
