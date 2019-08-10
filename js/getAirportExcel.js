var componentAirport = document.querySelector('#component-airport'),
    componentAirportCloseBar = document.querySelector('#component-airport-closeBar');

function getAirportExcelFn(isFirst) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 'data/airport.csv', false);
    xmlhttp.send();

    var data = xmlhttp.responseText,
        thisData,
        markersObj = {},
        airportIcon = new BMap.Icon('img/icon/airport.png', new BMap.Size(20, 20)),
        airportATCIcon = new BMap.Icon('img/icon/airport-atc.png', new BMap.Size(20, 20));

    data = data.split('\n');
    data.splice(0, 1);

    for (var i = 0; i < data.length; i++) {
        thisData = data[i].split(',');
        var mk;
        if (isFirst) {
            mk = new BMap.Marker(new BMap.Point(thisData[3], thisData[2]), {
                icon: airportIcon
            })
        } else {
            var nowServerDetail;
            switch (nowServer) {
                case 'cs':
                    nowServerDetail = 'Casual Server';
                    break;
                case 'ts':
                    nowServerDetail = 'Training Server';
                    break;
                case 'es':
                    nowServerDetail = 'Expert Server';
                    break;
            }
            if (typeof atc[nowServerDetail][thisData[0]] === 'undefined') {
                mk = new BMap.Marker(new BMap.Point(thisData[3], thisData[2]), {
                    icon: airportIcon
                })
            } else {
                mk = new BMap.Marker(new BMap.Point(thisData[3], thisData[2]), {
                    icon: airportATCIcon
                })
            }
        }
        mk.onclick = function() {
            var layerLoading = layer.load(2);

            document.querySelector('#component-airport-index-airportName').innerText = this.info.name;
            document.querySelector('#component-airport-index-airportCode').innerText = this.info.code;
            document.querySelector('#component-airport-index-info-locationLon').innerText = this.info.lon;
            document.querySelector('#component-airport-index-info-locationLat').innerText = this.info.lat;
            document.querySelector('#component-airport-index-info-attitudeFt').innerText = parseInt(this.info.ft).toString() + 'ft';
            document.querySelector('#component-airport-index-info-attitudeMeter').innerText = (parseInt(this.info.ft) * 0.3048) + 'm';
            var nowServerDetail;
            switch (nowServer) {
                case 'cs':
                    nowServerDetail = 'Casual Server';
                    break;
                case 'ts':
                    nowServerDetail = 'Training Server';
                    break;
                case 'es':
                    nowServerDetail = 'Expert Server';
                    break;
            }
            if (typeof atc[nowServerDetail][this.info.code] === 'undefined') {
                document.querySelector('#component-airport-info-error').style.display = 'block';
                document.querySelector('#component-airport-info-ok').style.display = 'none';
            } else {
                //渲染atc界面
                var html = '';
                for (var i in atc[nowServerDetail][this.info.code]) {
                    html += '<span tabindex="0" type="button" id="component-airport-info-ok-1span"><div><span style="height: 100%; width: 100%; position: absolute; top: 0px; left: 0px; overflow: hidden;"></span><div id="component-airport-info-ok-1span-div"><svg viewBox="0 0 24 24" style="display: block; fill: rgb(117, 117, 117); height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms; position: absolute; top: 0px; margin: 12px; color: rgb(117, 117, 117); left: 4px;"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 3-3V10c0-4.97-4.03-9-9-9z"></path></svg><button id="component-airport-info-ok-1span-div-btn" tabindex="0" type="button"><div><svg viewBox="0 0 24 24" style="display: inline-block; fill: rgba(0, 0, 0, 0.87); height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></svg></div></button><div>';
                    switch (i) {
                        case '0':
                            html += 'Ground'
                            break;
                        case '1':
                            html += 'Tower'
                            break;
                        case '2':
                            html += 'Unicom'
                            break;
                        case '3':
                            html += 'Clearance'
                            break;
                        case '4':
                            html += 'Approach'
                            break;
                        case '5':
                            html += 'Departure'
                            break;
                        case '6':
                            html += 'Center'
                            break;
                        case '7':
                            html += 'ATIS'
                            break;
                        case '8':
                            html += 'Aircraft'
                            break;
                        case '9':
                            html += 'Recorded'
                            break;
                        case '10':
                            html += 'Unknown'
                            break;
                        case '11':
                            html += 'Unused'
                            break;
                    }
                    html += '</div></div></div></span><div style="padding: 16px; font-weight: 500; box-sizing: border-box; position: relative; white-space: nowrap; height: auto; top: 5px;"><svg viewBox="0 0 24 24" style="display: inline-block; fill: rgba(0, 0, 0, 0.87); height: 36px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms; margin-right: 24px; float: left; position: relative; bottom: 10px;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg><div style="display: block; vertical-align: top; white-space: normal; padding-right: 0px; padding-left: 50px;"><span style="color: rgba(0, 0, 0, 0.87); display: block; font-size: 15px;"><div style="margin-top: -10px;">' + atc[nowServerDetail][this.info.code][i].UserName + '<div></div></div></span><span style="color: rgba(0, 0, 0, 0.54); display: block; font-size: 14px;">Controller</span></div></div>';
                }
                html += '<hr>';
                document.querySelector('#component-airport-info-ok').innerHTML = html;
                document.querySelector('#component-airport-info-ok').style.display = 'block';
                document.querySelector('#component-airport-info-error').style.display = 'none';
            }

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var airportWeatherData = JSON.parse(xmlhttp.responseText);

                        console.log(airportWeatherData);

                        if (typeof airportWeatherData.error !== 'undefined') {
                            document.querySelector('#component-airport-weather-ok').style.display = 'none';
                            document.querySelector('#component-airport-weather-error').style.display = 'block';
                        } else {
                            //ok
                            document.querySelector('#component-airport-weather-ok').style.display = 'block';
                            document.querySelector('#component-airport-weather-error').style.display = 'none';

                            document.querySelector('#component-airport-weather-airportName').innerText = this.name;

                            document.querySelector('#component-airport-weather-info-visibility').innerText = airportWeatherData.visibility.value + 'M';

                            document.querySelector('#component-airport-weather-info-temperature').innerText = airportWeatherData.temperature.value + 'C°';

                            document.querySelector('#component-airport-weather-info-altimeter').innerText = airportWeatherData.altimeter.value + 'hPa';

                            document.querySelector('#component-airport-weather-info-windSpeed').innerText = airportWeatherData.wind_speed.value + 'M/S';

                            document.querySelector('#component-airport-weather-info-windDirection').innerText = airportWeatherData.wind_direction.value + '°';
                        }

                        //显示面板
                        componentAirport.classList.add('show');
                        componentAirportCloseBar.classList.add('show-component-airport-closeBar');
                    } else {
                        document.querySelector('#component-airport-weather-ok').style.display = 'none';
                        document.querySelector('#component-airport-weather-error').style.display = 'block';

                        //显示面板
                        componentAirport.classList.add('show');
                        componentAirportCloseBar.classList.add('show-component-airport-closeBar');
                    }
                    layer.close(layerLoading);
                }
            }.bind(this.info)

            xmlhttp.open("GET", 'https://avwx.rest/api/metar/' + this.info.code + '?options=&format=json&onfail=cache', true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send();
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

if (localStorage.displayAirport === undefined || localStorage.displayAirport === 'false') {
    //隐藏
    localStorage.displayAirport = false;
} else {
    getAirportExcelFn(true);
    document.querySelector('#toggleAirport-btn').classList.add('layui-this');
}
