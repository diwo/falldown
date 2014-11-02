/* global Falldown */

'use strict';

Falldown.Input = function() {
  this.tilt = null;

  this.init();
};

Falldown.Input.prototype = {
  init: function() {
    var input = this;

    window.addEventListener('deviceorientation', function(event) {
      input.tilt = event.gamma;
    }, false);
  }
};
