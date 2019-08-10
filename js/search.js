document.querySelector('#search-btn').onclick = function() {
    layer.alert('请选择搜索类型：', {
        title: '搜索',
        btn: ['地点搜索', '航班搜索'],
        btn2: function(index) {
            layer.close(index);
            searchFlight();
        }
    }, function(index) {
        layer.close(index);
        searchPlace();
    })
}

function searchFlight() {
    layer.prompt({
        formType: 0,
        title: '请输入航班呼号',
        area: ['800px', '350px']
    }, function(value, index, elem) {
        layer.close(index);

        if (typeof planeListObj[value] === 'undefined') {
            layer.msg('没有此航班！');
            return;
        }

        map.panTo(new BMap.Point(planeListObj[value].info.lon, planeListObj[value].info.lat), {
            noAnimation: true
        })

        getBoundsPlane();
        getBoundsAirport();
    })
}

function searchPlace() {
    layer.prompt({
        formType: 0,
        value: '北京首都机场',
        title: '请输入地点（不支持境外搜索）',
        area: ['800px', '350px']
    }, function(value, index, elem) {
        var loadingPlaceLayer = layer.load(2);

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                layer.close(loadingPlaceLayer);
                toPlace(JSON.parse(xmlhttp.responseText));
            }
        }
        xmlhttp.open("GET", 'https://' + backendLink + ":8000/searchPlace?place=" + value, true);
        xmlhttp.send();

        layer.close(index);
    })
}

function toPlace(placeArr) {
    placeArr = placeArr.result[0];

    if (placeArr === undefined) {
        layer.msg('没有此地点！');
        return;
    }

    map.setZoom(12);
    map.panTo(new BMap.Point(placeArr.location.lng, placeArr.location.lat), {
        noAnimation: true
    })

    getBoundsPlane();
    getBoundsAirport();
}
