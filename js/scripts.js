/*
  __  __       _   _            ____                      
 |  \/  | __ _| |_| |__  ___   / ___| __ _ _ __ ___   ___ 
 | |\/| |/ _` | __| '_ \/ __| | |  _ / _` | '_ ` _ \ / _ \
 | |  | | (_| | |_| | | \__ \ | |_| | (_| | | | | | |  __/
 |_|  |_|\__,_|\__|_| |_|___/  \____|\__,_|_| |_| |_|\___|
*/
console.log("  __  __       _   _            ____                      \r\n |  \\/  | __ _| |_| |__  ___   / ___| __ _ _ __ ___   ___ \r\n | |\\/| |/ _` | __| '_ \\/ __| | |  _ / _` | '_ ` _ \\ / _ \\\r\n | |  | | (_| | |_| | | \\__ \\ | |_| | (_| | | | | | |  __/\r\n |_|  |_|\\__,_|\\__|_| |_|___/  \\____|\\__,_|_| |_| |_|\\___|");

var levels;

var numberBox;

var multiplierBox;

var runningTotal = 0;

var moves;

// Level switching vars
var levelIndex = 1;

var levelId = "level" + levelIndex;

// Info bar vars
var level = $(".level");

var timeHolder = $(".time");

var target = $(".target");

var movesHolder = $(".moves");

var totalSum = $(".total");

// Content & overlay vars
var contentPane = $(".content");

var overlay = $("#overlay");

var overlayMessage = $(".message h1");

var numberHolder = $("#number-holder");

var multiplierHolder = $("#multiplier-holder");

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
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
        levels = JSON.parse(xhr.responseText);
        changeLevel();
    }
};

xhr.open("GET", "js/levels.json");

xhr.send();

// Remove bg & text styles
function removeStyles() {
    $(".winbg").removeClass("winbg");
    $(".wintext").removeClass("wintext");
    $(".warning-red").removeClass("warning-red");
}

// Start again 
function startAgain() {
    levelIndex = 0;
    nextLevel();
    hideOverlay();
    hideMenu();
}

// Next level
function nextLevel() {
    levelIndex++;
    levelId = "level" + levelIndex;
    console.log(levelId);
    hideOverlay();
    changeLevel();
}

function retry() {
    levelIndex--;
    nextLevel();
    hideOverlay();
    hideMenu();
}

// Show Overlay
function showOverlay(trueOrFalse, reason) {
    overlay.fadeIn();
    if (trueOrFalse) {
        overlayMessage.html("Congratulations you beat level " + levelIndex + " in only " + moves + " moves!");
        $(".next-level-button").show();
    } else if (!trueOrFalse) {
        overlayMessage.html(reason);
        $(".next-level-button").hide();
    }
}

// Exit overlay
function hideOverlay() {
    $("#overlay").fadeOut();
}

// Show menu
function showMenu() {
    $("#menu").fadeIn();
}

// Exit menu
function hideMenu() {
    $("#menu").fadeOut();
}

// Reset button
function resetLevel() {
    moves = 0;
    runningTotal = 0;
    movesHolder.html(moves);
    totalSum.html(runningTotal);
    $(".total, .moves").removeClass("warning-red");
}

// Timer function
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    return setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        // restart timer at 0
        if (--timer < 0) {
            //alert('Time is up!');
            reason = "You ran out of time!";
            showOverlay(false, reason);
            timer = 0;
        }
        // If timer is below 15 seconds style it red
        if (timer < 15) {
            timeHolder.addClass("warning-red");
        } else {
            timeHolder.removeClass("warning-red");
        }
    }, 1e3);
}

function changeLevel() {
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
    var display = document.querySelector(".time");
    timerId = startTimer(time, display);
    // Output json values
    target.html(targetNumber);
    level.html(levelIndex);
    $(init);
    function init() {
        "use strict";
        // Build numbers
        for (var i = 0; i < levelNumbers.length; i++) {
            numberBox = $('<div class="number-box">' + levelNumbers[i] + "</div>").data("number", levelNumbers[i]);
            numberHolder.append(numberBox);
            numberBox.fadeIn(500).css("display", "inline-block");
        }
        // Make draggable
        $(".number-box").draggable({
            containment: ".content",
            stack: "#number-holder div",
            cursor: "move",
            revert: false
        });
        // Build multipliers
        for (var i = 0; i < levelMultipliers.length; i++) {
            multiplierBox = $('<div class="multiplier-box">' + levelMultipliers[i] + "</div>").data("number", levelMultipliers[i]);
            multiplierHolder.append(multiplierBox);
            multiplierBox.fadeIn(1e3).css("display", "inline-block");
        }
        // Make droppable
        $(".multiplier-box").droppable({
            accept: "#number-holder div",
            hoverClass: "hovered",
            drop: handleNumberDrop
        });
        // Drop event
        function handleNumberDrop(event, ui) {
            var multiplierSlot = $(this).data("number");
            var numberKey = ui.draggable.data("number");
            var sum = multiplierSlot * numberKey;
            var numberPoof = ui.draggable.hide("slow");
            runningTotal = runningTotal + sum;
            totalSum.html(runningTotal);
            // Count how many moves the player has taken
            moves++;
            movesHolder.html(allowedMoves - moves);
            var levelsAmount = Object.keys(levels).length;
            if (runningTotal === targetNumber) {
                contentPane.addClass("winbg");
                totalSum.addClass("wintext");
                if (levelIndex === levelsAmount) {
                    reason = "Congratulations you have completed the game!";
                    showOverlay(false, reason);
                } else {
                    showOverlay(true);
                }
            } else if (moves >= allowedMoves) {
                movesHolder.addClass("warning-red");
                reason = "You exeeded your moves!";
                showOverlay(false, reason);
            } else if (runningTotal > targetNumber) {
                totalSum.addClass("warning-red");
                reason = "You went too high!";
                showOverlay(false, reason);
            }
        }
    }
}

