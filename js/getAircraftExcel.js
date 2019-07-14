(function(window, document) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 'data/aircraft.csv', false);
    xmlhttp.send();
    var data = xmlhttp.responseText,
        newData = {},
        thisData;

    data = data.split('\n');
    data.splice(0, 1);
    for (var i = 0; i < data.length; i++) {
        thisData = data[i].split(',');
        newData[thisData[0] + thisData[2]] = {
            aircraft: thisData[1],
            livery: thisData[3]
        }
    }

    window.aircraftData = newData;
})(window, document);
