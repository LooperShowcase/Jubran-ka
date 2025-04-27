/**
 * This game implements the 'Ten-pin bowling'.
 * A player rolls a bowling ball down a wooden lane with the
 * objective of scoring points by knocking down as many pins as possible.
 * 
 * @author Stephan Malek
 * 
 * Gist shows just the core part, assets like html and css will be later found in a git repo.
 *
 * @class GameModel
 * @constructor
 */
var GameModel = function () {

    /**
     * Indicates the current bowling frame.
     *
     * @property currentFrame
     * @type Number
     * @default 0
     */
    var currentFrame = 0;
  
    /**
     * Indicates the current players roll.
     *
     * @property currentRoll
     * @type Number
     * @default 0
     */
    var currentRoll = 0;
  
    /**
     * Is the players roll in a frame the first one?
     *
     * @property isFirstRoll
     * @type Boolean
     * @default true
     */
    var isFirstRoll = true;
  
    /**
     * Memory of all player throws.
     *
     * @property rolls
     * @type Object
     * @default true
     */
    var rolls = [];
  
    // default every roll has 0 points
    for (var i = 0; i < 21; i++) {
      rolls.push(0);
    }
  
    /**
     * This function covers the players throw.
     *
     * @method roll
     * @param {number} hitPins Fallen Pins in a throw.
     * @chainable
     */
    this.roll = function (hitPins) {
      rolls[currentRoll] = hitPins;
      currentRoll++;
  
      /**
       * Clipping currentFrame
       * Compare frameIndex if it is equal to the boundary 10.
       *
       * @param {number} frameIndex Current frame index.
       * @return {number} Next Frame.
       */
      var incrementFrame = function (frameIndex) {
        return Math.min(10, frameIndex + 1);
      };
  
      // first throw in current frame?
      if (isFirstRoll) {
        // is strike?
        if (hitPins === 10) {
          currentFrame = incrementFrame(currentFrame);
        }
        else {
          isFirstRoll = false;
        }
      }
      else {
        // reset for next frame
        isFirstRoll = true;
        currentFrame = incrementFrame(currentFrame);
      }
  
      return this;
    };
  
    /**
     * Scoring.
     * There are three kinds of marks give a score.
     * - strike: all ten pins down in the first throw
     * - spare: all ten pins down in the second throw
     * - open: one or more missed pins still standing after the second throw
     *
     * @method getScore
     * @return {number}totalScore Total Score of all played frames.
     */
  
    this.getScore = function () {
      var totalScore = 0;
      var scoreIndex = 0;
  
      for (var frame = 0; frame < currentFrame; frame++) {
        // strike: ten points + the points for the next 2 balls thrown
        if (this.isStrike(scoreIndex)) {
          scoreIndex++;
          totalScore += 10 + this.strikeBonus(scoreIndex);
        }
        // spare: ten points + the points for the next ball thrown
        else if (this.isSpare(scoreIndex)) {
          scoreIndex += 2;
          totalScore += 10 + this.spareBonus(scoreIndex);
        }
        // open: count the value of the current pinfall
        else {
          totalScore += this.sumOfFrame(scoreIndex);
          scoreIndex += 2;
        }
      }
  
      return totalScore;
    };
  
    /**
     * Return the points of the frame pinfall
     *
     * @method sumOfFrame
     * @param {number} scoreIndex
     * @return {number} Sum of the Frame.
     */
    this.sumOfFrame = function (scoreIndex) {
      return rolls[scoreIndex] + rolls[scoreIndex + 1];
    };
  
    /**
     * Return the points for the next ball thrown.
     *
     * @method spareBonus
     * @param {number} scoreIndex
     * @return {number} Bonus points of the next throw.
     */
    this.spareBonus = function (scoreIndex) {
      return rolls[scoreIndex];
    };
  
    /**
     * Bonus points of the next 2 throws.
     *
     * @method strikeBonus
     * @param {number} scoreIndex
     * @return {number} Bonus points of the next 2 throws.
     */
    this.strikeBonus = function (scoreIndex) {
      return rolls[scoreIndex] + rolls[scoreIndex + 1];
    };
  
    /**
     * Check if all ten pins down in the first throw.
     *
     * @method isStrike
     * @param {number} scoreIndex
     * @return {boolean} True if all pins down.
     */
    this.isStrike = function (scoreIndex) {
      return rolls[scoreIndex] == 10;
    };
  
    /**
     * Check if all ten pins down in the second throw.
     *
     * @method isSpare
     * @param {number} scoreIndex
     * @return {boolean} True if all pins down.
     */
    this.isSpare = function (scoreIndex) {
      return rolls[scoreIndex] + rolls[scoreIndex + 1] == 10;
    };
  };
  
  /**
   * Bowling game loop.
   */
  var Game = function (player, data) {
    this.player = player;
  
    /**
     * Game options.
     */
    var options = {
      outputService: null // display service
    };
  
    /**
     * Reference of game model.
     * @property gameOver
     * @type Object
     */
    var gameModel = new GameModel();
  
    /**
     * Pointer of score array in game model.
     * @property scoreIndex
     * @type Number
     */
    var scoreIndex = 0;
  
    /**
     * Pins, which are left. Updated after a throw.
     * @property pinsLeft
     * @type Number
     */
    var pinsLeft = 10;
  
    /**
     * Frame indicator.
     * @property frameIndex
     * @type Number
     */
    var frameIndex = 1;
  
    /**
     * Counter of rolls / throws.
     * @property rollCount
     * @type Number
     */
    var rollCount = 1;
  
    /**
     * Bonus Roll.
     * @property bonusRoll
     * @type Boolean
     */
    var bonusRoll = true;
  
    // getter getModel()
    this.getModel = function () {
      return gameModel;
    };
  
    // getter getFrameIndex()
    this.getFrameIndex = function () {
      return frameIndex;
    };
  
    // getter getRollCount()
    this.getRollCount = function () {
      return rollCount;
    };
  
    // initialize
    if (typeof data === 'object') {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          if (typeof options[key] !== 'undefined') {
            options[key] = data[key];
          }
        }
      }
    }
  
    // reference of output
    var self = this;
  
    function handleFrames() {
      // strike
      if (gameModel.isStrike(scoreIndex)) {
        frameIndex += 1;
        rollCount += 2;
        pinsLeft = 10;
        scoreIndex += 1;
  
        self.player.turn = false;
      }
      // spare
      else if (gameModel.isSpare(scoreIndex)) {
        frameIndex += 1;
        rollCount += 1;
        pinsLeft = 10;
        scoreIndex += 2;
  
        self.player.turn = false;
      }
      // open frame
      else {
        if (rollCount % 2 === 0) {
          frameIndex += 1;
          pinsLeft = 10;
          scoreIndex += 2;
  
          self.player.turn = false;
        }
  
        rollCount += 1;
      }
    }
  
    var tIndex = 0;
  
    function handleTenthFrames() {
      if (gameModel.isStrike(scoreIndex)) {
        frameIndex = Math.min(10, frameIndex + 1);
        rollCount += 1;
      }
      // spare
      else if (gameModel.isSpare(scoreIndex)) {
        rollCount += 1;
      }
      // open frame
      else {
        if (tIndex >= 1) {
          bonusRoll = false;
          self.player.turn = false;
        }
  
        frameIndex = Math.min(10, frameIndex + 1);
        rollCount += 1;
      }
  
      if (tIndex >= 2) {
        self.player.turn = false;
      }
  
      tIndex++;
    }
  
    /**
     * Game loop.
     * Control players turn, reset pins, increase current frame
     * and get the calculated score.
     *
     * @return {number} current pinfall
     */
    this.roll = function (value) {
      // pre check
      if (rollCount > 21) {
        throw new Error('Game Over');
      }
  
      // count of pinfall
      var hitPins = Utility.random(pinsLeft + 1);
  
      // ~~ test feature ~~ overwrite hitPins with custom pinfall
      if (typeof value !== 'undefined') {
        hitPins = parseInt(value);
      }
      // ~~ /test feature ~~
  
      // notify model of fallen pins
      gameModel.roll(hitPins);
  
      // update rest of pins
      pinsLeft -= hitPins;
  
      // 2 field frame check
      if (rollCount <= 18) {
        handleFrames();
      } else {
        if (bonusRoll) {
          handleTenthFrames();
        } else {
          throw new Error('Game Over');
        }
      }
  
      return hitPins;
    };
  };
  
  /**
   * Simple Service which writes text into a textarea.
   */
  var TextService = function (textarea) {
    this.textarea = textarea;
  
    /**
     * Buffer output stream.
     * @type Object outputBuffer
     */
    var outputBuffer = [];
  
    /**
     * Write text and scroll down if text is more than scrollHeight.
     * @param {string} text Text to buffer
     */
    this.write = function (text) {
      outputBuffer.push(text + '\n');
  
      if (typeof textarea !== 'undefined') {
        this.textarea.innerHTML = outputBuffer.join('');
        this.textarea.scrollTop = textarea.scrollHeight;
      }
    }
  };
  
  /**
   * Player Class.
   * @param {number} id Players id.
   * @param {string} name Players name.
   */
  var Player = function (id, name) {
    this.id = id;
    this.name = name;
    this.turn = false;
    this.gameOver = false;
  };
  
  /**
   * Bowling Class. No one goes bowling without friends.
   * @param {object} players You and your friends.
   */
  var Bowling = function (players) {
    if (typeof players === 'undefined' || players.length < 1) {
      throw new Error('Bowling game needs at least one player');
    }
  
    // hold current player
    var currentPlayer = 0;
  
    // [DOM] get building table ref
    var bowlingTable = document.querySelector('#bowling-tables');
  
    // create an output service
    var textarea = document.querySelector('#score');
    var stream = new TextService(textarea);
  
    // # initialize
  
    // build game players
    var gamePlayers = players.map(function (player, i) {
      return new Player(i, player);
    });
  
    // build games
    var games = gamePlayers.map(function (gamePlayer) {
      return new Game(gamePlayer, {outputService: stream});
    });
  
    // build bowling tables
    gamePlayers.forEach(function (p) {
      var playerTable = Utility.buildBowlingTable(p);
      bowlingTable.appendChild(playerTable);
    });
  
    // set first game with player to true
    games[0].player.turn = true;
  
    /**
     * Toggle players turn.
     */
    function playerToggle() {
      // set from old player turn to false
      games[currentPlayer].player.turn = false;
  
      if (currentPlayer < players.length - 1) {
        // next player
        currentPlayer++;
  
        // turn on
        games[currentPlayer].player.turn = true;
      } else {
        // return to first player
        currentPlayer = 0;
        games[0].player.turn = true;
      }
    }
  
    // bind click event for user to throw a new ball
    Utility.bindEvent('click', '#roll', function (e) {
      e.preventDefault();
  
      var allPlayerGameOver = games.filter(function (game) {
        return game.player.gameOver;
      });
  
      if (allPlayerGameOver.length !== players.length) {
        if (!games[currentPlayer].player.turn) {
          playerToggle();
        }
  
        if (!games[currentPlayer].player.gameOver) {
          stream.write(games[currentPlayer].player.name + ', your bowl is running ...\n');
  
          // some delay, because the bowl needs time to hit the pins
          Utility.wait(100, function () {
            var g = games[currentPlayer];
  
            try {
              var hitPins = g.roll();
              Utility.table.write(bowlingTable, 'bowling' + g.player.id + (g.getRollCount() - 1), hitPins);
              Utility.table.write(bowlingTable, 'score' + g.player.id + (g.getFrameIndex() - 1), "" + g.getModel().getScore());
  
            } catch (e) {
              g.player.gameOver = true;
            }
          });
        }
      }
      else {
        gamePlayers.forEach(function (player) {
          stream.write(
            player.name + ', your total score is ' + games[currentPlayer].getModel().getScore()
          );
        });
      }
    })
      // bind click event for user to get the pinfall value and to set
      // input value as throw value
      .bindEvent('click', '#pinfallBtn', function (e) {
        e.preventDefault();
        var input = document.querySelector('#pinfall');
        var hitPins = input.value;
  
        if (!games[currentPlayer].player.turn) {
          playerToggle();
        }
  
        if (!games[currentPlayer].player.gameOver) {
          stream.write(games[currentPlayer].player.name + ', your bowl is running ...');
  
          // some delay, because the bowl needs time to hit the pins
          Utility.wait(100, function () {
            var g = games[currentPlayer];
            g.roll(hitPins); // hitPins
            Utility.table.write(bowlingTable, 'bowling' + g.player.id + (g.getRollCount() - 1), hitPins);
            Utility.table.write(bowlingTable, 'score' + g.player.id + (g.getFrameIndex() - 1), "" + g.getModel().getScore());
          });
        }
        else {
          stream.write('game over.');
        }
      });
  };
  
  new Bowling(['Stephan', 'Anna']);