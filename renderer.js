/* global Falldown */

'use strict';

Falldown.Renderer = function(canvas) {
  this.context = null;

  this.viewport = {
    width: null,
    height: null
  };
  this.devicePixelRatio = null;

  this.init(canvas);
};

Falldown.Renderer.prototype = {
  init: function(canvas) {
    this.context = canvas.getContext('2d');

    window.addEventListener('resize', this.resize.bind(this), false);

    this.resize();
  },

  resize: function() {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;

    // Disabled due to huge fps drop on mobile
    // this.devicePixelRatio = window.devicePixelRatio || 1;
    this.devicePixelRatio = 1;

    this.context.canvas.width = this.viewport.width * this.devicePixelRatio;
    this.context.canvas.height = this.viewport.height * this.devicePixelRatio;

    this.context.canvas.style.width = this.viewport.width;
    this.context.canvas.style.height = this.viewport.height;

    this.context.scale(this.devicePixelRatio, this.devicePixelRatio);
  },

  clearScreen: function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  },

  drawFrame: function(gameState) {
    // TODO: refactor drawing code to separate from data
    if (gameState.state === Falldown.GameState.State.TITLE) {
      this.drawTitle();
    } else if (gameState.state === Falldown.GameState.State.PLAYING) {
      this.drawPlaying(gameState);
    } else if (gameState.state === Falldown.GameState.State.PAUSED) {
      this.drawPaused(gameState);
    }

    this.drawFps(gameState.fps);
  },

  drawFps: function(fps) {
    var ctx = this.context;
    ctx.save();
    ctx.font = '16pt Arial';
    ctx.textBaseline = 'top';
    ctx.fillText('FPS: ' + Math.round(fps), 0, 0);
    ctx.restore();
  },

  drawTitle: function() {
    var renderer = this;
    var ctx = renderer.context;

    this.clearScreen();

    (function colorBackground() {
      ctx.save();

      ctx.fillStyle = '#FFFFCC';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.restore();
    })();

    (function drawTitle() {
      ctx.save();

      ctx.font = '72pt "Arial Black"';
      ctx.fillStyle = '#0066CC';
      ctx.strokeStyle = '#0033CC';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';

      ctx.fillText(Falldown.TITLE, renderer.viewport.width/2, renderer.viewport.height/3);
      ctx.strokeText(Falldown.TITLE, renderer.viewport.width/2, renderer.viewport.height/3);

      ctx.restore();
    })();

    (function drawStart() {
      ctx.save();

      ctx.font = '24pt Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      ctx.fillText('Tap to begin', renderer.viewport.width/2, renderer.viewport.height/3 + 20);

      ctx.restore();
    })();
  },

  drawPlaying: function(/* gameState */) {
    this.clearScreen();
  },

  drawPaused: function(/* gameState */) {
    this.clearScreen();
  }
};