/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function($) {
    // Detect touch support
    $.support.touch = "ontouchend" in document;
    // Ignore browsers without touch support
    if (!$.support.touch) {
        return;
    }
    var mouseProto = $.ui.mouse.prototype, _mouseInit = mouseProto._mouseInit, _mouseDestroy = mouseProto._mouseDestroy, touchHandled;
    /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
    function simulateMouseEvent(event, simulatedType) {
        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }
        event.preventDefault();
        var touch = event.originalEvent.changedTouches[0], simulatedEvent = document.createEvent("MouseEvents");
        // Initialize the simulated mouse event using the touch event's coordinates
        simulatedEvent.initMouseEvent(simulatedType, // type
        true, // bubbles                    
        true, // cancelable                 
        window, // view                       
        1, // detail                     
        touch.screenX, // screenX                    
        touch.screenY, // screenY                    
        touch.clientX, // clientX                    
        touch.clientY, // clientY                    
        false, // ctrlKey                    
        false, // altKey                     
        false, // shiftKey                   
        false, // metaKey                    
        0, // button                     
        null);
        // Dispatch the simulated event to the target element
        event.target.dispatchEvent(simulatedEvent);
    }
    /**
   * Handle the jQuery UI widget's touchstart events
   * @param {Object} event The widget element's touchstart event
   */
    mouseProto._touchStart = function(event) {
        var self = this;
        // Ignore the event if another widget is already being handled
        if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
            return;
        }
        // Set the flag to prevent other widgets from inheriting the touch event
        touchHandled = true;
        // Track movement to determine if interaction was a click
        self._touchMoved = false;
        // Simulate the mouseover event
        simulateMouseEvent(event, "mouseover");
        // Simulate the mousemove event
        simulateMouseEvent(event, "mousemove");
        // Simulate the mousedown event
        simulateMouseEvent(event, "mousedown");
    };
    /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
    mouseProto._touchMove = function(event) {
        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }
        // Interaction was not a click
        this._touchMoved = true;
        // Simulate the mousemove event
        simulateMouseEvent(event, "mousemove");
    };
    /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
    mouseProto._touchEnd = function(event) {
        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }
        // Simulate the mouseup event
        simulateMouseEvent(event, "mouseup");
        // Simulate the mouseout event
        simulateMouseEvent(event, "mouseout");
        // If the touch interaction did not move, it should trigger a click
        if (!this._touchMoved) {
            // Simulate the click event
            simulateMouseEvent(event, "click");
        }
        // Unset the flag to allow other widgets to inherit the touch event
        touchHandled = false;
    };
    /**
   * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
   * This method extends the widget with bound touch event handlers that
   * translate touch events to mouse events and pass them to the widget's
   * original mouse event handling methods.
   */
    mouseProto._mouseInit = function() {
        var self = this;
        // Delegate the touch handlers to the widget's element
        self.element.bind({
            touchstart: $.proxy(self, "_touchStart"),
            touchmove: $.proxy(self, "_touchMove"),
            touchend: $.proxy(self, "_touchEnd")
        });
        // Call the original $.ui.mouse init method
        _mouseInit.call(self);
    };
    /**
   * Remove the touch event handlers
   */
    mouseProto._mouseDestroy = function() {
        var self = this;
        // Delegate the touch handlers to the widget's element
        self.element.unbind({
            touchstart: $.proxy(self, "_touchStart"),
            touchmove: $.proxy(self, "_touchMove"),
            touchend: $.proxy(self, "_touchEnd")
        });
        // Call the original $.ui.mouse destroy method
        _mouseDestroy.call(self);
    };
})(jQuery);

// Timer function
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        // restart timer at 0
        if (--timer < 0) {
            //alert('Time is up!');
            reason = "You ran out of time!";
            showOverlay(false, reason);
            timer = 0;
        }
        // If timer is below 15 seconds style it red
        if (timer < 15) {
            $(".time").addClass("warning-red");
        } else {
            $(".time").removeClass("warning-red");
        }
    }, 1e3);
}

var timeReset = startTimer();

var timeLeft = 4e3;

clearInterval(timeReset);

// Set time and call start timer function
var time = timeLeft / 60;

console.log(time);

display = document.querySelector(".time");

startTimer(time, display);