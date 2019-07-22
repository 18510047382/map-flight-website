map.onclick = function() {
    document.querySelector('#component-plane').classList.remove('show');
}

document.querySelector('#component-plane-closeBar').onclick = function() {
    this.classList.remove('show-component-plane-closeBar');
    document.querySelector('#component-plane').classList.remove('show');
}

layui.use('slider', function() {
    var $ = layui.$,
        slider = layui.slider;

    slider.render({
        elem: '#locationBar',
        disabled: true,
        tips: false,
        max: 10000,
        value: 5000
    })
})

var comPlaneMenuIndexBtn = document.querySelector('#component-plane-menu-indexBtn'),
    comPlaneMenuInfoBtn = document.querySelector('#component-plane-menu-infoBtn'),
    comPlaneMenuPlayerBtn = document.querySelector('#component-plane-menu-playerBtn'),
    comPlaneIndex = document.querySelector('#component-plane-index'),
    comPlaneInfo = document.querySelector('#component-plane-info'),
    comPlanePlayer = document.querySelector('#component-plane-player'),
    comPlaneInfoWaypoints = document.querySelector('#component-plane-index-info-waypoints');

comPlaneMenuIndexBtn.onclick = function() {
    comPlaneMenuInfoBtn.classList.remove('component-plane-menu-act');
    comPlaneMenuPlayerBtn.classList.remove('component-plane-menu-act');
    this.classList.add('component-plane-menu-act');
    comPlaneInfo.style.display = 'none';
    comPlanePlayer.style.display = 'none';
    comPlaneIndex.style.display = 'block';
}

comPlaneMenuInfoBtn.onclick = function() {
    comPlaneMenuIndexBtn.classList.remove('component-plane-menu-act');
    comPlaneMenuPlayerBtn.classList.remove('component-plane-menu-act');
    this.classList.add('component-plane-menu-act');
    comPlaneIndex.style.display = 'none';
    comPlanePlayer.style.display = 'none';
    comPlaneInfo.style.display = 'block';
}

comPlaneMenuPlayerBtn.onclick = function() {
    comPlaneMenuInfoBtn.classList.remove('component-plane-menu-act');
    comPlaneMenuIndexBtn.classList.remove('component-plane-menu-act');
    this.classList.add('component-plane-menu-act');
    comPlaneIndex.style.display = 'none';
    comPlaneInfo.style.display = 'none';
    comPlanePlayer.style.display = 'block';
}

document.querySelector('#component-plane-index-info-waypoints-btn').onclick = function() {
    if (comPlaneInfoWaypoints.style.display === 'none') {
        comPlaneInfoWaypoints.style.display = 'block';
        document.querySelector('#component-plane-index-info-waypoints-btn-svgBtn').innerHTML = '<svg viewBox="0 0 24 24" style="display: inline-block; fill: rgba(0, 0, 0, 0.87); height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path></svg>';
    } else {
        comPlaneInfoWaypoints.style.display = 'none';
        document.querySelector('#component-plane-index-info-waypoints-btn-svgBtn').innerHTML = '<svg viewBox="0 0 24 24" style="display: inline-block; fill: rgba(0, 0, 0, 0.87); height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></svg>';
    }
}
