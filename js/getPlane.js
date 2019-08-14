(function(window, document) {

    window.planeList = [];
    window.planeListObj = {};
    window.planePolyLine = undefined;
    window.planePolyLineTrailFlightID = null;
    window.planePolyLineTrail = [];

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
                            window.location.reload();
                            break;
                        case 'Training Server':
                            localStorage.server = 'ts';
                            window.location.reload();
                            break;
                        case 'Expert Server':
                            localStorage.server = 'es';
                            window.location.reload();
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

                    for (var i = 0; i < planePolyLineTrail.length; i++) {
                        map.removeOverlay(planePolyLineTrail[i]);
                    }
                    planePolyLineTrail = [];

                    if (planePolyLine) {
                        map.removeOverlay(planePolyLine);
                        if (!(localStorage.displayAirport === undefined || localStorage.displayAirport === 'true')) {
                            //隐藏
                            planePolyLine.destAirportMk.isShowByGetPlane = undefined;
                            planePolyLine.destAirportMk.hide();
                        }
                        planePolyLine = undefined;
                    }

                    planePolyLineTrailFlightID = this.flight.FlightID;

                    getPlaneTrail(this.flight.FlightID, function(planeTrail) {
                        if (planePolyLineTrailFlightID !== this.flight.FlightID) {
                            return;
                        }

                        var newTrailArray = [],
                            lastLevel = null,
                            thisLevel = null;

                        for (var i = 0; i < planeTrail.length; i++) {
                            planeTrail[i].Altitude = parseInt(planeTrail[i].Altitude);
                            if (planeTrail[i].Altitude <= 1000) {
                                thisLevel = 0;
                            } else if (planeTrail[i].Altitude > 1000 && planeTrail[i].Altitude <= 3000) {
                                thisLevel = 1;
                            } else if (planeTrail[i].Altitude > 3000 && planeTrail[i].Altitude <= 6000) {
                                thisLevel = 2;
                            } else if (planeTrail[i].Altitude > 6000 && planeTrail[i].Altitude <= 10000) {
                                thisLevel = 3;
                            } else if (planeTrail[i].Altitude > 10000 && planeTrail[i].Altitude <= 14000) {
                                thisLevel = 4;
                            } else if (planeTrail[i].Altitude > 14000 && planeTrail[i].Altitude <= 19000) {
                                thisLevel = 5;
                            } else if (planeTrail[i].Altitude > 19000 && planeTrail[i].Altitude <= 24000) {
                                thisLevel = 6;
                            } else if (planeTrail[i].Altitude > 24000 && planeTrail[i].Altitude <= 29000) {
                                thisLevel = 7;
                            } else if (planeTrail[i].Altitude > 29000 && planeTrail[i].Altitude <= 34000) {
                                thisLevel = 8;
                            } else if (planeTrail[i].Altitude > 34000 && planeTrail[i].Altitude <= 40000) {
                                thisLevel = 9;
                            } else if (planeTrail[i].Altitude > 40000) {
                                thisLevel = 10;
                            }

                            if (thisLevel !== lastLevel) {
                                newTrailArray.push(new BMap.Point(planeTrail[i].Longitude, planeTrail[i].Latitude));
                                renderFlightTrail(newTrailArray, thisLevel);
                                newTrailArray = [];
                                lastLevel = thisLevel;
                            }

                            //这里push第二次，为了避免断连
                            newTrailArray.push(new BMap.Point(planeTrail[i].Longitude, planeTrail[i].Latitude));
                        }

                        renderFlightTrail(newTrailArray, thisLevel);

                        //渲染到目的地的航线
                        var thisFlightPlanObj = flightPlanObj[this.flight.FlightID];

                        if (typeof airportMarkers !== 'undefined' && airportMarkers[thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'UnK']) {
                            window.planePolyLine = new BMap.Polyline([this.mk.getPosition(), new BMap.Point(airportMarkers[thisFlightPlanObj.DestinationAirportCode].info.lon, airportMarkers[thisFlightPlanObj.DestinationAirportCode].info.lat)], {
                                strokeColor: "black",
                                strokeWeight: 2,
                                strokeOpacity: 1,
                                strokeStyle: "dashed"
                            })
                            airportMarkers[thisFlightPlanObj.DestinationAirportCode].show();
                            window.planePolyLine.destAirportMk = airportMarkers[thisFlightPlanObj.DestinationAirportCode];
                            window.planePolyLine.destAirportMk.isShowByGetPlane = true;
                            map.addOverlay(planePolyLine);
                        }

                        //更新航班坐标
                        if (newTrailArray.length > 0) {
                            this.mk.setPosition(newTrailArray[newTrailArray.length - 1]);
                        }

                        var planeRotation = null;
                        if (planeTrail.length > 1) {
                            planeRotation = getHeadingWithPosition(planeTrail[planeTrail.length - 2].Longitude, planeTrail[planeTrail.length - 1].Longitude, planeTrail[planeTrail.length - 2].Latitude, planeTrail[planeTrail.length - 1].Latitude);
                            this.mk.setRotation(planeRotation);
                        }

                        //更新航班信息
                        if (planeRotation) {
                            this.flight.Heading = planeRotation;
                        }
                        this.flight.Altitude = planeTrail[planeTrail.length - 1].Altitude;
                        this.flight.VerticalSpeed = planeTrail[planeTrail.length - 1].VerticalSpeed;
                        this.flight.Longitude = planeTrail[planeTrail.length - 1].Longitude;
                        this.flight.Latitude = planeTrail[planeTrail.length - 1].Latitude;
                    }.bind(this))

                    getUserDetail(this.flight.UserID, (userDetail) => {
                        layer.close(loadPlaneDataLayer);

                        var thisFlightPlanObj = flightPlanObj[this.flight.FlightID];
                        userDetail = userDetail[0];

                        if (userDetail === undefined || userDetail.length === 0) {
                            layer.msg('航班数据加载失败！请刷新航班');
                            return;
                        }

                        //修改信息
                        //index页面飞机图标
                        document.querySelector('#component-plane-index img').src = 'https://cdn.liveflightapp.com/aircraft-images/' + this.flight.AircraftID + '/' + this.flight.LiveryID + '.jpg';
                        //index页面主按钮的点击事件
                        document.querySelector('#component-plane-index-operationBoard-operationBar-toFlightLocationOnMapBtn').onclick = function() {
                            map.panTo(this.getPosition(), {
                                noAnimation: true
                            })
                            getBoundsPlane();
                            getBoundsAirport();
                        }.bind(this.mk);
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
                        //index页面的机型名称、涂装名称、地速knot、地速KMH、高度ft、高度m、vs ft、vs m、航向deg、航向rad、起飞机场、降落机场
                        document.querySelector('#component-plane-index-info-aircraftName').innerText = aircraftData[this.flight.AircraftID + this.flight.LiveryID].aircraft;
                        document.querySelector('#component-plane-index-info-liveryName').innerText = aircraftData[this.flight.AircraftID + this.flight.LiveryID].livery;
                        document.querySelector('#component-plane-index-info-gsKnot').innerText = parseInt(this.flight.Speed) + 'kn';
                        document.querySelector('#component-plane-index-info-gsKMH').innerText = parseInt(this.flight.Speed * 1.852) + 'km/h';
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
                    })
                }.bind({
                    flight: flights[i],
                    mk
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
        getBoundsPlane();
        return userCount;
    }

    function renderFlightTrail(newTrailArray, level) {
        var thisPolyLineTrail,
            polyLineColor;

        switch (level) {
            case 0:
                polyLineColor = "#00ffbc";
                break;
            case 1:
                polyLineColor = "#00ffea";
                break;
            case 2:
                polyLineColor = "#00f4ff";
                break;
            case 3:
                polyLineColor = "#00d6ff";
                break;
            case 4:
                polyLineColor = "#00bfff";
                break;
            case 5:
                polyLineColor = "#00a0ff";
                break;
            case 6:
                polyLineColor = "#0082ff";
                break;
            case 7:
                polyLineColor = "#005bff";
                break;
            case 8:
                polyLineColor = "#002dff";
                break;
            case 9:
                polyLineColor = "#8900ff";
                break;
            case 10:
                polyLineColor = "#ce00ff";
                break;
        }

        thisPolyLineTrail = new BMap.Polyline(newTrailArray, {
            strokeColor: polyLineColor,
            strokeWeight: 2,
            strokeOpacity: 1,
            strokeStyle: "solid"
        })

        window.planePolyLineTrail.push(thisPolyLineTrail);
        map.addOverlay(thisPolyLineTrail);
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
                    getFlights(sessionId, callback);
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
    map.addEventListener('dragend', getBoundsPlane);
    //地图绑定滚动事件
    map.addEventListener('zoomend', getBoundsPlane);

    function getBoundsPlane() {
        if (planeList.length === 0) {
            return;
        }

        var bounds = map.getBounds(),
            SouthWest = bounds.getSouthWest(), //可视区域左下角
            NorthEast = bounds.getNorthEast(); //可视区域右上角

        var data = getBoundsListPlane(SouthWest.lng, NorthEast.lng, SouthWest.lat, NorthEast.lat);

        for (var i = 0, lengths = data.listhide.length; i < lengths; i++) {
            data.listhide[i].hide();
        }
    }

    function getBoundsListPlane(smlng, bglng, smlat, bglat) {
        var listhide = [], //隐藏的数据
            listshow = []; //显示的数据

        for (var i = 0, lengths = planeList.length; i < lengths; i++) {
            var _point = planeList[i].getPosition();
            if (smlng < _point.lng && _point.lng < bglng && smlat < _point.lat && _point.lat < bglat) {
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

    function getHeadingWithPosition(lng1, lng2, lat1, lat2) {
        dRotateAngle = Math.atan2(Math.abs(lng1 - lng2), Math.abs(lat1 - lat2));
        if (lng2 >= lng1) {
            if (!(lat2 >= lat1)) {
                dRotateAngle = Math.PI - dRotateAngle;
            }
        } else {
            if (lat2 >= lat1) {
                dRotateAngle = 2 * Math.PI - dRotateAngle;
            } else {
                dRotateAngle = Math.PI + dRotateAngle;
            }
        }
        dRotateAngle = dRotateAngle * 180 / Math.PI;
        return dRotateAngle;
    }

})(window, document);
