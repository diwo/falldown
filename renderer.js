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
    } else if (gameState.state === Falldown.GameState.State.GAMEOVER) {
      this.drawGameover();
    }

    // TODO: refactor globals
    var drawFps = false;
    if (drawFps) {
      this.drawFps(gameState.fps);
    }
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

    renderer.clearScreen();

    (function colorBackground() {
      ctx.save();

      ctx.fillStyle = '#BDE8BC';
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

  drawPlaying: function(gameState) {
    var renderer = this;
    var ctx = renderer.context;

    renderer.clearScreen();

    (function colorBackground() {
      ctx.save();

      ctx.fillStyle = '#BDE8BC';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.restore();
    })();

    (function drawPlatforms() {
      ctx.save();
      ctx.fillStyle = '#5984CF';
      ctx.lineWidth = 5;
      for (var platformIndex=0; platformIndex<gameState.platforms.length; platformIndex++) {
        var platform = gameState.platforms[platformIndex];
        var ypos = renderer.viewport.height * platform.ypos;

        var platformChunks = (function(gaps) {
          var chunks = [];
          var start = 0;

          for (var gapIndex=0; gapIndex<gaps.length; gapIndex++) {
            var gap = gaps[gapIndex];
            if (start < gap.start) {
              chunks.push({
                start: start,
                end: gap.start
              });
            }
            start = gap.end;
          }

          if (start < 1) {
            chunks.push({
              start: start,
              end: 1
            });
          }

          return chunks;
        })(platform.gaps);

        for (var chunkIndex=0; chunkIndex<platformChunks.length; chunkIndex++) {
          var chunk = platformChunks[chunkIndex];
          var x = renderer.viewport.width * chunk.start;
          var y = ypos;
          var width = renderer.viewport.width * (chunk.end - chunk.start);
          var height = renderer.viewport.height * 0.02;

          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
        }
      }
      ctx.restore();
    })();

    (function drawBall() {
      ctx.save();
      ctx.fillStyle = '#FF0000';
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.arc(renderer.viewport.width * gameState.ball.x,
              renderer.viewport.height * gameState.ball.y - renderer.viewport.width * gameState.ball.radius,
              renderer.viewport.width * gameState.ball.radius,
              0, Math.PI*2, false);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    })();
  },

  drawGameover: function() {
    var renderer = this;
    var ctx = renderer.context;

    this.clearScreen();

    (function colorBackground() {
      ctx.save();

      ctx.fillStyle = '#E8CDBC';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.restore();
    })();

    (function drawGameover() {
      ctx.save();

      ctx.font = '72pt "Arial Black"';
      ctx.fillStyle = '#FF0000';
      ctx.strokeStyle = '#EE0000';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';

      var gameoverMsg = 'Game Over';
      ctx.fillText(gameoverMsg, renderer.viewport.width/2, renderer.viewport.height/3);
      ctx.strokeText(gameoverMsg, renderer.viewport.width/2, renderer.viewport.height/3);

      ctx.restore();
    })();

    (function drawTaunt() {
      ctx.save();

      ctx.font = '24pt Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      ctx.fillText('You suck', renderer.viewport.width/2, renderer.viewport.height/3 + 20);

      ctx.restore();
    })();
  }
};
