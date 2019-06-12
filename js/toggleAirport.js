document.querySelector('#toggleAirport-btn').onclick = function() {
    //默认显示
    if (localStorage.displayAirport !== undefined) {
        if (localStorage.displayAirport === 'true') {
            //隐藏
            localStorage.displayAirport = false;
            layer.msg('大型机场已隐藏');
            document.querySelector('#toggleAirport-btn').classList.remove('layui-this');
            if (typeof window.airportMarkers !== 'undefined') {
                for (let i in airportMarkers) {
                    airportMarkers[i].hide();
                }
            }
        } else {
            //显示
            localStorage.displayAirport = true;
            layer.msg('大型机场已显示');
            document.querySelector('#toggleAirport-btn').classList.add('layui-this');
            if (typeof window.airportMarkers === 'undefined') {
                getAirportExcelFn();
            } else {
                for (let i in airportMarkers) {
                    airportMarkers[i].show();
                }
            }
        }
    } else {
        localStorage.displayAirport = false;
        layer.msg('大型机场已隐藏');
        document.querySelector('#toggleAirport-btn').classList.remove('layui-this');
        if (typeof window.airportMarkers !== 'undefined') {
            for (let i in airportMarkers) {
                airportMarkers[i].hide();
            }
        }
    }
}
