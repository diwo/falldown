/* global Falldown */

'use strict';

Falldown.GameState = function() {
  this.state = Falldown.GameState.State.TITLE;
  this.fps = null;
  this.platforms = [];
  this.topPlatform = null;
  this.bottomPlatform = null;
  this.ball = {
    x: null,
    dx: 0,
    y: null,
    dy: 0,
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
    var lastFps = this.fps || 0;
    var currentFps = 0;
    if (deltaTime) {
      currentFps = 1000 / deltaTime;
    }

    this.fps = currentFps * 0.9 + lastFps * 0.1;
  },

  updateGame: function(deltaTime, inputData) {
    this.updatePlatforms(deltaTime);
    this.moveBall(inputData);
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
      if (platform.ypos < 0) {
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
    var platformQuantizationSize = 8;
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

  moveBall: function() {}
};

Falldown.GameState.State = {
  TITLE: 0,
  PLAYING: 1,
  PAUSED: 2
};

