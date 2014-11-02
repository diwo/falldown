// falldown.js

'use strict';

var Falldown = function() {
  this.gameState = null;
  this.renderer = null;
  this.input = null;
};

Falldown.prototype = {
  init: function() {
    this.renderer = new Falldown.Renderer();
    this.input = new Falldown.Input();

    this.reset();
    this.gameLoop();
  },

  reset: function() {
    this.gameState = new Falldown.State();
  },

  gameLoop: function() {
    var falldown = this;
    window.requestAnimationFrame(function(){ falldown.gameLoop(); });

    // TODO: track fps
    var deltaTimeMS = null;

    this.renderer.clearScreen();

    if (!this.gameState.started) {
      this.renderer.drawTitle();
    } else if (!this.gameState.running) {
      this.renderer.drawPause();
    } else {
      this.updateFrame(deltaTimeMS);
      this.renderer.drawFrame();
    }
  },

  updateFrame: function() {
    // update game state
  }
};

Falldown.TITLE = 'Falldown';
