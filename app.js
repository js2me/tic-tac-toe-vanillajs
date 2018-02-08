(function() {
  var app = angular.module('gameOfLife', []);

  app.controller("GameController", function(){

    var ctrl = this;

    var blankBoard = [
      null, null, null,
      null, null, null,
      null, null, null
    ];

    this.board = blankBoard.slice(0);

    this.lines = [
      // rows:
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],

      // cols:
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],

      // diags:
      [0, 4, 8],
      [2, 4, 6]
    ];

    // computer / user / draws
    this.wins = [0,0,0];

    this.step = 1;
    this.draw = false;
    this.winner = null;
    this.computerSelected = [];

    this.corners = [0, 2, 6, 8];

    this.gamesCount = 0;

    var init = function() {
      ctrl.computerMove();
      ctrl._startToast('Computer starts!');
    };

    this.restart = function() {
      this.gamesCount += 1;

      this.board = blankBoard.slice(0);
      this.winner = null;
      this.draw = false;
      this.isOver = false;
      this.computerSelected = [];
      this.step = 1;

      if ((this.gamesCount % 2) === 0) {
        ctrl.computerMove();
        ctrl._startToast('Computer starts!');
      } else {
        ctrl._startToast('You start!');
      }
    }

    this._startToast = function(msg) {
      setTimeout(function(){
        Materialize.toast(msg, 2000);
      }, 200);
    };

    this.fillLine = function(expectedValue, inputValue) {
      var countInLine,
          cellValue,
          missingCells,
          line,
          inputSet = false;

      _.each(ctrl.lines, function(line){

        if (inputSet) return; // break dla ubogich

        countInLine = 0;
        missingCells = null;
        cellValue = null;

        _.each(line, function(idx){

          cellValue = ctrl._readCell(idx);

          // cell matches expected result
          if (cellValue === expectedValue) {
            countInLine += 1;

          // there is a blank space in line
          } else if (cellValue === null) {
            missingCells = idx;
          }
        });

        if (countInLine === 2 && missingCells) {
          ctrl._setCell(missingCells, inputValue);
          inputSet = true;
        }
      });
      return inputSet;
    };


    this._computerSetCell = function(idx) {
      ctrl._setCell(idx, 0);
      ctrl.computerSelected.push(idx);
    }

    this.computerMove = function() {

      if (ctrl.step === 1) {
        var randomCorner = ctrl.corners[Math.floor(Math.random()*ctrl.corners.length)];
        ctrl._computerSetCell(randomCorner);

      } else if (ctrl.step === 2) {

        var oppositeCorner = ctrl.oppositeCorner(ctrl.computerSelected[0]);

        var oppositeCornerVal = ctrl._readCell(oppositeCorner);

        // if opposite corner is free - go get that corner
        if (oppositeCornerVal === null) {

          ctrl._computerSetCell(oppositeCorner);

        } else { // otherwise get some other free corner

          var freeCorner = ctrl._freeCorners()[0];

          ctrl._computerSetCell(freeCorner);

        }

      } else if (ctrl.step >= 3) {

        // try to fill line occupied by computer with 2 cells already occupied
        if (!ctrl.fillLine(0,0)) {

          // try to block human line with 2 cells already occupied
          if (!ctrl.fillLine(1,0)){

            var freeCorners = ctrl._freeCorners();

            // try to go in empty corner
            if (freeCorners.length) {

              var firstFreeCorner = freeCorners[0];

              ctrl._computerSetCell(firstFreeCorner);

            // go to random free cell
            } else {
              var randFreeCell = ctrl._freeCells()[0];
              ctrl._computerSetCell(randFreeCell);

            }
          };
        };

      } else {
        console.error('Something wrong! Unexpected step.')
      }
    };

    this.oppositeCorner = function(idx) {

      switch (idx) {
        case 0:
          return 8;
          break;
        case 2:
          return 6;
          break;
        case 6:
          return 2;
          break;
        case 8:
          return 0;
          break;
      }
    };

    // caution: used by human only
    this.humanSelectCell = function(idx, value) {
      var curVal = ctrl._readCell(idx);

      if (ctrl.isOver) return false;

      if (curVal === null) {

        ctrl._setCell(idx, 1);
        ctrl.step += 1;
        ctrl.computerMove();

      } else {
        return false;
      }
    };

    this.checkOver = function() {
      var counts, possibleWinner, cellValue;

      _.each(this.lines, function(line){

        if (ctrl.isOver) return;

        counts = [0, 0]; // [computer, human]

        _.each(line, function(idx){

          cellValue = ctrl._readCell(idx);

          counts[cellValue] = counts[cellValue] + 1;

        });

        possibleWinner = counts.indexOf(3);

        if (possibleWinner !== -1) {
          ctrl.isOver = true;
          ctrl.winner = possibleWinner === 0 ? 'Computer' : 'You';

          ctrl.wins[possibleWinner] += 1;

          ctrl._fireToast(ctrl.winner + ' won!');

        } else if (ctrl.board.indexOf(null) === -1) {
          ctrl.isOver = true;
          ctrl.draw = true;

          ctrl.wins[2] += 1;

          ctrl._fireToast('We got a draw!');

        }

      });
    };

    this._fireToast = function(text) {
      var toastContent = $('<span>'+text+'<a id="toast-restart" style="margin-left:14px;" class="btn-floating waves-effect waves-light red"><i class="material-icons">replay</i></a>');
      Materialize.toast(toastContent, 1000000000);
    };

    this._readCell = function(idx) {
      return ctrl.board[idx];
    };

    this._setCell = function(idx, value) {
      ctrl.board[idx] = value;
      ctrl.checkOver();
    };

    this._freeCells = function() {
      var freeCells = [];

      _.each(ctrl.board, function(value, idx){
         if (value === null) {
          freeCells.push(idx);
         };
      });

      return freeCells;
    };

    this._freeCorners = function() {
      return ctrl._freeCells().filter(function(n) {
        return ctrl.corners.indexOf(n) != -1;
      });
    };

    init();

  });
})();
