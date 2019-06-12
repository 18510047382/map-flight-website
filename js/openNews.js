if (!localStorage.isClickedNews) {
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
                localStorage.isClickedNews = true;
            }
        })
    })
}
