var singleTouchGesture = false;
var startX = 0;
var startY = 0;
var availWidth = window.screen.availWidth;
var availHeight = window.screen.availHeight;

var extensions = [];

window.addEventListener("load", function() { // on page load
    // Get screen X and Y sizes.
    // Events listeners for the touches.
    window.document.addEventListener("touchstart", handleTouchStart, false);
    window.document.addEventListener("touchend", handleTouchEnd, false);
    window.document.addEventListener("click", handleClick, true);
    // When device orientation changes, screen X and Y sizes are recalculated.
}, false);

function processHighlightClick(ev){
    var win = window;
    var tmp = findHighlight(win,ev);
    var foundHighlight = tmp[0];
    var foundElement = tmp[1];
    if(!foundHighlight) return false;
    if ( foundHighlight.id.search(annotationPrefix) >= 0 ) {
        Android.highlightAnnotationMarkActivated(foundHighlight.id);
    } else if ( foundHighlight.id.search(highlightPrefix) >= 0 ) {
        Android.highlightActivated(foundHighlight.id);
    }else{
        return false;
    }
    return true;
}

var handleClick = function(event) {
    for(var i=0;i<extensions.length;i++){
        var f = extensions[i].handleClick;
        if(f){
            if(f(event)) return
        }
    }
    Android.handleClick(event.target.outerHTML)
};


// When a touch is detected records its starting coordinates and if it's a singleTouchGesture.
var handleTouchStart = function(event) {
    for(var i=0;i<extensions.length;i++){
        var f = extensions[i].handleTouchStart;
        if(f){
            if(f(event)) return
        }
    }

    if (event.target.nodeName.toUpperCase() === 'A') {
        console.log("Touched a link.");
        // singleTouchGesture = false;
        return;
    }
    console.log("Touch sent to native code.");
    singleTouchGesture = event.touches.length == 1;

    var touch = event.changedTouches[0];

    startX = touch.screenX % availWidth;
    startY = touch.screenY % availHeight;

};

// When a touch ends, check if any action has to be made, and contact native code.
var handleTouchEnd = function(event) {
    if (!singleTouchGesture) {
        return;
    }
    for(var i=0;i<extensions.length;i++){
        var f = extensions[i].handleTouchEnd;
        if(f){
            if(f(event)) return
        }
    }
    var touch = event.changedTouches[0];

    var relativeDistanceX = Math.abs(((touch.screenX % availWidth) - startX) / availWidth);
    var relativeDistanceY = Math.abs(((touch.screenY % availHeight) - startY) / availHeight);
    var touchDistance = Math.max(relativeDistanceX, relativeDistanceY);

    var scrollWidth = document.scrollWidth;
    var screenWidth = availWidth;
    var tapAreaWidth = availWidth * 0.2;

    if (touchDistance < 0.01) {
        var position = (touch.screenX % availWidth) / availWidth;
        if (position <= 0.2) {
            console.log("LeftTapped");
            Android.scrollLeft(false);
        } else if (position >= 0.8) {
            console.log("RightTapped");
            Android.scrollRight(false);
        } else {
            console.log("CenterTapped");
            Android.centerTapped();
        }
        event.stopPropagation();
        event.preventDefault();
        return;
    }
};
