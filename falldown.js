// falldown.js

'use strict';

var Falldown = function() {
  this.gameState = null;
  this.renderer = null;
  this.input = null;
  this.lastTimestamp = null;
};

Falldown.prototype = {
  init: function() {
    var canvas = document.getElementById('canvas');

    this.renderer = new Falldown.Renderer(canvas);
    this.input = new Falldown.Input(canvas);

    this.reset();
    this.gameLoop();
  },

  reset: function() {
    this.gameState = new Falldown.GameState();
  },

  gameLoop: function(timestamp) {
    var falldown = this;
    window.requestAnimationFrame(function(ts){ falldown.gameLoop(ts); });

    var deltaTime = this.updateTimestamp(timestamp);
    var inputData = this.input.poll();

    this.gameState.update(deltaTime, inputData);
    this.renderer.drawFrame(this.gameState);
  },

  updateTimestamp: function(timestamp) {
    var lastTimestamp = this.lastTimestamp;
    this.lastTimestamp = timestamp;
    return lastTimestamp ? timestamp - lastTimestamp : 0;
  }
};

Falldown.TITLE = 'Falldown';
