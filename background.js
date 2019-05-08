var buyUrl = '';
var addr = '';
var goods = {};
var addrEdit = false;
var queryTimer = {};
var username = '';
var password = '';

function getDomainFromUrl(url){
    var host = "null";
    if(typeof url == "undefined" || null == url)
        url = window.location.href;
    var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if(typeof match != "undefined" && null != match)
        host = match[1];
    return host;
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}

// 检查是否存在待下单商品
function checkGoodsExist() {
    var exist = false
    $.ajax({
        url: "http://116.62.116.155:81/shopmall/plugins/query.php",
        cache: false,
        type: "POST",
        data: JSON.stringify({}),
        dataType: "json"
    }).done(function(data) {
        if (data.order_id) {
            exist = true
        }
    }).fail(function(jqXHR, textStatus) {
        console.log(textStatus)
    });
    return exist
}

// 开启检查待下单商品时钟
function beginTimer() {
    queryTimer = setInterval(function () {
        $.ajax({
            url: "http://116.62.116.155:81/shopmall/plugins/query.php",
            cache: false,
            type: "POST",
            data: JSON.stringify({}),
            dataType: "json"
        }).done(function(data) {
            if (data.order_id) {
                clearInterval(queryTimer)
                goods = data
                getCurrentTabId(function (tabId) {
                    console.log('gogogogogogo')
                    console.log(tabId)
                    chrome.tabs.update(tabId, {url: 'https://member1.taobao.com/member/fresh/deliver_address.htm'});
                })
            }
        }).fail(function(jqXHR, textStatus) {
            console.log(textStatus)
        });
    }, 10000)
}

function getGoods(){
	return [
        {buyUrl: 'https://detail.tmall.com/item.htm?id=592487716061&skuId=4256959879738', addr: '何某某,13800138000,安徽省 池州市 东至县 龙泉镇 林丰村合田组,000000', checked: 0},
        {buyUrl: 'https://detail.tmall.com/item.htm?id=592487716061&skuId=4256959879742', addr: '解某,13800138000,山西省 运城市 临猗县 猗氏镇 府东街铁路机车配件厂,000000', checked: 0}
    ];
}

function autoBuyGoods() {

    $.ajax({
        url: "http://116.62.116.155:81/shopmall/plugins/query.php",
        cache: false,
        type: "POST",
        data: JSON.stringify({}),
        dataType: "json"
    }).done(function(data) {
        console.log(data)
        // 如果有待下单商品，则下单，没有则循环查
        if (data.order_id) {
            goods = data
            getCurrentTabId(function (tabId) {
                chrome.tabs.update(tabId, {url: 'https://member1.taobao.com/member/fresh/deliver_address.htm'});
            })
        } else {
            beginTimer()
        }
    }).fail(function(jqXHR, textStatus) {
        beginTimer()
    });

    // var finished = true
    //
	// for (var i=0; i<goods.length; i++) {
	// 	if (goods[i].checked === 0) {
     //        buyUrl = goods[i].buyUrl;
     //        addr = goods[i].addr;
     //        goods[i].checked = 1;
     //        goodsIndex = i;
     //        finished = false
     //        break;
	// 	} else {
	// 		continue;
	// 	}
	// }
    //
	// if (!buyUrl || !addr || finished) {
	// 	return false
	// }

    // getCurrentTabId(function (tabId) {
    //     chrome.tabs.update(tabId, {url: 'https://member1.taobao.com/member/fresh/deliver_address.htm'});
    // })
}

function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}

function checkForValidUrl(tabId, changeInfo, tab) {

	if(getDomainFromUrl(tab.url).toLowerCase()=="www.tmall.com"){
		// goods = getGoods()
        chrome.pageAction.show(tabId);
	}
    if(getDomainFromUrl(tab.url).toLowerCase()=="detail.tmall.com"){

        sendMessageToContentScript({cmd:'buy', value:'auto buy'}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="buy.tmall.com"){

        sendMessageToContentScript({cmd:'order', value:'auto buy'}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="member1.taobao.com"){

	    if (addrEdit === false) {
            sendMessageToContentScript({cmd:'addr', value:goods.addr}, function(response)
            {
                console.log('来自content的回复：'+response);
            });
        } else {
            getCurrentTabId(function (tabId) {
                chrome.tabs.update(tabId, {url: goods.goods_url});
            })
        }

    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="cashiergtj.alipay.com"){
        getCurrentTabId(function (tabId) {
            chrome.tabs.update(tabId, {url: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'});
        })
        // setTimeout(function () {
        //     addrEdit = false
        //     autoBuyGoods()
        // }, 2000)
    }

    if(getDomainFromUrl(tab.url).toLowerCase()=="buyertrade.taobao.com"){
        sendMessageToContentScript({cmd:'query', value:'auto query'}, function(response)
        {
            console.log('来自content的回复：'+response);
            if (response) {
                // TODO 反馈给服务端
                $.ajax({
                    url: "http://116.62.116.155:81/shopmall/plugins/push.php",
                    cache: false,
                    type: "POST",
                    data: JSON.stringify({order_id: goods.order_id, tabao_id: response}),
                    dataType: "json"
                }).done(function(data) {
                    console.log(data)
                    addrEdit = false
                    autoBuyGoods()
                }).fail(function(jqXHR, textStatus) {
                    console.log(textStatus)
                    addrEdit = false
                    autoBuyGoods()
                });
            }
        });
    }

    if(getDomainFromUrl(tab.url).toLowerCase()=="login.taobao.com"){
        sendMessageToContentScript({cmd:'login', username:username, password:password}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);
    sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
    if (request.cmd === 'addr_completed') {
        addrEdit = true
    }
});
