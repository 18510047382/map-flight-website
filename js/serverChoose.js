if (localStorage.server === undefined) {
    window.nowServer = 'cs';
    localStorage.server = 'cs';
    document.querySelector('#cs-server-btn').setAttribute('class', 'layui-this');
} else {
    window.nowServer = localStorage.server;
    document.querySelector('#' + nowServer + '-server-btn').setAttribute('class', 'layui-this');
}

document.querySelector('#cs-server-btn').onclick = function() {
    if (nowServer === 'cs') {
        layer.msg('已经是CS服务器了！');
        return;
    }

    planeLoadingLayer = layer.load(2);
    getCSPlane(function() {
        //清除旧飞机
        nowServer = 'cs';
        localStorage.server = 'cs';
        for (var i = 0; i < planeList.length; i++) {
            map.removeOverlay(planeList[i]);
        }
        planeList = [];
        //关闭加载层
        layer.close(planeLoadingLayer);
    }, function() {}, function() {
        layer.close(planeLoadingLayer);
    }, false)
}

document.querySelector('#ts-server-btn').onclick = function() {
    if (nowServer === 'ts') {
        layer.msg('已经是TS服务器了！');
        return;
    }

    planeLoadingLayer = layer.load(2);
    getTSPlane(function() {
        //清除旧飞机
        nowServer = 'ts';
        localStorage.server = 'ts';
        for (var i = 0; i < planeList.length; i++) {
            map.removeOverlay(planeList[i]);
        }
        planeList = [];
        //关闭加载层
        layer.close(planeLoadingLayer);
    }, function() {}, function() {
        layer.close(planeLoadingLayer);
    }, false)
}

document.querySelector('#es-server-btn').onclick = function() {
    if (nowServer === 'es') {
        layer.msg('已经是ES服务器了！');
        return;
    }

    planeLoadingLayer = layer.load(2);
    getESPlane(function() {
        //清除旧飞机
        nowServer = 'es';
        localStorage.server = 'es';
        for (var i = 0; i < planeList.length; i++) {
            map.removeOverlay(planeList[i]);
        }
        planeList = [];
        //关闭加载层
        layer.close(planeLoadingLayer);
    }, function() {}, function() {
        layer.close(planeLoadingLayer);
    }, false)
}
