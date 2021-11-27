'use strict'

const BOMB = '💣︎'
const FLAG = '🚩'
var gBoard = [];
var gGame = {
    isOn: true,
    isHintOn: false,
    shownCount: 0,      //isn't used by now
    markedCount: 0,     //isn't used by now
    secsPassed: 0,
    livesLeft: 3,
    hinstLeft: 3,
    isFirstClick: true,
    isFirstLeftClick: true
}
var gLevel = {
    size: 4,
    mines: 2
}
var gTimerInterval = null;

function initGame() {
    restart();
    buildBoard(gLevel.size);
    renderBoard();
    showScores();
}

function restart() {
    clearInterval(gTimerInterval);
    gGame.isOn = true;
    gGame.secsPassed = 0;
    gGame.isFirstClick = true;
    gGame.isFirstLeftClick = true;
    gGame.livesLeft = 3;
    gGame.hinstLeft = 3;
    gBoard = [];
    document.querySelector('.lives').innerText = '❤❤❤'
    document.querySelector('.imoji').innerText = '😃'
    document.querySelector('.seconds').innerText = 0;
    document.querySelector('.hints').innerText = `💡 3`
}

function buildBoard(rowsLength) {
    for (var i = 0; i < rowsLength; i++) {
        gBoard[i] = []
        for (var j = 0; j < rowsLength; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gBoard[i][j] = cell
        }
    }
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
                            oncontextmenu="javascript:rihgtClick(this, ${i}, ${j});return false;"
                            onmousedown="WhichButton(event, ${i}, ${j})">
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
    initGame();
}

function setMines(idxI, idxJ) {
    var locations = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (i === idxI && j === idxJ) continue;
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
    if (gGame.isHintOn) {
        showHint(i, j);
        return;
    }
    if (gBoard[i][j].isMarked) return;

    if (gGame.isFirstLeftClick) {       //rerenders board so first click can't be mine
        gGame.isFirstLeftClick = false;
        setMines(i, j);
        setMinesNegsCount();
        renderBoard();
    }

    var currCell = gBoard[i][j];
    elCell = document.querySelector(`[data-location="${i},${j}"]`);
    //model:
    currCell.isShown = true;
    //dom:
    elCell.classList.add('shown');

    if (gGame.isFirstClick) timer();
    if (currCell.minesAroundCount === 0 && !currCell.isMine) openSurroundingCells(i, j);

    if (currCell.isMine) {
        mineClick(elCell, i, j);
    } else checkGameOver();
}

function mineClick(elCell, i, j) {
    gGame.livesLeft--;
    if (gGame.livesLeft > 0) {
        showCell1Sec(elCell, i, j);
    } else {
        elCell.classList.add('red');
        GameOver(false);
    }
    renderLives(); 
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
    if (isWin) {      //winning  //add relevant Functionality
        console.log('hooray you won the game!')
        document.querySelector('.imoji').innerText = '😎'
        bestScores();
    }
    else {    //lose         //add relevant Functionality-messege,
        gGame.isOn = false;
        document.querySelector('.imoji').innerText = '🤯'
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

function renderLives() {
    var strLivesText = '';
    if (gGame.livesLeft === 2) strLivesText = '❤❤'
    if (gGame.livesLeft === 1) strLivesText = '❤'
    if (gGame.livesLeft === 0) strLivesText = ''

    var elLives = document.querySelector('.lives');
    elLives.innerText = strLivesText;
}

function showCell1Sec(elCell, i, j) {
    elCell.classList.add('red')
    elCell.classList.add('shown')
    document.querySelector('.imoji').innerText = '🤯'

    setTimeout(() => {
        //model:
        gBoard[i][j].isShown = false;
        //dom:
        elCell.classList.remove('red')
        elCell.classList.remove('shown')
        document.querySelector('.imoji').innerText = '😃'
    }, 1000)

}

function hintOn() {
    if (gGame.isFirstLeftClick) return;
    var elHints = document.querySelector('.hints');
    if (gGame.isHintOn) {
        gGame.isHintOn = false;
        elHints.classList.remove('hintOn');
    } else if (gGame.hinstLeft > 0) {
        gGame.isHintOn = true;
        //dom:
        var elHints = document.querySelector('.hints');
        elHints.classList.add('hintOn');
    }
}

function showHint(rowIdx, colIdx) {
    gGame.hinstLeft--;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            var cell = gBoard[i][j];
            if (cell.isShown) continue;

            setTimeout(unShow, 1000, i, j)
            //dom only:
            var elCell = document.querySelector(`[data-location="${i},${j}"]`);
            elCell.classList.remove('marked');
            elCell.classList.add('shown');
        }
    }
    gGame.isHintOn = false;
    var elHints = document.querySelector('.hints');
    elHints.classList.remove('hintOn');
    elHints.innerText = `💡 ${gGame.hinstLeft}`
}

function unShow(i, j) {
    var elCell = document.querySelector(`[data-location="${i},${j}"]`);
    elCell.classList.remove('shown');
    if (gBoard[i][j].isMarked) {
        elCell.classList.add('marked');
    }
}

function bestScores() {
    switch (gLevel.size) {
        case 4:
            if (Number(localStorage.bestBeginner) > gGame.secsPassed
                || !localStorage.bestBeginner) {
                localStorage.bestBeginner = gGame.secsPassed;
                document.querySelector('.Beginner').innerText = localStorage.bestBeginner
            }
            break;
        case 8:
            if (Number(localStorage.bestMedium) > gGame.secsPassed
                || !localStorage.bestMedium) {
                localStorage.bestMedium = gGame.secsPassed;
                document.querySelector('.Medium').innerText = localStorage.bestMedium
            }
            break;
        case 12:
            if (Number(localStorage.bestExpert) > gGame.secsPassed
                || !localStorage.bestExpert) {
                localStorage.bestExpert = gGame.secsPassed;
                document.querySelector('.Expert').innerText = localStorage.bestExpert
            }
            break;
    }
}

function showScores() {
    if (localStorage.bestBeginner) {
        document.querySelector('.Beginner').innerText = localStorage.bestBeginner;
    }
    if (localStorage.bestMedium) {
        document.querySelector('.Medium').innerText = localStorage.bestMedium;
    }
    if (localStorage.bestExpert) {
        document.querySelector('.Expert').innerText = localStorage.bestExpert;
    }
}

function WhichButton(event, i, j) {   //no i,j yet    //check for right+left click 
    var x = event.buttons;
    if (x === 3) rightLeftClick(i, j);
}

function rightLeftClick(rowIdx, colIdx) {    //check for right+left click
    if (!gBoard[rowIdx][colIdx].isShown) return;
    var flagsAroundCounter = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {        // neighbours loop
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = gBoard[i][j];
            if (cell.isShown) continue;

            if (cell.isMarked) flagsAroundCounter++;
        }
    }
    if (gBoard[rowIdx][colIdx].minesAroundCount === flagsAroundCounter) {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {        // neighbours loop
            if (i < 0 || i > gBoard.length - 1) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > gBoard[0].length - 1) continue
                if (i === rowIdx && j === colIdx) continue
                var cell = gBoard[i][j];
                if (cell.isShown) continue;
                if (cell.isMarked) continue;

                var elCell = document.querySelector(`[data-location="${i},${j}"]`);
                //model:
                cell.isShown = true;
                //dom:
                elCell.classList.add('shown');

                if (cell.isMine) mineClick(elCell, i, j);       //steping on mine
                if (cell.minesAroundCount === 0 && !cell.isMine) openSurroundingCells(i, j);
            }
        }
    } return;
}