'use strict'

const BOMB = '💣︎'
const FLAG = '🚩'
var gBoard = [];
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isFirstClick: true
}
var gLevel = {
    size: 4,
    mines: 2
}
var gTimerInterval = null;

function initGame() {
    gGame.isOn = true;
    gGame.secsPassed = 0;
    gGame.isFirstClick = true;
    buildBoard(gLevel.size);
    renderBoard();
}

function buildBoard(rowsLength) {
    for (var i = 0; i < rowsLength; i++) {
        gBoard[i] = []
        for (var j = 0; j < rowsLength; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gBoard[i][j] = cell
        }
    }
    setMines();
    setMinesNegsCount();
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            // add class mine and shown according to model
            var className = (cell.isMine) ? 'mine' : ''
            className += (cell.isShown) ? ' shown' : ''

            var strInnerText = (cell.isMine) ? BOMB : cell.minesAroundCount;
            if (cell.minesAroundCount === 0 && !cell.isMine) strInnerText = '';

            strHTML += `<td class="cell ${className}" data-location="${i},${j}" 
                            onclick="cellClicked(this, ${i}, ${j})"
                            oncontextmenu="javascript:rihgtClick(this, ${i}, ${j});return false;">
                            <span class="text">${strInnerText}</span>
                            <span class="flag">${FLAG}</span>
                        </td>`
        }
        strHTML += `</tr>`
    }
    var elMat = document.querySelector('.mine-mat');
    elMat.innerHTML = strHTML;
}

function difficulty(diff) {
    clearInterval(gTimerInterval);
    gLevel.size = +diff.dataset.size;
    gLevel.mines = +diff.dataset.mines;
    gBoard = [];
    initGame();
}

function setMines() {
    var locations = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            locations.push({ i, j });
        }
    }
    for (var i = 0; i < gLevel.mines; i++) {
        var randIdx = getRandomIntInclusive(0, locations.length - 1);
        var randLocation = locations.splice(randIdx, 1)[0];
        var randCell = gBoard[randLocation.i][randLocation.j];
        randCell.isMine = true;
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            var count = countMineNegs(i, j);
            cell.minesAroundCount = count;
        }
    }
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    var currCell = gBoard[i][j];
    if (currCell.isMarked) return;
    //model:
    currCell.isShown = true;
    //dom:
    elCell.classList.add('shown');
    
    if (gGame.isFirstClick) timer();
    if (currCell.minesAroundCount === 0 && !currCell.isMine) openSurroundingCells(i, j);
    if (currCell.isMine) {
        elCell.classList.add('red');
        GameOver(false);
    }    

    checkGameOver()
}

function rihgtClick(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;
    //model:
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    //dom:
    elCell.classList.toggle('marked')
    if (gGame.isFirstClick) timer();
    checkGameOver()
    return false;
}

function checkGameOver() {  //func cheks if all flags are marked and all other cells are shown
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine && cell.isMarked) continue;
            if (cell.isShown) continue;
            else return;
        }
    }
    GameOver(true);
}

function openSurroundingCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = gBoard[i][j];
            if (cell.isShown) continue;
            //model:
            cell.isShown = true;
            //dom:
            var elCell = document.querySelector(`[data-location="${i},${j}"]`);
            elCell.classList.add('shown');

            if (cell.minesAroundCount === 0) openSurroundingCells(i, j);
        }
    }
}

function GameOver(isWin) {
    clearInterval(gTimerInterval);
    if (isWin) {     //add relevant Functionality
        console.log('hooray you won the game!')
    }
    else {    //lose         //add relevant Functionality-messege,restart, clearInterval...
        gGame.isOn = false;
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var cell = gBoard[i][j];
                if (cell.isMine) {
                    //model:
                    cell.isShown = true;
                    cell.isMarked = false;
                    //dom:
                    var elCell = document.querySelector(`[data-location="${i},${j}"]`);
                    elCell.classList.add('shown');
                    elCell.classList.remove('marked');
                }
            }
        }
    }
}

function timer() {
    gGame.isFirstClick = false;
    gTimerInterval = setInterval(() => {
        gGame.secsPassed++;
        var elTimer = document.querySelector('.seconds');
        elTimer.innerText = gGame.secsPassed;
    }, 1000)

}