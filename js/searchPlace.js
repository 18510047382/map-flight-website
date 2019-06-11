document.querySelector('#searchPlace-btn').onclick = function() {
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
    map.setZoom(12);
    map.panTo(new BMap.Point(placeArr.location.lng, placeArr.location.lat));
}
