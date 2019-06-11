var buyUrl = '';
var addr = '';
var goods = {};
var addrEdit = false;
var logined = true;
var queryTimer = {};
var username = '浙b8888832953';
var password = 'shanhuan11';
var pay_password = '123456';
var freshSeconds = 0;
var freshTimer = {};
var sending = false;

function autoFresh(){
    clearInterval(freshTimer)
    freshTimer = setInterval(function () {
        if (freshSeconds >= 1800) {
            clearInterval(freshTimer)
            freshSeconds = 0
            getCurrentTabId(function (tabId) {
                chrome.tabs.update(tabId, {url: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitConfirm'});
            })
        }
        freshSeconds += 1
    },1000)
}

function queryDelivery() {
    var currentUrl = urls.shift()
    if (currentUrl) {
        getCurrentTabId(function (tabId) {
            chrome.tabs.update(tabId, {url: currentUrl});
        })
    } else {
        autoFresh()
    }
}

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

function checkAlipay(host){
    var regex = /^cashier.+\.alipay\.com$/;
    var match = host.match(regex);
    if(typeof match != "undefined" && null != match)
        return true
    return false
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
    });
    return exist
}

function sendMessage(){

    if(sending){
        return false
    }

    sending = true

    $.ajax({
        url: "http://116.62.116.155:81/shopmall/plugins/sendMsg.php",
        cache: false,
        type: "POST",
        data: JSON.stringify({}),
        dataType: "json"
    }).done(function(msg) {
        setTimeout(function () {
            sending = false
        },2000)
    }).fail(function(jqXHR, textStatus) {
        setTimeout(function () {
            sending = false
        },2000)
    })
}

// 开启检查待下单商品时钟
function beginTimer() {
    clearInterval(queryTimer)
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
                clearInterval(freshTimer)
                goods = data
                getCurrentTabId(function (tabId) {
                    chrome.tabs.update(tabId, {url: 'https://member1.taobao.com/member/fresh/deliver_address.htm'});
                })
            } else {
                autoFresh()
            }
        }).fail(function(jqXHR, textStatus) {
            autoFresh()
        });
    }, 10000)
}

function autoBuyGoods() {

    $.ajax({
        url: "http://116.62.116.155:81/shopmall/plugins/query.php",
        cache: false,
        type: "POST",
        data: JSON.stringify({}),
        dataType: "json"
    }).done(function(data) {
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
        chrome.pageAction.show(tabId);
        sendMessageToContentScript({cmd:'check_login', value:'check login'}, function(response)
        {
        });
	}
    if(getDomainFromUrl(tab.url).toLowerCase()=="detail.tmall.com"){

        sendMessageToContentScript({cmd:'buy', value:'auto buy'}, function(response)
        {
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="buy.tmall.com"){

        sendMessageToContentScript({cmd:'order', value:'auto buy'}, function(response)
        {
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="member1.taobao.com"){

	    if (addrEdit === false) {
            sendMessageToContentScript({cmd:'addr', value:goods.addr}, function(response)
            {
            });
        } else {
            getCurrentTabId(function (tabId) {
                chrome.tabs.update(tabId, {url: goods.goods_url});
            })
        }

    }
    if(checkAlipay(getDomainFromUrl(tab.url).toLowerCase())){
        getCurrentTabId(function (tabId) {
            chrome.tabs.update(tabId, {url: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'});
        })
        // setTimeout(function () {
        //     addrEdit = false
        //     autoBuyGoods()
        // }, 2000)
    }

    if(tab.url === 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'){
        sendMessageToContentScript({cmd:'query', value:'auto query'}, function(response)
        {
            if (response) {
                // TODO 反馈给服务端
                $.ajax({
                    url: "http://116.62.116.155:81/shopmall/plugins/push.php",
                    cache: false,
                    type: "POST",
                    data: JSON.stringify({order_id: goods.order_id, tabao_id: response}),
                    dataType: "json"
                }).done(function(data) {
                    addrEdit = false
                    setTimeout(function () {
                        autoBuyGoods()
                    },10000)

                }).fail(function(jqXHR, textStatus) {
                    addrEdit = false
                    setTimeout(function () {
                        autoBuyGoods()
                    },10000)
                });
            }
        });
    }

    if(tab.url === 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitConfirm'){
        sendMessageToContentScript({cmd:'query_order', value:'auto query order'}, function(response)
        {
        });
    }

    if(getDomainFromUrl(tab.url).toLowerCase()=="detail.i56.taobao.com"){
        sendMessageToContentScript({cmd:'query_delivery', url:tab.url}, function(response)
        {
        });
    }

    if(getDomainFromUrl(tab.url).toLowerCase()=="login.taobao.com" || getDomainFromUrl(tab.url).toLowerCase()=="login.tmall.com"){
        sendMessage()
        sendMessageToContentScript({cmd:'login', username:username, password:password}, function(response)
        {
        });
    }

    if(getDomainFromUrl(tab.url).toLowerCase()=="shoucang.taobao.com"){
        // autoBuyGoods()
    }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
    if (request.cmd === 'addr_completed') {
        addrEdit = true
    }

    if(request.cmd == 'order_information'){
        urls = request.urls
        queryDelivery()
    }

    if(request.cmd == "delivery_information"){
        if(!request.error){
            $.ajax({
                url: "http://116.62.116.155:81/shopmall/plugins/delivery.php",
                cache: false,
                type: "POST",
                data: JSON.stringify({tabao_id:request.orderId,logi_id:request.deliveryNo,logi_name:request.deliveryName}),
                dataType: "json"
            }).done(function(msg) {
                queryDelivery();
            }).fail(function(jqXHR, textStatus) {
                queryDelivery();
            });
        }else{
            queryDelivery();
        }
    }
    if (request.cmd === 'go_login') {
        logined = false
    }
    if (request.cmd === 'logined') {
        logined = true
    }
});
