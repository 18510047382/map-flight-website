function getAirportExcelFn() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 'data/airport.csv', false);
    xmlhttp.send();

    var data = xmlhttp.responseText,
        thisData,
        markersObj = {},
        airportIcon = new BMap.Icon('img/icon/airport.png', new BMap.Size(20, 20));

    data = data.split('\n');
    data.splice(0, 1);

    for (var i = 0; i < data.length; i++) {
        thisData = data[i].split(',');
        var mk = new BMap.Marker(new BMap.Point(thisData[3], thisData[2]), {
            icon: airportIcon
        })
        mk.onclick = function() {
            if (this.info.isOpen) {
                this.closeInfoWindow();
                this.info.isOpen = false;
                return;
            }
            this.openInfoWindow(new BMap.InfoWindow('<h3><b>机场信息：</b></h3><p>名称：' + this.info.name + '</p><p>IACO代码：' + this.info.code + '</p><p>经度：' + this.info.lon + '</p><p>纬度：' + this.info.lat + '</p><p>海拔：' + this.info.ft + 'ft</p>'));
            this.info.isOpen = true;
        }

        mk.info = {
            name: thisData[1],
            code: thisData[0],
            lat: thisData[2],
            lon: thisData[3],
            ft: thisData[4],
            isOpen: false
        }

        mk.addEventListener('infowindowclose', function() {
            this.info.isOpen = false;
        })

        markersObj[thisData[0]] = mk;
        map.addOverlay(mk);
    }

    window.airportMarkers = markersObj;
}

if (localStorage.displayAirport === undefined || localStorage.displayAirport === 'false') {
    //隐藏
    localStorage.displayAirport = false;
} else {
    getAirportExcelFn();
    document.querySelector('#toggleAirport-btn').classList.add('layui-this');
}
