'use strict'

/////////////// ALL KIND OF MAT FUNCTIONS ////////////////////

//creates a simple matrix
function buildBoard(rowsLength) {
    //if you want the cells value to come from an outside array, u need to use a var 
    // counting the idx and increasing it at the end of the loop
    var gBoard = []
    for (var i = 0; i < rowsLength; i++) {
        gBoard[i] = []
        for (var j = 0; j < rowsLength; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: true,
                isMine: false,
                isMarked: false
            }
            gBoard[i][j] = cell
        }
    }
    return gBoard
}

function setMines() {
    gBoard[2][3].isMine = true;     //manually
    gBoard[0][2].isMine = true;
}

// copy a mat quickly if needed from some reason
function copyMat(mat) {
    var coppiedMat = []
    for (var i = 0; i < mat.length; i++) {
        coppiedMat[i] = []
        for (var j = 0; j < mat[0].length; j++) {
            coppiedMat[i][j] = mat[i][j]
        }
    }
    return coppiedMat
}

//rendering simple matrix, the selector is the class of the div we want to push it in
function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

// rendering a cell instead of rendering the whole mat again
// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value 
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

//counting negs, adjust vars to the question
function countMineNegs(rowIdx,colIdx) {

    var mineCounter = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = gBoard[i][j];
            // console.log('cell', cell);
            if (cell.isMine) {
                mineCounter++
            }
        }
    }
    return mineCounter
}

//another counting negs function, adjust vars to the question
function countNegs2(pos) {
    var seats = []
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gCinema.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gCinema[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (gCinema[i][j].isSeat && !gCinema[i][j].isBooked) seats.push({ i: i, j: j })
        }
    }
    return seats;
}

//needed to move computer players randomaly, look on pacman CR for more info
function getMoveDiff() {
    var randNum = getRandomIntInt(0, 100);
    if (randNum < 25) {
        return { i: 0, j: 1 };
    } else if (randNum < 50) {
        return { i: -1, j: 0 };
    } else if (randNum < 75) {
        return { i: 0, j: -1 };
    } else {
        return { i: 1, j: 0 };
    }
}

//need to move your player, look on pacman CR for more info, 
// how it communicates with movePacman function
function getNextLocation(eventKeyboard) {
    var nextLocation = {
        i: gPacman.location.i,
        j: gPacman.location.j,
    };
    switch (eventKeyboard.code) {
        case 'ArrowUp':
            nextLocation.i--;
            gDeg = '-90deg'
            break;
        case 'ArrowDown':
            nextLocation.i++;
            gDeg = '90deg'
            break;
        case 'ArrowLeft':
            nextLocation.j--;
            gDeg = '180deg'
            break;
        case 'ArrowRight':
            nextLocation.j++;
            gDeg = '0deg'
            break;
        default:
            return null;
    }
    return nextLocation;
}

//////////// GENERAL FUNCTIONS /////////////

function playSound() {
    var sound = new Audio("");//enter the file path here
    sound.play();
}

//enter a parameter if needed
function openModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';

    var elText = elModal.querySelector('p');
    elText.innerText = isVictory ? 'You won!!! 🏆' : 'You lost! Let\'s try angin ';
}

// usually activeted by a button in the modal
function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

function checkForEmptyCell() {
    // the empty cell is random
    var emptyCellArr = []
    for (var i = 0; i < gBoard.length - 1; i++) {
        for (var j = 0; j < gBoard[0].length - j; j++) {
            var currCell = gBoard[i][j]
            // if(enter condtion for an empty cell here for the currCell var ){
            var emptyCellPos = { i, j }
            emptyCellArr.push(emptyCellPos)
            // }
        }
    }
    var emptyCellIdx = getRandomIntInclusive(0, emptyCellArr.length - 1)
    var emptyCell = emptyCellArr[emptyCellIdx]
    return emptyCell
}

//creates an array of unique numbers 
function createRandomUniqueNumArr(startingNum, endingNum) {
    var numArr = []
    for (var i = startingNum; i <= endingNum; i++) {
        numArr.push(i);
    }
    shuffle(numArr)

    return numArr
}

function sortNumArr(numArray) {
    numArray.sort(function (a, b) {
        return a - b;
    });
}

//draws a random num from an array of nums
function drawNums() {
    var numsArr = [] //enter you array here, maybe the function can recives it
    shuffle(numsArr)
    var randomNum = numsArr[0]
    return randomNum
}

//shuffle an array
function shuffle(items) {
    var randIdx;
    var keep;
    for (var i = items.length - 1; i > 0; i--) {
        randIdx = getRandomIntInclusive(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/////////// TIME AND TIMERS FUNCTIONS /////////////////////

// just getting the current time
function getTime() {
    var currTime = new Date().getTime()
    return currTime
}

//simple timer, counting seconds, set interval to 100ms for smooth run
function setTimer() {
    var currTime = new Date().getTime()
    // var timer = parseInt((currTime-gStartingTime)/1000)
    var timer = (currTime - gStartingTime) / 1000
    // console.log(timer)
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = `Time:\n ${timer}`
}

//more advanced timer, aa:bb:cc kind, when setting interval need to set it for 100ms
function startTimer() {
    var timer = document.querySelector('.timer');
    var milisec = 0;
    var sec = 0;
    var min = 0;
    milisec++;
    if (milisec > 9) {
        sec++;
        milisec = 0;
    }
    if (sec > 59) {
        min++;
        sec = 0;
    }
    timer.innerText = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec) + ':' + '0' + milisec;
}

