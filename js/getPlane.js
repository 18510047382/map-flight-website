(function(window, document) {

    window.planeList = [];

    var flightPlanObj = {},
        componentPlaneIndex = document.querySelector('#component-plane-index').innerHTML,
        componentPlaneFlight = document.querySelector('#component-plane-flight').innerHTML,
        componentPlaneUser = document.querySelector('#component-plane-user').innerHTML;

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
                layer.msg('飞行计划还未获取成功，暂时不能刷新！<br>（地图右下角可以看到获取状态）');
                return;
            }

            layer.msg('正在向服务器请求飞行数据，请耐心等待...<br>(大约5~15秒钟)', {
                zIndex: 19891016
            });
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

                let userCount = printFlight(flights);

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
        let userCount = 0;
        layui.use('layer', function() {
            var layer = layui.layer,
                thisIcon,
                planeIcon = new BMap.Icon('img/icon/plane.png', new BMap.Size(30, 30)),
                myIcon = new BMap.Icon('img/icon/plane-my.png', new BMap.Size(30, 30));

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
                    if (Object.keys(flightPlanObj).length === 0) {
                        layer.msg('航班计划还在获取中，某些字段会显示"UnK"！<br>（地图右下角可以看到获取状态）');
                    }

                    var loadPlaneDataLayer = layer.load(2);
                    getUserDetail(this.userID, (userDetail) => {
                        layer.close(loadPlaneDataLayer);

                        var thisPlaneName = aircraftData[this.flight.AircraftID + this.flight.LiveryID],
                            thisFlightPlanObj = flightPlanObj[this.flight.FlightID];

                        userDetail = userDetail[0];

                        //console.log(this.flight, userDetail, thisFlightPlanObj, flightPlanObj);

                        if (userDetail.length === 0) {
                            layer.msg('航班数据加载失败！请刷新航班');
                            return;
                        }

                        layer.tab({
                            area: ['700px', '500px'],
                            tab: [{
                                title: '<i class="layui-icon layui-icon-home"></i>&nbsp;航班简介',
                                content: Mustache.render(componentPlaneIndex, {
                                    callSign: this.callSign,
                                    userDetail,
                                    thisPlaneName,
                                    departureAirport: thisFlightPlanObj ? thisFlightPlanObj.DepartureAirportCode : 'UnK',
                                    destinationAirport: thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'UnK'
                                })
                            }, {
                                title: '<i class="layui-icon layui-icon-flag"></i>&nbsp;航班信息',
                                content: Mustache.render(componentPlaneFlight, {
                                    callSign: this.callSign,
                                    userDetail,
                                    thisPlaneName,
                                    altitude: parseInt(this.flight.Altitude) + 'ft',
                                    heading: parseInt(this.flight.Heading) + 'deg',
                                    speed: parseInt(this.flight.Speed) + 'knot',
                                    verticalSpeed: parseInt(this.flight.VerticalSpeed) + 'ft/min',
                                    departureAirport: thisFlightPlanObj ? thisFlightPlanObj.DepartureAirportCode : 'UnK',
                                    destinationAirport: thisFlightPlanObj ? thisFlightPlanObj.DestinationAirportCode : 'UnK',
                                    longitude: this.flight.Longitude,
                                    latitude: this.flight.Latitude
                                })
                            }, {
                                title: '<i class="layui-icon layui-icon-username"></i>&nbsp;用户信息',
                                content: Mustache.render(componentPlaneUser, {
                                    callSign: this.callSign,
                                    userDetail,
                                    thisPlaneName
                                })
                            }]
                        })
                    })
                }.bind({
                    flight: flights[i],
                    userID: flights[i].UserID,
                    callSign: flights[i].CallSign
                })

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
})(window, document);
