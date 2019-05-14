document.querySelector('#nav-me-childnav #showqq-btn').onclick = function() {
    layui.code
    layui.use('layer', function() {
        var layer = layui.layer;
        layer.alert('欢迎加我 QQ，商业合作、交流等等都是可以的！<br><b>QQ：17310415421</b>', {
            title: '站长 QQ：'
        })
    })
}
