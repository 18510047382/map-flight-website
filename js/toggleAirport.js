document.querySelector('#toggleAirport-btn').onclick = function() {
    //默认隐藏
    if (localStorage.displayAirport !== undefined) {
        if (localStorage.displayAirport === 'true') {
            //隐藏
            localStorage.displayAirport = false;
            document.querySelector('#toggleAirport-btn').classList.remove('layui-this');
            if (typeof window.airportMarkers !== 'undefined') {
                for (let i in airportMarkers) {
                    airportMarkers[i].hide();
                }
            }
            layer.msg('大型机场已隐藏');
        } else {
            //显示
            localStorage.displayAirport = true;
            document.querySelector('#toggleAirport-btn').classList.add('layui-this');
            if (typeof window.airportMarkers === 'undefined') {
                getAirportExcelFn(false);
            } else {
                for (let i in airportMarkers) {
                    airportMarkers[i].show();
                }
            }
            layer.msg('大型机场已显示');
        }
    } else {
        localStorage.displayAirport = false;
        document.querySelector('#toggleAirport-btn').classList.remove('layui-this');
        if (typeof window.airportMarkers !== 'undefined') {
            for (let i in airportMarkers) {
                airportMarkers[i].hide();
            }
        }
        layer.msg('大型机场已隐藏');
    }
}
