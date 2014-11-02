/* global Falldown */

'use strict';

Falldown.GameState = function() {
  this.state = Falldown.GameState.State.TITLE;
};

Falldown.GameState.prototype = {
  update: function(/* deltaTime, inputData */) {}
};

Falldown.GameState.State = {
  TITLE: 0,
  PLAYING: 1,
  PAUSED: 2
};

