var startX = 0;
var startY = 0;
var moveX = 0;
var moveElement = document.getElementById("touchdiv");
moveElement.addEventListener('touchstart', function(event) {
    event.preventDefault();
    var touch = event.touches[0];
    startX = touch.pageX;
    startY = touch.pageY;
});
moveElement.addEventListener('touchend', function(event) {
    event.preventDefault();
    var touch = event.touches[0];
    moveX = parseInt(this.style.webkitTransform.replace("translate3d(", ""));
});
moveElement.addEventListener('touchmove', function(event) {
    event.preventDefault();
    var touch = event.touches[0];
    startMoveX = touch.pageX;
    startMoveY = touch.pageY;
    var moveBH = parseInt(this.style.webkitTransform.replace("translate3d(", ""));
    if (Math.abs(moveBH) > 2000) {
        if (moveBH > 0) {
            moveX = moveBH - 2000;
        } else {
            moveX = moveBH + 2000;
        }
    }
    if (moveBH > 0) {
        moveX = moveBH - 2000;
    }
    var moutchX = moveX + (startMoveX - startX);
    $(this).css("-webkit-transform", "translate3d(" + moutchX + "px, 0px, 0px)");
});
