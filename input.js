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
      input.tilt = event.gamma;
    }, false);

    canvas.addEventListener('touchstart', function() {
      input.tapped = true;
    }, false);

    this.reset();
  },

  poll: function() {
    var state = {
      tilt: this.tilt,
      tapped: this.tapped
    };

    this.reset();

    return state;
  },

  reset: function() {
    this.tapped = false;
  }
};
