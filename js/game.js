/*
  __  __       _   _            ____                      
 |  \/  | __ _| |_| |__  ___   / ___| __ _ _ __ ___   ___ 
 | |\/| |/ _` | __| '_ \/ __| | |  _ / _` | '_ ` _ \ / _ \
 | |  | | (_| | |_| | | \__ \ | |_| | (_| | | | | | |  __/
 |_|  |_|\__,_|\__|_| |_|___/  \____|\__,_|_| |_| |_|\___|
*/
console.log('  __  __       _   _            ____                      \r\n |  \\\/  | __ _| |_| |__  ___   \/ ___| __ _ _ __ ___   ___ \r\n | |\\\/| |\/ _` | __| \'_ \\\/ __| | |  _ \/ _` | \'_ ` _ \\ \/ _ \\\r\n | |  | | (_| | |_| | | \\__ \\ | |_| | (_| | | | | | |  __\/\r\n |_|  |_|\\__,_|\\__|_| |_|___\/  \\____|\\__,_|_| |_| |_|\\___|');

var levels;
var numberBox;
var multiplierBox;
var runningTotal = 0;
var moves;

// Level switching vars
var levelIndex = 1;
var levelId = 'level' + levelIndex;

// Info bar vars
var level = $('.level');
var timeHolder = $('.time');
var target = $('.target');
var movesHolder = $('.moves');
var totalSum = $('.total');

// Content & overlay vars
var contentPane = $('.content');
var overlay = $('#overlay');
var overlayMessage = $('.message h1');
var numberHolder = $('#number-holder');
var multiplierHolder = $('#multiplier-holder');

var reason;

var timerId;
var time;

// Json vars
var levelNumbers;
var levelMultipliers;
var targetNumber;
var timeLeft;
var allowedMoves;

// Get json file
var xhr = new XMLHttpRequest ();
xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
		levels = JSON.parse(xhr.responseText);
    	changeLevel();
	}	
};

xhr.open('GET', 'js/levels.json');
xhr.send();

// Remove bg & text styles
function removeStyles () {
	$('.winbg').removeClass('winbg');
	$('.wintext').removeClass('wintext');
	$('.warning-red').removeClass('warning-red');	
}

// Start again 
function startAgain () {
	levelIndex = 0;
	nextLevel();
	hideOverlay();
	hideMenu();
}

// Next level
function nextLevel () {
	levelIndex ++;
	levelId = 'level' + levelIndex;
	console.log(levelId);
	hideOverlay();
	changeLevel();
}

function retry () {
	levelIndex --;
	nextLevel();
	hideOverlay();
	hideMenu();
}

// Show Overlay
function showOverlay (trueOrFalse, reason) {
	overlay.fadeIn();
	if (trueOrFalse) {
		overlayMessage.html('Congratulations you beat level ' + levelIndex + ' in only ' + moves + " moves!");
		$('.next-level-button').show();

	} else if (!trueOrFalse) {
		overlayMessage.html(reason);
		$('.next-level-button').hide();
	}
}

// Exit overlay
function hideOverlay () {
	$('#overlay').fadeOut();
}

// Show menu
function showMenu () {
	$('#menu').fadeIn();
}

// Exit menu
function hideMenu () {
	$('#menu').fadeOut();
}

// Reset button
function resetLevel () {
	moves = 0;
	runningTotal = 0;
	movesHolder.html(moves);
	totalSum.html(runningTotal);
	$('.total, .moves').removeClass('warning-red');
}

// Timer function
function startTimer (duration, display) {
    var timer = duration, minutes, seconds;
    return setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;
        // restart timer at 0
        if (--timer < 0) {
            //alert('Time is up!');
            reason = 'You ran out of time!';
            showOverlay(false, reason);
            timer = 0;

        }
        // If timer is below 15 seconds style it red
        if (timer < 15) {
            timeHolder.addClass('warning-red');
        } else {
        	timeHolder.removeClass('warning-red');
        }

    }, 1000);
}







function changeLevel () {
	// Clear any existing data
	target.empty();
	numberHolder.empty();
	multiplierHolder.empty();
	totalSum.empty();
	movesHolder.empty();
	moves = 0;
	runningTotal = 0;
	// Remove bg & text styles
	removeStyles();
	
	// Set variables from json data
	timeLeft = levels[levelId].timer;
	targetNumber = levels[levelId].target;
	allowedMoves = levels[levelId].moves;
	levelNumbers = levels[levelId].numbers;
	levelMultipliers = levels[levelId].multipliers;
    // If timerId has a value clear it
	if (timerId != undefined) {
		clearInterval(timerId);
	}
    
    movesHolder.html(allowedMoves);
    totalSum.html(0);

    // Set time and call start timer function
    var time = timeLeft * 60;
    var display = document.querySelector('.time');
    timerId = startTimer(time, display);

	// Output json values
	target.html(targetNumber);
	level.html(levelIndex);

	$( init );

	function init() {
		'use strict';

		// Build numbers
		for (var i = 0; i < levelNumbers.length; i ++) {
			numberBox = $('<div class="number-box">' + levelNumbers[i] + '</div>').data( 'number', levelNumbers[i]);
			numberHolder.append(numberBox);
			numberBox.fadeIn(500).css('display', 'inline-block');
		}			
		// Make draggable
		$('.number-box').draggable( {
		      containment: '.content',
		      stack: '#number-holder div',
		      cursor: 'move',
		      revert: false
		   	} );

		// Build multipliers
		for (var i = 0; i < levelMultipliers.length; i ++) {
			multiplierBox = $('<div class="multiplier-box">' + levelMultipliers[i] + '</div>').data('number', levelMultipliers[i]);
			multiplierHolder.append(multiplierBox);
			multiplierBox.fadeIn(1000).css('display', 'inline-block');
		}
		// Make droppable
		$('.multiplier-box').droppable( {
		      accept: '#number-holder div',
		      hoverClass: 'hovered',
		      drop: handleNumberDrop
		    } );

		// Drop event
		function handleNumberDrop ( event, ui ) {
		  	var multiplierSlot = $(this).data( 'number' );
			var numberKey = ui.draggable.data( 'number' );
			var sum = multiplierSlot * numberKey;
			
			var numberPoof = ui.draggable.hide('slow');

			runningTotal = runningTotal + sum;
			totalSum.html(runningTotal);
			
			// Count how many moves the player has taken
			moves ++;
			movesHolder.html(allowedMoves - moves);
			
			var levelsAmount = Object.keys(levels).length;
			
			
			if (runningTotal === targetNumber) {
				contentPane.addClass('winbg');
				totalSum.addClass('wintext');
				if (levelIndex === levelsAmount) {
					reason = 'Congratulations you have completed the game!'; 
					showOverlay(false, reason);
				} else {
					showOverlay(true);
				}
			} else if (moves >= allowedMoves) {
				movesHolder.addClass('warning-red');
				reason = 'You exeeded your moves!';
				showOverlay(false, reason)
			} else if (runningTotal > targetNumber){
				totalSum.addClass('warning-red');
				reason = 'You went too high!';
				showOverlay(false, reason);
			}
		}
	}
}
			
			

