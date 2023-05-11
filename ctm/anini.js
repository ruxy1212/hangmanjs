var circle = document.querySelector('.circle');
var main = document.querySelector('.main');
var x = 0;
var y = 0;
var angle = Math.PI / 4;
var speed = 2;

function moveCircle() {
    x += Math.cos(angle) * speed;
    y += Math.sin(angle) * speed;

    if (x + circle.offsetWidth >= main.offsetWidth || x <= 0) {
        angle = Math.atan2(Math.sin(angle), -Math.cos(angle));
    }

    if (y + circle.offsetHeight >= main.offsetHeight || y <= 0) {
        angle = Math.atan2(-Math.sin(angle), Math.cos(angle));
    }

    circle.style.left = x + 'px';
    circle.style.top = y + 'px';

    requestAnimationFrame(moveCircle);
}

moveCircle();