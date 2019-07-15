(function(window, document) {

    window.planeList = [];
    window.planeListObj = {};
    window.planePolyLine = undefined;

    var flightPlanObj = {},
        componentPlane = document.querySelector('#component-plane');

    document.querySelector('#map-refresh-btn').onclick = function() {
        layui.use('layer', function() {
            var layer = layui.layer;
            planeLoadingLayer = layer.load(2);
            switch (nowServer) {
                case 'cs':
                    getCSPlane(function() {
                        //清除旧飞机
                        for (var i = 0; i < planeList.length; i++) {
                            map.removeOverlay(planeList[i]);
                        }
                        planeList = [];
                        //关闭加载层
                        layer.close(planeLoadingLayer);
                    }, function() {}, function() {
                        layer.close(planeLoadingLayer);
                    }, false)
                    break;

                case 'ts':
                    getTSPlane(function() {
                        //清除旧飞机
                        for (var i = 0; i < planeList.length; i++) {
                            map.removeOverlay(planeList[i]);
                        }
                        planeList = [];
                        //关闭加载层
                        layer.close(planeLoadingLayer);
                    }, function() {}, function() {
                        layer.close(planeLoadingLayer);
                    }, false)
                    break;

                case 'es':
                    getESPlane(function() {
                        //清除旧飞机
                        for (var i = 0; i < planeList.length; i++) {
                            map.removeOverlay(planeList[i]);
                        }
                        planeList = [];
                        //关闭加载层
                        layer.close(planeLoadingLayer);
                    }, function() {}, function() {
                        layer.close(planeLoadingLayer);
                    }, false)
                    break;
            }
        })
    }

    window.getCSPlane = function(firstCallback, lastCallback, errorCallback, isFirst) {
        getPlanes("Casual Server", firstCallback, lastCallback, errorCallback, isFirst);
    }

    window.getTSPlane = function(firstCallback, lastCallback, errorCallback, isFirst) {
        getPlanes("Training Server", firstCallback, lastCallback, errorCallback, isFirst);
    }

    window.getESPlane = function(firstCallback, lastCallback, errorCallback, isFirst) {
        getPlanes("Expert Server", firstCallback, lastCallback, errorCallback, isFirst);
    }

    function getPlanes(serverName, firstCallback, lastCallback, errorCallback, isFirst) {
        var isGetPlanCompleted = true;

        layui.use('layer', function() {
            var layer = layui.layer;

            if (Object.keys(flightPlanObj).length === 0 && !isFirst) {
                isGetPlanCompleted = false;
                errorCallback();
                layer.msg('飞行计划还未获取成功，暂时不能刷新！<br>（如果右下角已经显示获取成功，则服务器无法获得有效的飞行数据，请稍后再试）');
                return;
            }

            layer.msg('正在向服务器请求飞行数据，请耐心等待...<br>(大约5~15秒钟，如果超过15秒钟还未请求成功，请稍后再试！)', {
                zIndex: 19891016
            })
        })

        if (!isGetPlanCompleted) {
            return;
        }

        flightPlanObj = {};

        //修改plan获取状态
        document.querySelector('#plan-get-state').innerHTML = '<span class="layui-badge-dot"></span>&nbsp;Getting Plan...';

        getServerData(serverName, function(data) {
            getFlights(data.Id, function(flights) {
                if (firstCallback) {
                    firstCallback();
                }

                var userCount = printFlight(flights);

                if (lastCallback) {
                    lastCallback();
                }

                document.querySelector('#plane-count').innerText = userCount + '/' + data.MaxUsers;
            })

            getFlightPlans(data.Id, function(plans) {
                //添加飞机计划到object里
                for (var i = 0; i < plans.length; i++) {
                    flightPlanObj[plans[i].FlightID] = plans[i];
                }

                //修改plan获取状态
                document.querySelector('#plan-get-state').innerHTML = '<span class="layui-badge-dot layui-bg-green"></span>&nbsp;Get completed.';
            })
        })
    }

    function printFlight(flights) {
        var userCount = 0;
        layui.use('layer', function() {
            var layer = layui.layer,
                thisIcon,
                planeIcon = new BMap.Icon('img/icon/plane.png', new BMap.Size(20, 20)),
                myIcon = new BMap.Icon('img/icon/plane-my.png', new BMap.Size(20, 20));

            for (var i = 0; i < flights.length; i++) {
                if (localStorage.myPlane !== flights[i].CallSign) {
                    thisIcon = planeIcon;
                } else {
                    thisIcon = myIcon;
                }

                if (filterPlane && flights[i].DisplayName.substr(0, filterPlane.length) !== filterPlane) {
                    continue;
                }

                userCount++;

                var mk = new BMap.Marker(new BMap.Point(flights[i].Longitude, flights[i].Latitude), {
                    icon: thisIcon,
                    rotation: flights[i].Heading
                })
                mk.onclick = function() {
                    var loadPlaneDataLayer = layer.load(2);

                    if (planePolyLine) {
                        map.removeOverlay(planePolyLine);
                        if (!(localStorage.displayAirport === undefined || localStorage.displayAirport === 'true')) {
                            //隐藏
                            planePolyLine.destAirportMk.hide();
                        }
                        planePolyLine = undefined;
                    }

                    getUserDetail(this.flight.UserID, (userDetail) => {
                        layer.close(loadPlaneDataLayer);

                        var thisFlightPlanObj = flightPlanObj[this.flight.FlightID];

                        userDetail = userDetail[0];

                        if (userDetail === undefined || userDetail.length === 0) {
                            layer.msg('航班数据加载失败！请刷新航班');
                            return;
                        }

                        console.log(this.flight, userDetail, thisFlightPlanObj);

                        /*
                        {
                            callSign: this.callSign,
                            userDetail,
                            departureAirport: thisFlightPlanObj ? thisFlightPlanObj.DepartureAirportCode : 'UnK',
                            destinationAirport: thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'UnK',
                            callSign: this.callSign,
                            altitude: parseInt(this.flight.Altitude) + 'ft',
                            heading: parseInt(this.flight.Heading) + 'deg',
                            speed: parseInt(this.flight.Speed) + 'knot',
                            verticalSpeed: parseInt(this.flight.VerticalSpeed) + 'ft/min',
                            longitude: this.flight.Longitude,
                            latitude: this.flight.Latitude,
                            wpt: wpt,
                        }
                        */

                        //修改信息
                        //index页面飞机图标
                        document.querySelector('#component-plane-index img').src = 'https://cdn.liveflightapp.com/aircraft-images/' + this.flight.AircraftID + '/' + this.flight.LiveryID + '.jpg';
                        //index页面主按钮的点击事件
                        document.querySelector('#component-plane-index-operationBoard-operationBar-toFlightLocationOnMapBtn').onclick = function() {
                            map.panTo(new BMap.Point(this.Longitude, this.Latitude));
                        }.bind(this.flight);
                        document.querySelector('#component-plane-index-operationBoard-operationBar-toFlightPlanBtn').onclick = function() {
                            document.querySelector('#component-plane-menu-infoBtn').click();
                        }.bind(this.flight);
                        document.querySelector('#component-plane-index-operationBoard-operationBar-shareThisFlightBtn').onclick = function() {
                            window.open('https://connect.qq.com/widget/shareqq/iframe_index.html?title=在 Map-Flight 上查看我的航班 - ' + this.CallSign + '&url=https://www.map-flight.com&summary=这是我在Map-Flight上的航班 - ' + this.CallSign + '，快来点击查看吧！&style=201&width=32&height=32');
                        }.bind(this.flight);
                        document.querySelector('#component-plane-index-operationBoard-operationBar-downloadFlightBtn').onclick = function() {
                            var blob = new Blob([document.querySelector('#component-plane').innerText], {
                                    type: "text/plain"
                                }),
                                link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = "Map-Flight航班数据 - " + this.CallSign + ".txt";
                            link.click();
                            URL.revokeObjectURL(link.href);
                        }.bind(this.flight);
                        //index页面的起飞及降落机场
                        document.querySelector('#component-plane-index-operationBoard-locationBar div:nth-child(1) strong').innerText = thisFlightPlanObj ? thisFlightPlanObj.DepartureAirportCode : 'Loading...';
                        document.querySelector('#component-plane-index-operationBoard-locationBar div:nth-child(2) strong').innerText = thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'Loading...';
                        //index页面的起飞机场和降落机场时间
                        document.querySelector('#component-plane-index-operationBoard-locationBar div:nth-child(1) small').innerText = thisFlightPlanObj ? formatToDate(thisFlightPlanObj.LastUpdate) : 'Loading...';
                        document.querySelector('#component-plane-index-operationBoard-locationBar div:nth-child(2) small').innerText = thisFlightPlanObj ? new Date().toDateString() : 'Loading...';
                        //index页面的呼号及显示名称
                        document.querySelector('#component-plane-index-operationBoard-callSign').innerText = this.flight.CallSign;
                        document.querySelector('#component-plane-index-operationBoard-displayName').innerText = this.flight.DisplayName;
                        //index页面的机型名称、涂装名称、高度ft、高度m、vs ft、vs m、航向deg、航向rad、起飞机场、降落机场
                        document.querySelector('#component-plane-index-info-aircraftName').innerText = aircraftData[this.flight.AircraftID + this.flight.LiveryID].aircraft;
                        document.querySelector('#component-plane-index-info-liveryName').innerText = aircraftData[this.flight.AircraftID + this.flight.LiveryID].livery;
                        document.querySelector('#component-plane-index-info-altitudeFt').innerText = parseInt(this.flight.Altitude) + 'ft';
                        document.querySelector('#component-plane-index-info-altitudeMetre').innerText = parseInt(this.flight.Altitude * 0.3048) + 'm';
                        document.querySelector('#component-plane-index-info-vsFt').innerText = parseInt(this.flight.VerticalSpeed) + 'ft';
                        document.querySelector('#component-plane-index-info-vsMetre').innerText = parseInt(this.flight.VerticalSpeed * 0.3048) + 'm';
                        document.querySelector('#component-plane-index-info-headingDeg').innerText = parseInt(this.flight.Heading) + 'deg';
                        document.querySelector('#component-plane-index-info-headingRad').innerText = parseInt(this.flight.Heading * 0.01745) + 'π';
                        document.querySelector('#component-plane-index-info-depAirport').innerText = thisFlightPlanObj ? thisFlightPlanObj.DepartureAirportCode : 'Loading...';
                        document.querySelector('#component-plane-index-info-arrAirport').innerText = thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'Loading...';
                        //info页面的dep和arr机场、经度、纬度、最后更新时间、当前时间
                        document.querySelector('#component-plane-info-depAirport').innerText = thisFlightPlanObj ? thisFlightPlanObj.DepartureAirportCode : 'Loading...';
                        document.querySelector('#component-plane-info-arrAirport').innerText = thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'Loading...';
                        document.querySelector('#component-plane-info-lon').innerText = this.flight.Longitude;
                        document.querySelector('#component-plane-info-lat').innerText = this.flight.Latitude;
                        document.querySelector('#component-plane-info-lastUpdate').innerText = thisFlightPlanObj ? formatToDate(thisFlightPlanObj.LastUpdate) : 'Loading...';
                        document.querySelector('#component-plane-info-nowDate').innerText = new Date().toLocaleString();
                        //info页面的waypoints
                        if (thisFlightPlanObj) {
                            var waypointsHTML = '';
                            for (var i = 0; i < thisFlightPlanObj.Waypoints.length; i++) {
                                waypointsHTML += '<div class="component-plane-index-info">' + thisFlightPlanObj.Waypoints[i] + '</div>' + '<hr>';
                            }
                            document.querySelector('#component-plane-index-info-waypoints-index').innerHTML = waypointsHTML;
                        } else {
                            document.querySelector('#component-plane-index-info-waypoints-index').innerHTML = '<div class="component-plane-index-info">Loading...</div><hr>';
                        }
                        //player页面的等级、XP、飞行时间、飞行次数、降落次数、警告次数、atc举报次数、atc指令
                        document.querySelector('#component-plane-player-grade').innerText = userDetail.PilotStats.GradeName;
                        document.querySelector('#component-plane-player-xp').innerText = userDetail.PilotStats.TotalXP;
                        document.querySelector('#component-plane-player-flightTime').innerText = userDetail.PilotStats.TotalFlightTime;
                        document.querySelector('#component-plane-player-flight').innerText = userDetail.OnlineFlights;
                        document.querySelector('#component-plane-player-landing').innerText = userDetail.LandingCount;
                        document.querySelector('#component-plane-player-violation').innerText = userDetail.PilotStats.TotalViolations;
                        document.querySelector('#component-plane-player-ghost').innerText = userDetail.PilotStats.TotalATCGhostings;

                        //显示面板
                        componentPlane.style.display = 'block';

                        if (typeof airportMarkers !== 'undefined' && airportMarkers[thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'UnK']) {
                            var polyLine = new BMap.Polyline([new BMap.Point(this.flight.Longitude, this.flight.Latitude), new BMap.Point(airportMarkers[thisFlightPlanObj.DestinationAirportCode].info.lon, airportMarkers[thisFlightPlanObj.DestinationAirportCode].info.lat)], {
                                strokeColor: "black",
                                strokeWeight: 2,
                                strokeOpacity: 1,
                                strokeStyle: "dashed"
                            })
                            airportMarkers[thisFlightPlanObj.DestinationAirportCode].show();
                            polyLine.destAirportMk = airportMarkers[thisFlightPlanObj.DestinationAirportCode];
                            planePolyLine = polyLine;
                            map.addOverlay(polyLine);
                        }
                    })
                }.bind({
                    flight: flights[i]
                })

                mk.info = {
                    lon: flights[i].Longitude,
                    lat: flights[i].Latitude
                }

                planeListObj[flights[i].CallSign] = mk;
                planeList.push(mk);
                map.addOverlay(mk);
            }
        })
        return userCount;
    }

    function getFlightPlans(sessionId, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(JSON.parse(xmlhttp.responseText));
            }
        }
        xmlhttp.open("GET", 'https://' + backendLink + ':8000/getFlightPlans?id=' + sessionId, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send();
    }

    function getUserDetail(userID, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(JSON.parse(xmlhttp.responseText));
            }
        }
        xmlhttp.open("GET", 'https://' + backendLink + ':8000/getUserDetail?id=' + userID, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send();
    }

    function getFlights(sessionId, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(JSON.parse(xmlhttp.responseText));
            }
        }
        xmlhttp.open("GET", 'https://' + backendLink + ':8000/getAllFlights?id=' + sessionId, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send();
    }

    function getServerData(serverName, callback) {
        getServer(function(serverData) {
            var thisServer;
            for (var i = 0; i < serverData.length; i++) {
                if (serverData[i].Name === serverName) {
                    thisServer = serverData[i];
                }
            }
            callback(thisServer);
        })
    }

    function formatToDate(val) {
        if (val != null) {
            var date = new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10));
            var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            return date.getFullYear() + "-" + month + "-" + currentDate;
        }
        return "";
    }
})(window, document);
