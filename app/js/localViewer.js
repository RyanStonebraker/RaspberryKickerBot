var viewer = {
    width: 1200,
    height: 800,
    refreshRate: 60
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
    this.localCtx.clearRect(0, 0, viewer.width, viewer.height);
  }

  this.updateLocalViewer();
  window.addEventListener('keydown', this.keys.bind(this), true);
}

LocalViewer.prototype.updateLocalViewer = function () {
  var self = this;
  setTimeout(function() {
    requestAnimationFrame(function(){
      self.updateLocalViewer();
    })
  }, 1000/viewer.refreshRate);

  this.localCtx.clearRect(0, 0, viewer.width, viewer.height);
};

LocalViewer.prototype.keys = function (evt) {
  switch(evt.keyCode) {
    case key.manual:
      break;
  }
}
