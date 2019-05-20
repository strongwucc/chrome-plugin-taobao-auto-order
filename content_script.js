// var props = $("dl.tb-prop");
// if(props.length > 0){
// 	props.each(function (propIndex) {
// 		var _this = $(this)
// 		setTimeout(function () {
//             _this.find('dd ul li:first-child')[0].click()
//         }, 500)
//     })
// }
// setTimeout(function () {
// 	$('.J_LinkBuy')[0].click()
// }, 2000)

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");

    if(request.cmd == 'check_login'){
        if($('#login-info .sn-login').length > 0){
            chrome.runtime.sendMessage({cmd: 'go_login'}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
        } else {
            chrome.runtime.sendMessage({cmd: 'logined'}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
        }
    }

    if(request.cmd == 'buy'){
        setTimeout(function () {
            $('#J_LinkBuy')[0].click()
        }, 500)
        sendResponse('我收到了你自动购买的消息！');
	}

    if(request.cmd == 'order'){
    	// 何某某,13800138000,安徽省 池州市 东至县 龙泉镇 林丰村合田组,000000
        console.log(request.value)
    	var addrInfoStr = request.value

		var addrInfoArr = addrInfoStr.split(',')
		var name = addrInfoArr[0] ? addrInfoArr[0] : ''
		var mobile = addrInfoArr[1] ? addrInfoArr[1] : ''
		var addrStr = addrInfoArr[2] ? addrInfoArr[2] : ''
		var zip = addrInfoArr[3] ? addrInfoArr[3] : ''

		var addrArr = addrStr.split(' ')
		var add_1 = addrArr[0] ? addrArr[0] : ''
		var add_2 = addrArr[1] ? addrArr[1] : ''
		var add_3 = addrArr[2] ? addrArr[2] : ''
		var add_4 = addrArr[3] ? addrArr[3] : ''

		// setTimeout(function () {
            // $('input.addAddr')[0].click()
            //
            // setTimeout(function () {
				// var iframe = $('iframe.add-addr-iframe')[0]
            //     iframe.onload = function () {
				// 	console.log(iframe.contentWindow.document)
            //     }
            // })
            // $('a.manageAddr')[0].click()

        // }, 500)

        setTimeout(function () {
            $('.go-btn')[0].click()
        }, 500)
        sendResponse('我收到了你自动下单的消息！');
    }

    if(request.cmd == 'addr'){
        // 何某某,13800138000,安徽省 池州市 东至县 龙泉镇 林丰村合田组,000000
        console.log(request.value)
        var addrInfoStr = request.value

        var addrInfoArr = addrInfoStr.split(',')
        var name = addrInfoArr[0] ? addrInfoArr[0] : ''
        var mobile = addrInfoArr[1] ? addrInfoArr[1] : ''
        var addrStr = addrInfoArr[2] ? addrInfoArr[2] : ''
        var zip = addrInfoArr[3] ? addrInfoArr[3] : ''

        var addrArr = addrStr.split(' ')
        var add_1 = addrArr[0] ? addrArr[0] : ''
        var add_2 = addrArr[1] ? addrArr[1] : ''
        var add_3 = addrArr[2] ? addrArr[2] : ''
        var add_4 = addrArr[3] ? addrArr[3] : ''
        var add_5 = addrArr[4] ? addrArr[4] : ''

		var type = ''

        setTimeout(function () {
			type = $('span.ht-type').text()
            var addrs = $('div.addressList tbody.next-table-body tr.first')
			if (type === '新增收货地址' && addrs.length > 0){
                addrs.find('a.t-change')[0].click()
                sendResponse('false');
			}else{
                sendResponse('success');
				$('div.cndzk-entrance-division-header-click')[0].click()
				setTimeout(function () {
				    if($('li.cndzk-entrance-division-box-title-level:nth-child(1)').length === 0) {
                        $('div.cndzk-entrance-division-header-click')[0].click()
                        setTimeout(function () {
                            $('li.cndzk-entrance-division-box-title-level:nth-child(1)')[0].click()
                        }, 500)
                    } else {
                        $('li.cndzk-entrance-division-box-title-level:nth-child(1)')[0].click()
                    }
					setTimeout(function () {
						$('li.cndzk-entrance-division-box-content-tag').each(function (tagIndex) {
							if($(this).text() === add_1) {
								$(this).click()
								return false
							}
                        })

                        $('li.cndzk-entrance-division-box-title-level:nth-child(2)')[0].click()
                        setTimeout(function () {
                            $('li.cndzk-entrance-division-box-content-tag').each(function (tagIndex) {
                                if($(this).text() === add_2) {
                                    $(this).click()
                                    return false
                                }
                            })
                            $('li.cndzk-entrance-division-box-title-level:nth-child(3)')[0].click()
                            setTimeout(function () {
                                $('li.cndzk-entrance-division-box-content-tag').each(function (tagIndex) {
                                    if($(this).text() === add_3) {
                                        $(this).click()
                                        return false
                                    }
                                })
                                $('li.cndzk-entrance-division-box-title-level:nth-child(4)')[0].click()
                                setTimeout(function () {
                                    var finalExist = false
                                    $('li.cndzk-entrance-division-box-content-tag').each(function (tagIndex) {
                                        if($(this).text() === add_4) {
                                            finalExist = true
                                            $(this).click()
                                            return false
                                        }
                                    })

                                    if(finalExist === false) {
                                        $('li.cndzk-entrance-division-box-content-tag')[1].click()
                                    }

									setTimeout(function () {
                                        $('textarea.cndzk-entrance-associate-area-textarea').val(add_5)
                                        $('textarea.cndzk-entrance-associate-area-textarea')[0].dispatchEvent(new Event('input',{ bubbles: true }))

                                        $('.next-input #post').val(zip)
                                        $('.next-input #post')[0].dispatchEvent(new Event('input',{ bubbles: true }))

                                        $('.next-input #fullName').val(name)
                                        $('.next-input #fullName')[0].dispatchEvent(new Event('input',{ bubbles: true }))

                                        $('.next-input #mobile').val(mobile)
                                        $('.next-input #mobile')[0].dispatchEvent(new Event('input',{ bubbles: true }))

                                        chrome.runtime.sendMessage({cmd: 'addr_completed'}, function(response) {
                                            console.log('收到来自后台的回复：' + response);
                                        });

										setTimeout(function () {
										    console.log('执行保存')
                                            $('button.next-btn-primary')[0].click()

                                            setTimeout(function () {
                                                if ($('div.next-dialog button.next-btn-primary').length > 0) {
                                                    $('div.next-dialog button.next-btn-primary')[0].click()
                                                }
                                            }, 1000)

                                        }, 1000)
                                    }, 500)

                                }, 500)
                            }, 500)
                        }, 500)

                    }, 1000)
                }, 500)
			}
        }, 500)
    }

    if (request.cmd == 'query'){
        var reactid = $('div.js-order-container').eq(0).data('reactid')
        var orderInfo = reactid.split('-')
        var orderId = orderInfo[1] ? orderInfo[1] : ''
        console.log(orderId)
        sendResponse(orderId);
    }

    if (request.cmd == 'login'){

        if ($('#J_Quick2Static').length > 0) {
            $('#J_Quick2Static').click()
        }

        setTimeout(function () {
            $('#TPL_username_1').val(request.username)
            $('#TPL_username_1')[0].dispatchEvent(new Event('input',{ bubbles: true }))

            $('#TPL_password_1').val(request.password)
            $('#TPL_password_1')[0].dispatchEvent(new Event('input',{ bubbles: true }))

            if ($('#nocaptcha').length > 0 && $('#nocaptcha').css('display') !== 'none') {
                alert('自动登录失败，需要手动登录')
            } else {
                $('#J_SubmitStatic').click()
            }
        }, 500)

    }

    // if (request.cmd == 'alipay') {
    //     $('#payPassword_rsainput').val('123456')
    //     $('#payPassword_rsainput')[0].dispatchEvent(new Event('input',{ bubbles: true }))
    //     $('#J_authSubmit').click()
    // }
});
