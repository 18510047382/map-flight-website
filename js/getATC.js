window.atc = {
    'Casual Server': {},
    'Training Server': {},
    'Expert Server': {}
}

function getATC(server, id) {
    //清除airport-atc.png
    for (var i in atc['Casual Server']) {
        airportMarkers[i].setIcon(new BMap.Icon('img/icon/airport.png', new BMap.Size(20, 20)));
    }
    for (var i in atc['Training Server']) {
        airportMarkers[i].setIcon(new BMap.Icon('img/icon/airport.png', new BMap.Size(20, 20)));
    }
    for (var i in atc['Expert Server']) {
        airportMarkers[i].setIcon(new BMap.Icon('img/icon/airport.png', new BMap.Size(20, 20)));
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText),
                newData = {};
            for (var i = 0; i < data.length; i++) {
                if (typeof newData[data[i].Name] === 'undefined') {
                    newData[data[i].Name] = {};
                }
                newData[data[i].Name][data[i].Type] = data[i];
                if (typeof airportMarkers === 'undefined') {
                    continue;
                }
                if (typeof airportMarkers[data[i].Name] !== 'undefined') {
                    airportMarkers[data[i].Name].setIcon(new BMap.Icon('img/icon/airport-atc.png', new BMap.Size(20, 20)));
                }
            }
            window.atc[server] = newData;
        }
    }

    xmlhttp.open("GET", 'https://' + backendLink + ':8000/getATC?id=' + id.Id, true);
    xmlhttp.send();
}
