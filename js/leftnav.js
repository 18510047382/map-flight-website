var leftnav = document.querySelector('#left-nav');

function triggerLeftnav() {
    if (leftnav.style.display === 'none') {
        leftnav.style.display = 'block';
    } else {
        leftnav.style.display = 'none';
    }
}

document.querySelector('#leftnav-btn').onclick = triggerLeftnav;
