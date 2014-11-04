/* global Falldown */

'use strict';

Falldown.GameState = function() {
  this.state = Falldown.GameState.State.TITLE;
  this.fps = 0;
  this.platforms = [];
  this.topPlatform = null;
  this.bottomPlatform = null;
  this.ball = {
    x: 0.5,
    vx: 0,
    y: 0,
    vy: 0,
    radius: 1/30,
    platform: null
  };
};

Falldown.GameState.prototype = {
  update: function(deltaTime, inputData) {
    this.updateFps(deltaTime);

    if (this.state === Falldown.GameState.State.TITLE) {
      if (inputData.tapped) {
        this.state = Falldown.GameState.State.PLAYING;
      }
    } else if (this.state === Falldown.GameState.State.PLAYING) {
      this.updateGame(deltaTime, inputData);
    }
  },

  updateFps: function(deltaTime) {
    var currentFps = 0;
    if (deltaTime) {
      currentFps = 1000 / deltaTime;
    }

    this.fps = currentFps * 0.9 + this.fps * 0.1;
  },

  updateGame: function(deltaTime, inputData) {
    this.updatePlatforms(deltaTime);
    this.moveBall(deltaTime, inputData);
  },

  updatePlatforms: function(deltaTime) {
    var platformIndex = this.platforms.length;
    while (platformIndex--) {
      var platform = this.platforms[platformIndex];

      // TODO: refactor this number
      // fraction of screen height per second
      var platformSpeed = 0.3;

      // move existing platforms up
      platform.ypos -= platformSpeed * deltaTime / 1000;

      // delete old platforms
      if (platform.ypos < -0.05) {
        if (this.ball.platform === platform) {
          // game over
        }
        this.platforms.splice(platformIndex, 1);
      }
    }

    // create new platform
    // TODO: refactor this number
    // fraction of screen height
    var spaceBetweenPlatforms = 0.25;
    if (!this.bottomPlatform || this.bottomPlatform.ypos + spaceBetweenPlatforms < 1) {
      var newPlatform = this.generatePlatform();
      this.platforms.push(newPlatform);
      this.bottomPlatform = newPlatform;
    }
  },

  generatePlatform: function() {
    var platform = {
      ypos: 1.0,
      gaps: []
    };

    // TODO: refactor magic numbers
    var platformQuantizationSize = 10;
    var minNumberOfGaps = 1;
    var maxNumberOfGaps = 3;
    var numberOfGaps = Math.floor(Math.random() * (maxNumberOfGaps - minNumberOfGaps)) + minNumberOfGaps;

    var chunks = Array.apply(null, new Array(platformQuantizationSize)).map(function(_, i) { return i; });
    while (chunks.length > numberOfGaps) {
      chunks.splice(Math.floor(Math.random() * chunks.length), 1);
    }

    while (chunks.length) {
      var chunk = chunks.shift();
      var gap = {
        start: chunk/platformQuantizationSize,
        end: (chunk + 1)/platformQuantizationSize
      };
      while (chunks[0] === chunk + 1) {
        chunk = chunks.shift();
        gap.end += 1/platformQuantizationSize;
      }
      if (chunk === platformQuantizationSize - 1) {
        gap.end = 1.0;
      }
      platform.gaps.push(gap);
    }

    return platform;
  },

  moveBall: function(deltaTime, inputData) {
    // TODO: refactor magic numbers
    // fraction of screen height per second
    var vterm = 1.2;
    // fraction of screen height per second per second
    var gravity = vterm / 0.3;
    var reverseMultiplier = 3;
    var maxAngle = Math.PI/4;

    var tiltRadian = (inputData.tilt || 0) * maxAngle;
    var dvx = gravity * Math.sin(tiltRadian) * deltaTime/1000;
    var dvy = gravity * Math.cos(tiltRadian) * deltaTime/1000;
    if (dvx * this.ball.vx < 0) {
      dvx *= reverseMultiplier;
    }

    var vx = this.ball.vx + dvx;
    var vy = this.ball.vy + dvy;

    var vdiag = Math.sqrt(vx*vx + vy*vy);
    if (vdiag > vterm) {
      vx = vx * vterm / vdiag;
      vy = vy * vterm / vdiag;
    }

    var x = this.ball.x + vx * deltaTime/1000;
    var y = this.ball.y + vy * deltaTime/1000;

    if (x + this.ball.radius > 1) {
      x = 1 - this.ball.radius;
      vx = 0;
    } else if (x - this.ball.radius < 0) {
      x = this.ball.radius;
      vx = 0;
    }

    if (y + this.ball.radius > 1) {
      y = 1 - this.ball.radius;
      vy = 0;
    }

    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = vx;
    this.ball.vy = vy;
  }
};

Falldown.GameState.State = {
  TITLE: 0,
  PLAYING: 1,
  PAUSED: 2
};

