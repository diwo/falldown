/* global Falldown */

'use strict';

Falldown.Input = function(canvas) {
  this.tilt = null;
  this.tapped = null;

  this.init(canvas);
};

Falldown.Input.prototype = {
  init: function(canvas) {
    var input = this;

    window.addEventListener('deviceorientation', function(event) {
      // TODO: refactor magic number
      var maxTilt = 45;
      input.tilt = Math.min(maxTilt, Math.abs(event.gamma)) * (event.gamma > 0 ? 1 : -1) / maxTilt;
    }, false);

    canvas.addEventListener('touchstart', function() {
      input.tapped = true;
    }, false);

    this.reset();
  },

  poll: function() {
    var inputData = {
      tilt: this.tilt,
      tapped: this.tapped
    };

    this.reset();

    return inputData;
  },

  reset: function() {
    this.tapped = false;
  }
};
