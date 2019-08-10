(function(window, document) {

    window.planeList = [];
    window.planeListObj = {};
    window.planePolyLine = undefined;

    var flightPlanObj = {},
        componentPlane = document.querySelector('#component-plane'),
        componentPlaneCloseBar = document.querySelector('#component-plane-closeBar');

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
                        planeListObj = {};
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
                        planeListObj = {};
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
                        planeListObj = {};
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
                if (!isFirst) {
                    switch (serverName) {
                        case 'Casual Server':
                            localStorage.server = 'cs';
                            location.reload();
                            break;
                        case 'Training Server':
                            localStorage.server = 'ts';
                            location.reload();
                            break;
                        case 'Expert Server':
                            localStorage.server = 'es';
                            location.reload();
                            break;
                    }
                }
                return;
            }

            layer.msg('正在向服务器请求飞行数据，请耐心等待...<br>(大约5-20秒钟，如果超过25秒钟还未请求成功，请稍后再试！)', {
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
            getATC(serverName, data);
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
                planeIcon = new BMap.Icon('img/icon/plane.png', new BMap.Size(25, 25)),
                myIcon = new BMap.Icon('img/icon/plane-my.png', new BMap.Size(25, 25));

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

                        //console.log(this.flight, userDetail, thisFlightPlanObj);

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
                        document.querySelector('#component-plane-index-info-headingRad').innerText = getDirection(parseInt(this.flight.Heading));
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
                        componentPlane.classList.add('show');
                        componentPlaneCloseBar.classList.add('show-component-plane-closeBar');

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
                mk.hide();
                map.addOverlay(mk);
            }
        })
        getBounds();
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
                var flightData = JSON.parse(xmlhttp.responseText);
                if ((!Array.isArray(flightData)) || flightData.length === 0) {
                    alert('Map-Flight已经成功连接到了后台，但是获取的航班数据似乎有一些问题（偶尔有一次是很正常的，因为Live API随时可能返回不正确的数据）。在你关闭弹窗之后，Map-Flight将尝试刷新页面并重新获取数据，如果连续3次都不能获取正确的数据，请尝试联系网站管理员（QQ：17310415421）');
                    window.location.reload();
                    return;
                }
                callback(flightData);
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

    function getDirection(deg) {
        if (deg === 0 || deg === 360) {
            return 'North';
        }
        if (deg === 90) {
            return 'East';
        }
        if (deg === 180) {
            return 'South';
        }
        if (deg === 270) {
            return 'West';
        }
        if (deg > 0 && deg < 90) {
            return 'Northeast';
        }
        if (deg > 90 && deg < 180) {
            return 'Southeast';
        }
        if (deg > 180 && deg < 270) {
            return 'Southwest';
        }
        if (deg > 270 && deg < 360) {
            return 'Northwest';
        }
        return 'Unknown';
    }

    //设置地图优化
    //地图绑定拖拽事件
    map.addEventListener('dragend', getBounds);
    //地图绑定滚动事件
    map.addEventListener('zoomend', getBounds);

    function getBounds() {
        if (planeList.length === 0) {
            return;
        }

        var bounds = map.getBounds(),
            SouthWest = bounds.getSouthWest(), //可视区域左下角
            NorthEast = bounds.getNorthEast(); //可视区域右上角

        var data = getBoundsList(SouthWest.lng, NorthEast.lng, SouthWest.lat, NorthEast.lat);

        for (var i = 0, lengths = data.listhide.length; i < lengths; i++) {
            data.listhide[i].hide();
        }
    }

    function getBoundsList(smlng, bglng, smlat, bglat) {
        var listhide = [], //隐藏的数据
            listshow = []; //显示的数据

        for (var i = 0, lengths = planeList.length; i < lengths; i++) {
            var _point = planeList[i].info;
            if (smlng < _point.lon && _point.lon < bglng && smlat < _point.lat && _point.lat < bglat) {
                //显示
                listshow.push(planeList[i]);
                //如果之前被隐藏则显示
                if (!planeList[i].isVisible()) {
                    planeList[i].show();
                }
            } else {
                //不显示
                listhide.push(planeList[i]);
            }
        }

        return {
            listshow: listshow,
            listhide: listhide
        }
    }
})(window, document);
