var myPlaneTextEl = document.querySelector('#left-nav #setMyPlane-btn a');

if (localStorage.myPlane !== undefined) {
    myPlaneTextEl.innerText += '（' + localStorage.myPlane + '）';
}

layui.use('layer', function() {
    var layer = layui.layer;
    document.querySelector('#left-nav #setMyPlane-btn').onclick = function() {
        layer.prompt({
            title: '请输入航班号（呼号）',
            cancel: function() {
                localStorage.removeItem("myPlane");
                myPlaneTextEl.innerText = '我的航班';
                layer.msg('清除成功！');
                window.location.reload();
            }
        }, function(value, index, elem) {
            value = value.trim();
            if (value.length === 0) {
                layer.msg('不能为空！');
                return false;
            }
            localStorage.myPlane = value;
            layer.msg('设置成功！');
            window.location.reload();
            layer.close(index);
        });
    }
})
