/* global Falldown */

'use strict';

Falldown.GameState = function() {
  this.state = Falldown.GameState.State.TITLE;
  this.fps = null;
};

Falldown.GameState.prototype = {
  update: function(deltaTime/*, inputData*/) {
    this.updateFps(deltaTime);
  },

  updateFps: function(deltaTime) {
    var lastFps = this.fps || 0;
    var currentFps = 0;
    if (deltaTime) {
      currentFps = 1000 / deltaTime;
    }

    this.fps = currentFps * 0.9 + lastFps * 0.1;
  },
};

Falldown.GameState.State = {
  TITLE: 0,
  PLAYING: 1,
  PAUSED: 2
};

