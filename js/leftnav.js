var leftnav = document.querySelector('#left-nav');
document.querySelector('#leftnav-btn').onclick = function() {
    if (leftnav.style.display === 'none') {
        leftnav.style.display = 'block';
    } else {
        leftnav.style.display = 'none';
    }
}
