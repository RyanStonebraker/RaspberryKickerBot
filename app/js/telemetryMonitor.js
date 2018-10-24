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


// use HTTP library to do a get request for telemetry
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

TelemetryMonitor.prototype.monitor = function () {
  let self = this;
  setInterval(function () {
    self.getTelemetry();
    if (self.telemetryChanged && self.robot.telemetry.telemetry.length >= self.robot.history.length) {
      for (let i = self.robot.history.length; i < self.robot.telemetry.telemetry.length; ++i) {
        self.robot.history.unshift({
          'x': self.robot.telemetry.telemetry[i].displacement.x,
          'y': self.robot.telemetry.telemetry[i].displacement.y
        });
        self.robot.angle = self.robot.telemetry.telemetry[i].angle % 360;
      }

      // var cpus = os.cpus();
      // for(var i = 0, len = cpus.length; i < len; i++) {
      //     console.log("CPU %s:", i);
      //     var cpu = cpus[i], total = 0;
      //
      //     for(var type in cpu.times) {
      //         total += cpu.times[type];
      //     }
      //
      //     for(type in cpu.times) {
      //         console.log("\t", type, Math.round(100 * cpu.times[type] / total));
      //     }
      // }
      // console.log("Interval Time:", os.freemem()/os.totalmem() * 100);
    }
  }, 10);
}
