var leftnav = document.querySelector('#left-nav');
var isLeftnavDisplay = false;

function triggerLeftnav() {
    if (isLeftnavDisplay) {
        leftnav.style.opacity = 0;
        isLeftnavDisplay = false;
    } else {
        leftnav.style.display = 'block';
        leftnav.style.opacity = 1;
        isLeftnavDisplay = true;
    }
}

function leftnavTransitionEnd() {
    if (this.style.opacity == 0) {
        this.style.display = 'none';
    }
}

leftnav.addEventListener("transitionEnd", leftnavTransitionEnd);

leftnav.addEventListener("webkitTransitionEnd", leftnavTransitionEnd);


document.querySelector('#leftnav-btn').onclick = triggerLeftnav;
