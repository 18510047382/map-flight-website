function getAirportExcelFn(extraFn) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 'data/airport.csv', false);
    xmlhttp.send();

    var data = xmlhttp.responseText,
        thisData,
        markersObj = {},
        airportIcon = new BMap.Icon('img/icon/airport.png', new BMap.Size(30, 30));

    data = data.split('\n');
    data.splice(0, 1);

    for (var i = 0; i < data.length; i++) {
        thisData = data[i].split(',');
        var mk = new BMap.Marker(new BMap.Point(thisData[3], thisData[2]), {
            icon: airportIcon
        })
        extraFn ? extraFn(mk) : '';
        mk.onclick = function() {
            this.openInfoWindow(new BMap.InfoWindow(Mustache.render('<h3><b>机场信息：</b></h3><p>名称：{{name}}</p><p>IACO代码：{{code}}</p><p>经度：{{lon}}</p><p>纬度：{{lat}}</p><p>海拔：{{ft}}ft</p>', this.info)), {
                title: '机场信息',
                height: 220,
                width: 320
            })
        }
        mk.info = {
            name: thisData[1],
            code: thisData[0],
            lat: thisData[2],
            lon: thisData[3],
            ft: thisData[4]
        }
        markersObj[thisData[0]] = mk;
        map.addOverlay(mk);
    }

    window.airportMarkers = markersObj;
}

if (localStorage.displayAirport === undefined || localStorage.displayAirport === 'true') {
    //显示
    getAirportExcelFn();
    localStorage.displayAirport = true;
    document.querySelector('#toggleAirport-btn').classList.add('layui-this');
} else {
    getAirportExcelFn(function(mk){
        mk.hide();
    })
    localStorage.displayAirport === 'false';
}