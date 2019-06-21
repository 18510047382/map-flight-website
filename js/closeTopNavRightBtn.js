document.querySelector('#top-nav-me-close-btn').onclick = function() {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('mouseout', true, true);
    document.querySelector('#top-nav-me').dispatchEvent(evt);
}
