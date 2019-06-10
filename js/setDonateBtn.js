document.querySelector('#donate-btn').onclick = function() {
    layer.alert('<img height="250px" src="img/donate-QRcode.png" alt="微信捐赠二维码加载失败，您可以加我的QQ发个红包给我（QQ：17310415421）！">', {
        skin: 'layui-layer-molv',
        closeBtn: 0,
        title: '感谢您对我们的慷慨捐赠！'
    })
}
