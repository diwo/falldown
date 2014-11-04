/* global Falldown */

'use strict';

Falldown.GameState = function() {
  this.state = null;
  this.fps = null;
  this.platforms = null;
  this.bottomPlatform = null;
  this.ball = null;

  this.reset();
};

Falldown.GameState.prototype = {
  reset: function() {
    this.state = Falldown.GameState.State.TITLE;
    this.fps = 0;
    this.platforms = [];
    this.topPlatform = null;
    this.bottomPlatform = null;
    this.ball = {
      x: 0.5,  // x center
      y: 0,    // y bottom
      vx: 0,
      vy: 0,
      radius: 1/30,
      platform: null
    };
  },

  update: function(deltaTime, inputData) {
    this.updateFps(deltaTime);

    if (this.state === Falldown.GameState.State.TITLE) {
      if (inputData.tapped) {
        this.state = Falldown.GameState.State.PLAYING;
      }
    } else if (this.state === Falldown.GameState.State.PLAYING) {
      this.updateGame(deltaTime, inputData);
    } else if (this.state === Falldown.GameState.State.GAMEOVER) {
      if (inputData.tapped) {
        this.reset();
      }
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

    if (this.ball.platform && this.isBallOnGap(this.ball, this.ball.platform)) {
      this.ball.platform = null;
    }
  },

  updatePlatforms: function(deltaTime) {
    var platformIndex = this.platforms.length;
    while (platformIndex--) {
      var platform = this.platforms[platformIndex];

      // TODO: refactor this number
      // fraction of screen height per second
      var platformSpeed = 0.4;

      // move existing platforms up
      var newYpos = platform.ypos - platformSpeed * deltaTime / 1000;
      // check if moving pass the ball
      if (newYpos <= this.ball.y && this.ball.y < platform.ypos && !this.isBallOnGap(this.ball, platform)) {
        this.ball.platform = platform;
        this.ball.y = newYpos;
        this.ball.vy = 0;
      }
      platform.ypos = newYpos;

      // delete old platforms
      if (platform.ypos < -0.05) {
        if (this.ball.platform === platform) {
          this.state = Falldown.GameState.State.GAMEOVER;
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
      if (!this.ball.platform && this.ball.y === 1 && !this.isBallOnGap(this.ball, newPlatform)) {
        this.ball.platform = newPlatform;
      }
    }
  },

  generatePlatform: function() {
    var platform = {
      ypos: 1.0,  // position of top edge
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
    var gravity = vterm / 0.2;
    var reverseMultiplier = 2;
    var maxAngle = Math.PI/3;

    // derive x/y acceleration components from tilt input
    var tiltRadian = (inputData.tilt || 0) * maxAngle;
    var dvx = gravity * Math.sin(tiltRadian) * deltaTime/1000;
    var dvy = gravity * Math.cos(tiltRadian) * deltaTime/1000;
    if (dvx * this.ball.vx < 0) {
      dvx *= reverseMultiplier;
    }

    // adjust velocity
    var vx = this.ball.vx + dvx;
    var vy = this.ball.vy + dvy;

    // limit velocity to upperbound
    var vdiag = Math.sqrt(vx*vx + vy*vy);
    if (vdiag > vterm) {
      vx = vx * vterm / vdiag;
      vy = vy * vterm / vdiag;
    }

    // calculate new position from velocity

    var x = this.ball.x + vx * deltaTime/1000;
    // limit ball position to screen boundaries
    if (x + this.ball.radius > 1) {
      x = 1 - this.ball.radius;
      vx = 0;
    } else if (x - this.ball.radius < 0) {
      x = this.ball.radius;
      vx = 0;
    }

    var y;
    // raise ball with platform if it's on one
    if (this.ball.platform) {
      y = this.ball.platform.ypos;
    } else {
      y = this.ball.y + vy * deltaTime/1000;

      // check if landing on a platform
      var closestCrossoverPlatform = null;
      for (var platformIndex=0; platformIndex<this.platforms.length; platformIndex++) {
        var platform = this.platforms[platformIndex];
        if (this.ball.y < platform.ypos && platform.ypos <= y) {
          if (!closestCrossoverPlatform || platform.ypos < closestCrossoverPlatform) {
            closestCrossoverPlatform = platform;
          }
        }
      }

      // TODO: ugly ugly ugly fixme!
      var tmpBall = {
        x: x,
        radius: this.ball.radius
      };
      if (closestCrossoverPlatform && !this.isBallOnGap(tmpBall, closestCrossoverPlatform)) {
        y = closestCrossoverPlatform.ypos;
        vy = 0;
        this.ball.platform = closestCrossoverPlatform;
      } else if (y > 1) {
        y = 1;
        vy = 0;
      }
    }

    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = vx;
    this.ball.vy = vy;
  },

  isBallOnGap: function(ball, platform) {
    var ballMinX = ball.x - ball.radius;
    var ballMaxX = ball.x + ball.radius;

    var gaps = platform.gaps;
    for (var gapIndex=0; gapIndex<gaps.length; gapIndex++) {
      var gap = gaps[gapIndex];
      if (gap.start <= ballMinX && ballMaxX <= gap.end) {
        return true;
      }
    }
    return false;
  }
};

Falldown.GameState.State = {
  TITLE: 0,
  PLAYING: 1,
  GAMEOVER: 2
};

