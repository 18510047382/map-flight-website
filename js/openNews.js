if (!localStorage.isClickedNews || !localStorage.newsExpireTime || (new Date().getTime() > (parseInt(localStorage.newsExpireTime) + (1000 * 60 * 60 * 24 * 10)))) {
    if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent)) || /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
        //手机访问
        layui.use('layer', function() {
            layui.layer.open({
                type: 2,
                title: 'Map-Flight新闻 :)',
                shadeClose: true,
                shade: false,
                maxmin: true,
                area: ['100%', '400px'],
                content: 'news/news.html',
                end: function() {
                    localStorage.newsExpireTime = new Date().getTime().toString();
                    localStorage.isClickedNews = true;
                }
            })
        })
    } else {
        //电脑访问
        layui.use('layer', function() {
            layui.layer.open({
                type: 2,
                title: 'Map-Flight新闻 :)',
                shadeClose: true,
                shade: false,
                maxmin: true,
                area: ['693px', '400px'],
                content: 'news/news.html',
                end: function() {
                    localStorage.newsExpireTime = new Date().getTime().toString();
                    localStorage.isClickedNews = true;
                }
            })
        })
    }
}
