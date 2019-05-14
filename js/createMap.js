var map = new BMap.Map("world-map");
var point = new BMap.Point(116.404, 39.915);
map.centerAndZoom(point, 5);
map.addControl(new BMap.MapTypeControl({
    mapTypes: [
        BMAP_NORMAL_MAP,
        BMAP_HYBRID_MAP
    ]
}))
map.setCurrentCity("北京");
map.enableScrollWheelZoom(true);
