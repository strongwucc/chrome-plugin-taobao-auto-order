$('#auto-buy').click(function () {
	var username = $('#username').val()
	var password = $('#password').val()

	if (!username || !password) {
        alert('请输入淘宝账号和密码')
        return false
	}

    var bg = chrome.extension.getBackgroundPage();
    bg.username = username
	bg.password = password
    bg.autoBuyGoods();
});

document.addEventListener('DOMContentLoaded', function () {
	// var goods = chrome.extension.getBackgroundPage().goods;
    //
	// var tr = '';
    //
    // goods.forEach(function (goodsItem) {
	// 	tr += '<tr><td class="order-title">购买链接</td><td class="order-content">' + goodsItem.buyUrl + '</td><td class="seller-title">发货地址</td><td class="seller-content">' + goodsItem.addr + '</td></tr>'
	// })
    //
	// $('#content table').html(tr)
});
