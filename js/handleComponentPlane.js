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
    } else {
        comPlaneInfoWaypoints.style.display = 'none';
    }
}
