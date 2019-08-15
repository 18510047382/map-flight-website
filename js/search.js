document.querySelector('#search-btn').onclick = function() {
    layer.alert('请选择搜索类型：', {
        title: '搜索',
        btn: ['机场搜索', '航班搜索'],
        btn2: function(index) {
            layer.close(index);
            searchFlight();
        }
    }, function(index) {
        layer.close(index);
        searchAirport();
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

        map.panTo(planeListObj[value].getPosition(), {
            noAnimation: true
        })

        getBoundsPlane();
        getBoundsAirport();
    })
}

function searchAirport() {
    layer.prompt({
        formType: 0,
        title: '请输入机场四字码',
        area: ['800px', '350px']
    }, function(value, index, elem) {
        layer.close(index);

        value = value.toUpperCase();

        if (typeof airportMarkers[value] === 'undefined') {
            layer.msg('没有此机场！');
            return;
        }

        map.panTo(airportMarkers[value].getPosition(), {
            noAnimation: true
        })

        getBoundsPlane();
        getBoundsAirport();
    })
}
